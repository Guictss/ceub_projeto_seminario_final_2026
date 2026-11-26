---
name: theming
description: Identidade visual do Projeto Vela Para Todos — alternância entre paleta FBVA (azul-amarelo, branch main) e paleta CEUB (roxo-magenta, branch apresentacao-ceub), configuração do tema MUI em main.jsx, componentes customizados (MuiButton, MuiCard, MuiOutlinedInput), convenções visuais herdadas do PHP original (padronagem amarela, logos invertidas, mascote Zoé, cards com borderRadius, gradient azul com overlay pattern). Use ao mexer em cores, criar nova página que deve seguir a identidade, trabalhar com assets, ou alternar entre as duas branches.
---

# Theming — FBVA ↔ CEUB

> Identidade visual do projeto, incluindo as duas paletas (FBVA no `main`, CEUB
> no `apresentacao-ceub`), config do tema MUI, e convenções visuais do PHP original.

---

## 1. Duas paletas, duas branches

### Branch `main` — Paleta FBVA (OFICIAL)

Do `style.css` do PHP original:

```
--azul:       #1D71B8   (primary.main)
--azul-med:   #1F7AC4   (primary.light)
--azul-dark:  #19629E   (primary.dark)
--amarelo:    #F9B233   (secondary.main)
--amarelo-d:  #E09F2D   (secondary.dark)
--dark:       #323232   (text.primary)
--gray:       #4A4A4A   (text.secondary)
--light-blue: #E8F3FB   (bgcolor de várias seções, user-info, cards light)
```

### Branch `apresentacao-ceub` — Paleta CEUB

```
roxo:        #662c92   (primary.main)
lilás:       #bf0087   (primary.light)
roxo-dark:   #43054e   (primary.dark)
amarelo:     #fde100   (secondary.main)
magenta:     #ec0089   (secondary.dark)
roxo-light:  #F3E6F7   (fundo claro)
```

### ⚠️ Nomes mantidos em ambas as branches

Na branch CEUB, as variáveis `AZUL`, `AZUL_DARK` etc. **apontam pros valores roxos** (nomes mantidos pra não quebrar refs). Vale limpar algum dia, mas enquanto isso o código usa o mesmo nome em ambas.

---

## 2. Configuração do tema MUI

Arquivo: `frontend/src/main.jsx`

### Estrutura típica

```jsx
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Paleta (muda entre main e apresentacao-ceub)
const AZUL = "#1D71B8";       // #662c92 em CEUB
const AZUL_MED = "#1F7AC4";   // #bf0087 em CEUB
const AZUL_DARK = "#19629E";  // #43054e em CEUB
const AMARELO = "#F9B233";    // #fde100 em CEUB
const AMARELO_DARK = "#E09F2D"; // #ec0089 em CEUB
const LIGHT_BLUE = "#E8F3FB"; // #F3E6F7 em CEUB

const theme = createTheme({
  palette: {
    primary: { main: AZUL, light: AZUL_MED, dark: AZUL_DARK },
    secondary: { main: AMARELO, dark: AMARELO_DARK },
    text: { primary: "#323232", secondary: "#4A4A4A" },
    vela: { azul: AZUL, azulMed: AZUL_MED, lightBlue: LIGHT_BLUE }, // paleta customizada
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(29,113,184,0.25)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.2s, box-shadow 0.2s",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});
```

### Fonte

```
system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```

Segoe UI no Windows — mesmo visual do PHP original.

---

## 3. Componentes customizados (overrides globais)

| Componente | Customização |
|---|---|
| `MuiButton` | `borderRadius: 8`, `textTransform: none`, `fontWeight: 600`, hover com `translateY(-1px)` + sombra azul (igual `.btn-vela-azul` do PHP) |
| `MuiCard` | `borderRadius: 12`, transition suave pra hover |
| `MuiOutlinedInput` | `borderRadius: 8` |

---

## 4. Assets visuais do projeto

Copiados em `frontend/public/assets/img/`. Referência:
```jsx
const IMG = "/assets/img";
<img src={`${IMG}/mascote.png`} />
```

| Arquivo | Uso |
|---|---|
| `logo-horizontal.png` | Navbar da landing, footer, auth esquerdo |
| `logo-vertical.png` | (opcional) alternativa à horizontal |
| `mascote.png` | **Zoé** — mascote na landing + auth esquerdo |
| `pattern-amarelo.jpg` | Faixa decorativa horizontal (topo e rodapé da landing) |
| `pattern-triangulos.jpg` | Overlay no hero da landing (opacity 0.08) + doações |
| `pattern-hexagonal.jpg` | Overlay nas notícias + auth esquerdo (opacity 0.08-0.1) |
| `infraestrutura.jpg` | Card "Infraestrutura" na landing |
| `modalidade.jpg` | Card "Sobre a modalidade" na landing |
| `noticia-1.jpg` / `noticia-2.jpg` / `noticia-3.jpg` | 3 notícias fixas da landing pública |

