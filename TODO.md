# TODO — QPé

## Completato
- [x] Setup repo GitHub con struttura corretta
- [x] Cookie Banner GDPR con 3 livelli di consenso
- [x] Privacy Policy e Cookie Policy
- [x] Export dati personali (JSON) e eliminazione account (GDPR)
- [x] Firebase Authentication — email/password + Google OAuth
- [x] Registrazione con selezione categorie di interesse
- [x] Profilo utente su Firestore con fallback locale
- [x] Home feed dinamico con query Firestore
- [x] Tab "Per te" e "Seguiti"
- [x] Creazione sondaggio con preview live e color picker
- [x] Pagina voto coupé a schermo intero
- [x] Percentuali e risultati post-voto
- [x] Annullamento voto
- [x] Sistema like con toggle
- [x] Statistiche autore (votanti + liker con nickname)
- [x] Protezione autovoto e autolike
- [x] Modifica profilo (username, bio) con salvataggio Firestore
- [x] Layout responsive full-width (mobile → desktop)
- [x] Tema dark Instagram-style su tutte le pagine
- [x] Sicurezza: chiave API Firebase spostata in variabili d'ambiente `.env`

---

## In corso / Prossimi step

### Feature principali
- [ ] Follow / Unfollow utenti
- [ ] Notifiche (nuovo follower, voto ricevuto, like ricevuto)
- [ ] Pagina profilo pubblico (`/u/:username`)
- [ ] Swipe verticale tra sondaggi (mobile)
- [ ] Commenti sui sondaggi

### Miglioramenti
- [ ] Upload avatar profilo (Firebase Storage)
- [ ] Sondaggi per trending / più votati
- [ ] Filtro sondaggi per categoria
- [ ] Contatore sondaggi reali nel profilo
- [ ] Paginazione / infinite scroll nel feed

### Business
- [ ] Pagina `/advertise` per inserzionisti
- [ ] Media kit PDF
- [ ] Algoritmo raccomandazione v1
- [ ] Bot moderazione base

### Deploy
- [ ] Deploy frontend su Vercel o Firebase Hosting
- [ ] Configurare dominio personalizzato
- [ ] Variabili d'ambiente su Vercel
