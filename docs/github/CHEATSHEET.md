Gestione Codice Sorgente — QPé
================================
[TOC]

v1.0.0 - 07/04/2026

Le principali pratiche di gestione del codice adottate nel progetto QPé:

- **Branching** — utilizzo di branch per sviluppare nuove funzionalità e correggere bug senza toccare `main`
- **Commit** — messaggi chiari e descrittivi per tracciare ogni modifica
- **Pull Requests** — revisione del codice prima della fusione in `main`
- **Versioning** — tag semantici per marcare le release (es. `v0.4.0`)
- **Documentazione** — README, CHANGELOG e docs/ sempre aggiornati
- **Issue Tracking** — GitHub Issues per bug, feature request e attività

---

# Comandi Git essenziali (CLI)

```bash
# Verifica installazione
git --version

# Inizializzare un nuovo repository
git init
git status

# Configurare le informazioni utente
git config --global user.email "tua_email@example.com"
git config --global user.name "tuo_username_github"

# Elenco configurazioni
git config --list

# Clonare il repository QPé
git clone https://github.com/MANZINOO/qpe.git
cd qpe

# Stato del progetto
git status

# Aggiungere file allo stage (preparare il commit)
git add <file1> <file2>
git add .                      # aggiunge tutti i file modificati

# Eseguire un commit
git commit -m "feat: descrizione breve della modifica"

# Log dei commit (compatto)
git log --oneline

# Correggere l'ultimo commit (messaggio o file dimenticato)
git commit --amend --no-edit

# ── Branch ──────────────────────────────────────────────────────────────────

# Creare e passare a un nuovo branch
git checkout -b nome-branch

# Lista branch locali
git branch

# Spostarsi su un branch esistente
git checkout nome-branch

# Eliminare un branch locale (dopo merge)
git branch -d nome-branch

# ── Remote ──────────────────────────────────────────────────────────────────

# Aggiungere il remote origin
git remote add origin https://github.com/MANZINOO/qpe.git

# Verificare i remote configurati
git remote -v

# Scaricare aggiornamenti dal remote (senza merge automatico)
git fetch origin

# Scaricare e unire aggiornamenti
git pull origin main

# Inviare modifiche al remote
git push origin main
git push origin nome-branch

# ── Annullare modifiche ──────────────────────────────────────────────────────

# Ripristinare un file al suo stato nell'ultimo commit
git checkout -- <nome-file>

# Rimuovere file dall'area di stage (senza eliminarlo)
git reset HEAD <nome-file>

# Tornare all'ultimo commit (ATTENZIONE: perde le modifiche non committate)
git reset --hard HEAD

# Annullare l'ultimo commit mantenendo le modifiche
git reset --soft HEAD^

# Creare un commit di "inversione" (sicuro, non riscrive la storia)
git revert --no-edit HEAD

# ── Tag ─────────────────────────────────────────────────────────────────────

# Creare un tag per la release
git tag v0.4.0
git tag -a v0.4.0 -m "Release versione 0.4.0"

# Inviare i tag al remote
git push origin --tags

# ── Utility ─────────────────────────────────────────────────────────────────

# Vedere le differenze tra working directory e stage
git diff

# Vedere le differenze tra stage e ultimo commit
git diff --staged

# Salvare temporaneamente le modifiche senza committare
git stash
git stash pop            # ripristina l'ultimo stash
git stash list           # lista degli stash salvati
```

---

# Convenzioni messaggi di commit (QPé)

Il progetto QPé usa il formato [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descrizione breve
```

| Tipo | Quando usarlo |
|---|---|
| `feat` | Nuova funzionalità |
| `fix` | Correzione di un bug |
| `docs` | Modifica alla documentazione |
| `style` | Formattazione CSS, senza logica |
| `refactor` | Ristrutturazione codice senza nuove feature |
| `chore` | Aggiornamento dipendenze, configurazioni |
| `security` | Fix di sicurezza |

**Esempi:**
```
feat(feed): aggiunta tab Tendenze per utenti non loggati
fix(home): catch block usa activeTab invece di tab
docs: aggiornamento README con manuale utente
security: rimossa API key Firebase hardcodata
```

---

# Risorse

- Documentazione Git ufficiale: https://git-scm.com/doc
- GitHub Guides: https://github.com/git-guides
- GitHub Docs: https://docs.github.com/en
- Conventional Commits: https://www.conventionalcommits.org/
- Semantic Versioning: https://semver.org/