### Variantes CEUB

Branch `apresentacao-ceub` tem versões recoloridas:
- `mascote-ceub.png`
- `logo-horizontal-ceub.png`
- `pattern-amarelo-ceub.jpg`
- etc.

---

## 5. Convenções visuais herdadas do PHP

### Padronagem amarela

- Sempre **acima** do header e **invertida** no rodapé
- Imagem: `pattern-amarelo.jpg`

### Logos pretas → brancas em fundos escuros

```jsx
<img src={logo} style={{ filter: "brightness(0) invert(1)" }} />
```

### Mascote Zoé

- Balão de fala só **ao hover** (não permanente)
- Animação: `float 4s ease-in-out infinite`

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Seções com fundo azul

```jsx
<Box sx={{
  background: "linear-gradient(135deg, #19629E 0%, #1F7AC4 100%)",
  position: "relative",
}}>
  <Box sx={{
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${IMG}/pattern-hexagonal.jpg)`,
    opacity: 0.08,  // ou 0.1
    pointerEvents: "none",
  }} />
  {/* conteúdo */}
</Box>
```

### Cards estilo PHP

```jsx
<Card sx={{
  borderRadius: 12,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(29,113,184,0.2)",
  },
}}>
```

### Botões primários com bordaTop colorida

- **Amarelo em cards azuis** (contraste)
- **Azul em cards brancos**

Dá destaque visual sem ocupar espaço do card.

### Ícones em círculos coloridos

```jsx
<Box sx={{
  width: 90,
  height: 90,
  borderRadius: "50%",
  bgcolor: "primary.main",   // ou secondary.main pra contrastar
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}>
  <IconeDoProjeto sx={{ color: "white", fontSize: 48 }} />
</Box>
```

### Navbar admin

- Fundo **branco**
- `borderBottom: "4px solid #F9B233"` (amarelo FBVA / amarelo CEUB)
- Logo horizontal
- Pill azul-claro com avatar + chip de papel + botão Sair amarelo

### Login/Cadastro split-screen

- **Coluna esquerda:** gradient azul + pattern-hexagonal + mascote animado + título branco
- **Coluna direita:** form branco

Padrão replicado em `/login` e `/cadastro`.

---

## 6. Mobile-first (requisito)

- `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` em listagens
- Navbar interna: `useMediaQuery(theme.breakpoints.down("md"))` pra Drawer hamburger
- Landing pública: Drawer hamburger no mobile (em `components/HeaderLanding.jsx`)
- Container padrão: `<Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>`
- Forms: `<Stack direction={{ xs: "column", sm: "row" }}>`

---

## 7. Como alternar entre temas

### Branches separadas

- `main` → tema FBVA (azul-amarelo)
- `apresentacao-ceub` → tema CEUB (roxo-magenta)

Alternar: `git checkout <branch>` + `npm run dev`.

### Deploy correspondente

- `main` → Vercel production → https://vela-para-todos.vercel.app
- `apresentacao-ceub` → Vercel preview → https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app

### ⚠️ Backend é único (branch `main` do backend sempre)

Significa que o **PDF de relatório sai sempre com cores FBVA**, mesmo acessado pelo frontend CEUB. Fix pendente: query param `?tema=ceub` + lógica no `pdf_relatorio.py`.

---

## 8. Tips de evolução futura

### PDF multi-tema (pendente)

- Backend aceita `?tema=ceub` no `/relatorios/inscricoes.pdf`
- `services/pdf_relatorio.py` lê o tema e escolhe paleta
- Frontend CEUB passa esse query param

### Limpar nomes de variáveis CEUB

Hoje a branch CEUB reutiliza `AZUL`, `AZUL_DARK` com valores roxos. Idealmente renomear pra `PRIMARY`, `PRIMARY_DARK` em ambas as branches, mas mexer nisso quebra refs em vários lugares.

### Design system formal

Documentar as paletas, componentes e padrões como um design system (Storybook, Figma). Hoje tudo vive no `main.jsx` + CLAUDE.md.

---

## 📚 Skills relacionados

- `/pegadinhas-frontend` — MUI breaking changes relevantes
- `/deploy` — como main e apresentacao-ceub são deployadas
- `/troubleshooting` — encoding em `main.jsx`
