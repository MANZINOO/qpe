GitHub Tasks — QPé
==================
[TOC]

v1.0.0 - 07/04/2026

Guida alle funzionalità GitHub utilizzate nel progetto QPé.

---

# Risorse ufficiali

- GitHub Docs: https://docs.github.com/en
- GitHub Guides: https://github.com/git-guides
- Introduzione a GitHub (Microsoft Learn): https://learn.microsoft.com/en-us/training/modules/introduction-to-github/2-what-is-github

---

# Branch, Commit, Pull Request e Flow

Introduzione ai componenti principali del GitHub Flow:
https://learn.microsoft.com/en-us/training/modules/introduction-to-github/3-components-of-github-flow

Il **GitHub Flow** adottato dal progetto QPé:

```
main (stabile)
  └── feature/nome-feature    ← sviluppo
        └── commit, commit...
              └── Pull Request → review → merge in main
```

1. Crea un branch da `main` per ogni feature o fix
2. Fai i commit con messaggi descrittivi
3. Apri una Pull Request verso `main`
4. Revisiona il codice (almeno un reviewer)
5. Fai il merge dopo l'approvazione
6. Elimina il branch feature dopo il merge

---

# Issues

Documentazione GitHub Issues:
https://learn.microsoft.com/en-us/training/modules/introduction-to-github/4-collaborative-platform

Le **Issues** di QPé vengono utilizzate per:

- **Bug** — comportamenti inattesi da correggere
- **Feature request** — nuove funzionalità da implementare
- **Task** — attività di sviluppo o documentazione
- **Question** — domande tecniche aperte

## Template issue usati nel progetto

**Bug report:**
```
## Descrizione del bug
Breve descrizione del problema.

## Come riprodurlo
1. Vai su '...'
2. Clicca su '...'
3. Vedi l'errore

## Comportamento atteso
Cosa dovrebbe succedere.

## Screenshot
(se applicabile)

## Ambiente
- Browser: Chrome / Firefox / Safari
- OS: Windows / Mac / iOS / Android
```

**Feature request:**
```
## Funzionalità richiesta
Descrizione della funzionalità.

## Motivazione
Perché sarebbe utile?

## Soluzione proposta
(opzionale) Come potresti implementarla.
```

---

# GitHub Projects (Kanban)

Il progetto QPé usa GitHub Projects per tracciare lo stato delle attività:

| Colonna | Significato |
|---|---|
| **Backlog** | Task pianificati ma non ancora iniziati |
| **In Progress** | Task in corso di sviluppo |
| **Review** | PR aperta, in attesa di revisione |
| **Done** | Task completati e chiusi |

---

# GitHub Pages

Documentazione ufficiale:
https://docs.github.com/en/pages/getting-started-with-github-pages

GitHub Pages permette di pubblicare siti statici direttamente da un repository GitHub. Per QPé è usato per:

- Hosting della documentazione del progetto
- Cartella `public/` nella root per file statici con URL pubblico (es. immagini, PDF)

Per abilitare GitHub Pages:
1. Vai su **Settings → Pages**
2. Seleziona il branch `main` e la cartella `/root` o `/docs`
3. Salva — il sito sarà disponibile a `https://manzinoo.github.io/qpe/`

---

# Release

QPé usa le **GitHub Releases** per marcare versioni ufficiali:

1. Vai su **Releases → Create a new release**
2. Seleziona il tag (es. `v0.4.0`)
3. Titolo: `QPé v0.4.0`
4. Corpo: copia le note dal `CHANGELOG.md`
5. Allega eventuali build (zip della cartella `dist/`)
6. Pubblica

---

# Checklist repository QPé

- [x] README.md con manuale utente e setup sviluppatori
- [x] CHANGELOG.md con formato Keep a Changelog
- [x] LICENSE (MIT)
- [x] TODO.md aggiornato
- [x] .gitignore che esclude `.env`, `node_modules`, `dist/`
- [x] `.env.example` come template sicuro
- [x] `docs/` con tutta la documentazione di progetto
- [x] `firestore.rules` con regole di sicurezza
- [x] Issues aperte per feature future
- [ ] GitHub Pages abilitato
- [ ] Release taggata per ogni versione stabile
