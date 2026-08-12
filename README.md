# BARBA10 — Aplicativo de Agendamento de Barbearia

**BARBA10** é uma aplicação web progressiva (PWA) de agendamento online desenvolvida para barbearias de alto padrão.

## Recursos Principais

- **Identidade Visual Premium**: Layout escuro moderno em tons de preto (`#000000`), carvão (`#111111`), amarelo dourado (`#DAA520`) e branco.
- **Strictly No Emojis**: 100% dos elementos visuais utilizam ícones vetoriais da biblioteca `lucide-react`.
- **Fluxo Completo de Agendamento**:
  - Etapa 1: Seleção de Data e Horário (com bloqueio automático de horários que já passaram e agrupamento por turnos Manhã/Tarde/Noite).
  - Etapa 2: Seleção de Barbeiro (com intervalo de almoço individual por profissional).
  - Etapa 3: Seleção de Serviços & Combos (regra de exclusividade: múltiplos serviços individuais OU apenas um combo).
  - Etapa 4: Resumo e dados de contato do cliente.
  - Etapa 5: Animação de Agendamento e validação de conflito de última hora.
  - Etapa 6: Tela de Sucesso.
- **Motor Central de Disponibilidade**: Validação precisa considerando horário de funcionamento, intervalo de almoço do barbeiro, agendamentos existentes, horários passados e duração total do serviço.
- **Gestão de Agendamentos (Meus Agendamentos)**:
  - Reagendamento com busca de novos horários livres.
  - Cancelamento seguro com confirmação via modal.
  - Edição de serviços contratados com recalculador de preço e duração.
- **PWA Pronto**: Suporte para instalação na tela inicial no Android, iOS, Tablet e Desktop.
- **Persistência Dupla**: Armazenamento local e integração estruturada com Firebase Firestore (`firebase-blueprint.json` e `firestore.rules`).

## Estrutura de Pastas

```
/
├── index.html
├── metadata.json
├── package.json
├── vite.config.ts
├── netlify.toml
├── firebase-blueprint.json
├── firestore.rules
├── public/
│   ├── manifest.webmanifest
│   └── service-worker.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── Sidebar.tsx
    │   ├── BottomNav.tsx
    │   ├── Toast.tsx
    │   ├── Modal.tsx
    │   └── PwaInstallPrompt.tsx
    ├── context/
    │   ├── AppContext.tsx
    │   └── ThemeContext.tsx
    ├── data/
    │   └── initialData.ts
    ├── pages/
    │   ├── AgendamentoPage.tsx
    │   ├── MeusAgendamentosPage.tsx
    │   ├── FeedPage.tsx
    │   ├── BarbeariaPage.tsx
    │   ├── ServicosPage.tsx
    │   └── BarbeirosPage.tsx
    └── utils/
        └── availability.ts
```

## Publicação no Netlify

1. Faça o push do repositório para o GitHub.
2. Conecte seu repositório no Netlify.
3. O arquivo `netlify.toml` já está configurado com `command = "npm run build"`, `publish = "dist"` e redirecionamento SPA `/* -> /index.html 200`.

---
Desenvolvido para **BARBA10 — Seu estilo, seu momento.**
