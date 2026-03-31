# QPE - Social Network basato su Sondaggi

QPE e un social network incentrato su sondaggi binari. Il nome richiama la parola "coupe" perche la schermata di voto e letteralmente divisa in due meta verticali, una per ogni opzione.

Progetto scolastico GPOI.

## Stack Tecnico

- **Frontend:** React + Vite
- **Backend:** Node.js + Firebase (Auth + Firestore)
- **Hosting:** Vercel (frontend) + Firebase (backend)
- **Auth:** Firebase Authentication

## Avvio Rapido

```bash
# Installa dipendenze frontend
cd src/frontend
npm install

# Avvia dev server
npm run dev
```

## Struttura Repository

```
qpe/
├── docs/
│   ├── fattibilita/
│   │   ├── README.md
│   │   ├── requirements/
│   │   │   ├── requirements_1.md
│   │   │   └── requirements_2.md
│   │   └── template_gantt.xlsx
│   ├── github/
│   ├── economy_finance/
│   │   └── break_even_point.md
│   ├── project_management/
│   └── cookies_gdpr/
│       └── README.md
├── src/
│   ├── frontend/
│   ├── backend/
│   └── tests/
├── README.md
├── CHANGELOG.md
├── TODO.md
└── LICENSE
```

## Licenza

MIT License - vedi file [LICENSE](LICENSE).
