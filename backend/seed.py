"""Popula o banco com dados de demonstração.

Idempotente: pode ser chamado múltiplas vezes sem duplicar registros —
se o banco já tem usuários, não faz nada. É pensado para rodar no primeiro
deploy em produção, para que a tela de demo tenha dados iniciais.

Uso local:       python seed.py
Uso no Render:   adicionar ao build command (ver instruções de deploy)
"""
from datetime import date, time, timedelta
from decimal import Decimal

from app import create_app
from extensions import db
from models import Aula, Doacao, Inscricao, Noticia, Usuario, Voluntario


def seed():
    app = create_app()
    with app.app_context():
        # Idempotência: se já tem usuários, considera que o seed já rodou
        if Usuario.query.first() is not None:
            print("[seed] Banco já tem usuários — nada a fazer.")
            return

        print("[seed] Banco vazio detectado. Populando dados de demo...")

        # ── Usuários ────────────────────────────────────────────────────
        carlos = Usuario(
            nome="Carlos Andrade",
            email="carlos@teste.com",
            data_nascimento=date(1985, 3, 20),
            papel="professor",
        )
        carlos.set_senha("Senha123!")

        ana = Usuario(
            nome="Ana Pereira",
            email="ana@teste.com",
            data_nascimento=date(1990, 7, 22),
            papel="professor",
        )
        ana.set_senha("Senha123!")

        maria = Usuario(
            nome="Maria Silva",
            email="maria@teste.com",
            data_nascimento=date(2000, 3, 15),
            papel="aluno",
        )
        maria.set_senha("Senha123!")

        joao = Usuario(
            nome="João Santos",
            email="joao@teste.com",
            data_nascimento=date(2001, 11, 3),
            papel="aluno",
        )
        joao.set_senha("Senha123!")

        beatriz = Usuario(
            nome="Beatriz Lima",
            email="beatriz@teste.com",
            data_nascimento=date(2000, 9, 18),
            papel="aluno",
        )
        beatriz.set_senha("Senha123!")

        db.session.add_all([carlos, ana, maria, joao, beatriz])
        db.session.flush()  # garante os IDs para FKs

        print(f"[seed] Criados {5} usuários.")

        # ── Aulas (próximos 30 dias) ────────────────────────────────────
        hoje = date.today()
        aulas = [
            Aula(professor_id=carlos.id, data=hoje + timedelta(days=4),
                 horario=time(9, 0), duracao_min=90, vagas=10,
                 descricao="Introdução à Vela Adaptada"),
            Aula(professor_id=carlos.id, data=hoje + timedelta(days=6),
                 horario=time(14, 0), duracao_min=120, vagas=8,
                 descricao="Técnicas de Navegação Costeira"),
            Aula(professor_id=ana.id, data=hoje + timedelta(days=11),
                 horario=time(10, 0), duracao_min=60, vagas=12,
                 descricao="Segurança no Mar e Primeiros Socorros"),
            Aula(professor_id=carlos.id, data=hoje + timedelta(days=14),
                 horario=time(15, 30), duracao_min=90, vagas=6,
                 descricao="Regata para Iniciantes"),
            Aula(professor_id=ana.id, data=hoje + timedelta(days=19),
                 horario=time(9, 0), duracao_min=120, vagas=15,
                 descricao="Vela em Dupla - Comunicação e Coordenação"),
        ]
        db.session.add_all(aulas)
        db.session.flush()
        print(f"[seed] Criadas {len(aulas)} aulas.")

        # ── Inscrições ──────────────────────────────────────────────────
        inscricoes = [
            Inscricao(aluno_id=maria.id, aula_id=aulas[0].id),
            Inscricao(aluno_id=maria.id, aula_id=aulas[2].id),
            Inscricao(aluno_id=joao.id,  aula_id=aulas[0].id),
            Inscricao(aluno_id=joao.id,  aula_id=aulas[1].id),
            Inscricao(aluno_id=beatriz.id, aula_id=aulas[0].id),
            Inscricao(aluno_id=beatriz.id, aula_id=aulas[3].id),
        ]
        db.session.add_all(inscricoes)
        print(f"[seed] Criadas {len(inscricoes)} inscrições.")

        # ── Notícias ────────────────────────────────────────────────────
        noticias = [
            Noticia(
                titulo="Projeto social ensina pessoas com deficiência a velejar",
                conteudo=(
                    "A TV Record Brasília exibiu uma reportagem no programa "
                    "DF no AR sobre o projeto social Vela Para Todos. "
                    "A iniciativa oferece aulas gratuitas de vela adaptada "
                    "para pessoas com deficiência física, no Lago Paranoá."
                ),
                imagem="/assets/img/noticia-1.jpg",
            ),
            Noticia(
                titulo="Lago Paranoá recebe Copa BRB da Vela Adaptada",
                conteudo=(
                    "A competição para pessoas com deficiência será "
                    "realizada neste sábado, na Semana da Pessoa com "
                    "Deficiência. Atletas de todo o DF competirão em "
                    "diversas categorias."
                ),
                imagem="/assets/img/noticia-2.jpg",
            ),
            Noticia(
                titulo="Brasiliense é a primeira brasileira campeã mundial de vela adaptada",
                conteudo=(
                    "Do Correio Braziliense — A gaúcha radicada em Brasília "
                    "Ana Paula Marques se tornou campeã mundial aos 35 anos, "
                    "após disputar provas na Holanda. É a primeira brasileira "
                    "a alcançar esse título na modalidade."
                ),
                imagem="/assets/img/noticia-3.jpg",
            ),
        ]
        db.session.add_all(noticias)
        print(f"[seed] Criadas {len(noticias)} notícias.")

        # ── Doações ─────────────────────────────────────────────────────
        doacoes = [
            Doacao(nome_doador="Rodrigo Mendes",     valor=Decimal("1000.00"), forma_pagamento="pix"),
            Doacao(nome_doador="Fundação Mar Azul",  valor=Decimal("500.50"),  forma_pagamento="transferencia"),
            Doacao(nome_doador="Patricia Costa",     valor=Decimal("250.00"),  forma_pagamento="pix"),
            Doacao(nome_doador="Lucas Oliveira",     valor=Decimal("150.75"),  forma_pagamento="paypal"),
            Doacao(nome_doador="Camila Rodrigues",   valor=Decimal("780.00"),  forma_pagamento="transferencia"),
            Doacao(nome_doador="Anônimo",            valor=Decimal("50.00"),   forma_pagamento="pix"),
        ]
        db.session.add_all(doacoes)
        print(f"[seed] Criadas {len(doacoes)} doações.")

        # ── Voluntários ─────────────────────────────────────────────────
        voluntarios = [
            Voluntario(
                nome="Camila Rocha",
                email="camila.rocha@email.com",
                mensagem="Instrutora de vela há 10 anos, moro perto do lago e tenho total disponibilidade.",
                status="aprovado",
            ),
            Voluntario(
                nome="Roberto Lima",
                email="roberto@email.com",
                mensagem="Sou enfermeiro e posso ajudar com primeiros socorros durante as atividades náuticas.",
                status="aprovado",
            ),
            Voluntario(
                nome="Ana Mendes",
                email="ana.mendes@email.com",
                mensagem="Tenho experiência como educadora física adaptada e gostaria muito de contribuir com as aulas nos fins de semana.",
                status="pendente",
            ),
        ]
        db.session.add_all(voluntarios)
        print(f"[seed] Criados {len(voluntarios)} voluntários.")

        # Commit final
        db.session.commit()
        print("[seed] ✓ Seed concluído com sucesso.")


if __name__ == "__main__":
    seed()
