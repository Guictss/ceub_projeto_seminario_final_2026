"""Serviço de geração de PDF de relatório de inscrições."""
from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
)

AZUL_FBVA = colors.HexColor("#1D71B8")
AMARELO_FBVA = colors.HexColor("#F9B233")
CINZA_CLARO = colors.HexColor("#F2F2F2")
CINZA_ESCURO = colors.HexColor("#4A4A4A")


def _construir_estilos():
    base = getSampleStyleSheet()
    return {
        "titulo": ParagraphStyle("Titulo", parent=base["Title"],
            fontName="Helvetica-Bold", fontSize=20, textColor=AZUL_FBVA,
            alignment=TA_CENTER, spaceAfter=6),
        "subtitulo": ParagraphStyle("Subtitulo", parent=base["Normal"],
            fontName="Helvetica", fontSize=10, textColor=CINZA_ESCURO,
            alignment=TA_CENTER, spaceAfter=18),
        "secao": ParagraphStyle("Secao", parent=base["Heading2"],
            fontName="Helvetica-Bold", fontSize=14, textColor=AZUL_FBVA,
            spaceBefore=12, spaceAfter=8),
        "aula_titulo": ParagraphStyle("AulaTitulo", parent=base["Heading3"],
            fontName="Helvetica-Bold", fontSize=12,
            textColor=colors.white, alignment=TA_LEFT),
        "normal": ParagraphStyle("NormalCustom", parent=base["Normal"],
            fontName="Helvetica", fontSize=10),
    }


def _desenhar_rodape(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Oblique", 8)
    canvas.setFillColor(CINZA_ESCURO)
    texto = (
        f"Federação Brasileira de Vela Adaptada (FBVA) — "
        f"Página {doc.page}"
    )
    canvas.drawCentredString(A4[0] / 2, 1.2 * cm, texto)
    canvas.restoreState()


def _construir_cabecalho(estilos, filtros):
    agora = datetime.now().strftime("%d/%m/%Y às %H:%M")
    partes_filtro = []
    if filtros.get("data_inicio"):
        partes_filtro.append(f"de {filtros['data_inicio']}")
    if filtros.get("data_fim"):
        partes_filtro.append(f"até {filtros['data_fim']}")
    if filtros.get("professor_nome"):
        partes_filtro.append(f"professor: {filtros['professor_nome']}")
    linha_filtros = " | ".join(partes_filtro) if partes_filtro else "todos os registros"

    return [
        Paragraph("Relatório de Inscrições em Aulas", estilos["titulo"]),
        Paragraph(
            f"Gerado em {agora} &nbsp;•&nbsp; Filtros: {linha_filtros}",
            estilos["subtitulo"],
        ),
    ]


def _construir_resumo(estilos, aulas):
    total_aulas = len(aulas)
    total_inscricoes = sum(len(a.inscricoes) for a in aulas)
    alunos_unicos = {
        insc.aluno_id for a in aulas for insc in a.inscricoes
    }
    total_vagas = sum(a.vagas for a in aulas)
    taxa_ocupacao = (
        (total_inscricoes / total_vagas * 100) if total_vagas else 0.0
    )

    dados = [
        ["Total de aulas", "Inscrições", "Alunos únicos", "Ocupação média"],
        [
            str(total_aulas),
            str(total_inscricoes),
            str(len(alunos_unicos)),
            f"{taxa_ocupacao:.1f}%",
        ],
    ]

    tabela = Table(dados, colWidths=[4 * cm] * 4)
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AZUL_FBVA),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("FONTSIZE", (0, 1), (-1, 1), 16),
        ("TEXTCOLOR", (0, 1), (-1, 1), AZUL_FBVA),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 1), (-1, 1), 10),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 10),
        ("BACKGROUND", (0, 1), (-1, 1), CINZA_CLARO),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.white),
    ]))

    return [
        Paragraph("Resumo Executivo", estilos["secao"]),
        tabela,
        Spacer(1, 0.5 * cm),
    ]


def _formatar_data_inscricao(insc):
    """Retorna a data da inscrição formatada, com fallback."""
    for attr in ("inscrito_em", "criado_em", "data_inscricao"):
        valor = getattr(insc, attr, None)
        if valor:
            return valor.strftime("%d/%m/%Y %H:%M")
    return "—"


def _construir_bloco_aula(aula, estilos):
    data_fmt = (
        f"{aula.data.strftime('%d/%m/%Y')} "
        f"às {aula.horario.strftime('%H:%M')}"
    )
    inscritos_count = len(aula.inscricoes)
    cabecalho_aula = (
        f"<b>{aula.descricao}</b> &nbsp;•&nbsp; "
        f"{data_fmt} &nbsp;•&nbsp; "
        f"{inscritos_count}/{aula.vagas} vagas"
    )

    barra = Table(
        [[Paragraph(cabecalho_aula, estilos["aula_titulo"])]],
        colWidths=[17 * cm],
    )
    barra.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), AZUL_FBVA),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))

    meta_aula = (
        f"<b>Professor:</b> {aula.professor.nome} &nbsp; | &nbsp; "
        f"<b>Duração:</b> {aula.duracao_min} minutos"
    )

    flowables = [
        barra,
        Spacer(1, 0.2 * cm),
        Paragraph(meta_aula, estilos["normal"]),
        Spacer(1, 0.25 * cm),
    ]

    if inscritos_count == 0:
        flowables.append(
            Paragraph("<i>Nenhum aluno inscrito nesta aula.</i>",
                      estilos["normal"])
        )
    else:
        linhas = [["#", "Nome", "E-mail", "Inscrito em"]]
        for i, insc in enumerate(aula.inscricoes, start=1):
            linhas.append([
                str(i),
                insc.aluno.nome,
                insc.aluno.email,
                _formatar_data_inscricao(insc),
            ])

        tabela_inscritos = Table(
            linhas,
            colWidths=[1 * cm, 5.5 * cm, 6.5 * cm, 4 * cm],
            repeatRows=1,
        )
        tabela_inscritos.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), AMARELO_FBVA),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CINZA_CLARO]),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]))
        flowables.append(tabela_inscritos)

    flowables.append(Spacer(1, 0.6 * cm))
    return flowables


def gerar_pdf_inscricoes(aulas, filtros=None):
    filtros = filtros or {}
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="Relatório de Inscrições - FBVA",
        author="Projeto Vela Para Todos",
    )

    estilos = _construir_estilos()
    story = []
    story.extend(_construir_cabecalho(estilos, filtros))
    story.extend(_construir_resumo(estilos, aulas))

    if not aulas:
        story.append(Paragraph(
            "Nenhuma aula encontrada com os filtros aplicados.",
            estilos["normal"],
        ))
    else:
        story.append(Paragraph("Detalhamento por Aula", estilos["secao"]))
        for aula in aulas:
            story.extend(_construir_bloco_aula(aula, estilos))

    doc.build(story, onFirstPage=_desenhar_rodape, onLaterPages=_desenhar_rodape)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
