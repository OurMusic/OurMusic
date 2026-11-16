# OurMusic — Front-end (React + TypeScript + Vite)

Interface web da plataforma **OurMusic**, construída fielmente a partir da modelagem do Figma ([OurMusic Design](https://www.figma.com/design/RdQtqDqQx5fwPlnANq7BMi/OurMusic?node-id=0-1&p=f&t=LHLDAVjy6jjIZo1i-0)) e estruturada segundo a arquitetura do projeto **Event+** (`eventplus`), integrada com a API REST **`OurMusic.WebAPI`**.

## Executar o projeto

```bash
npm install
npm run dev
```

Por padrão, o cliente Axios (`src/services/api.ts`) aponta para `https://localhost:7134/api/` (configuração HTTPS do `OurMusic.WebAPI`). Caso necessário, defina `VITE_API_URL` em um arquivo `.env`.

## Telas e Rotas (Modelagem Figma `RdQtqDqQx5fwPlnANq7BMi`)

| Rota | Tela no Figma | Perfil |
|---|---|---|
| `/login` | Autenticação (`2:6362`) | Público |
| `/catalogo` | Catálogo de músicas (`2:6421`) | Autenticado |
| `/musicas/:id` | Detalhes da música + Caixa de comentários (`2:6575` / `39:2`) | Autenticado |
| `/musicas/nova` | Cadastro de música (`15:656`) | Autenticado |
| `/musicas/editar/:id` | Edição de música (`2:6892`) | Admin |
| `/admin/musicas` | Administração de músicas (`2:6687`) | Admin |
| `/generos` | Gerenciamento de gêneros (`13:4`) | Admin |
| `/generos/novo` | Cadastro de gênero (`21:269`) | Admin |
| `/generos/editar/:id` | Edição de gênero (`21:442`) | Admin |
| `/usuarios` | Gerenciamento de usuários (`2:7027`) | Admin |
| `/usuarios/novo` | Cadastro de usuário (`13:249`) | Admin |
| `/usuarios/editar/:id` | Edição de usuário (`21:126`) | Admin |
| `/perfil` | Meu perfil (`21:608` / `21:802`) | Autenticado |
| `/perfil/editar` | Editar meu perfil (`21:699` / `21:894`) | Autenticado |
