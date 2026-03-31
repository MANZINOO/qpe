# Requirements Non Funzionali - QPE

## RNF01 - Performance
Il tempo di caricamento della home deve essere inferiore a 2 secondi su connessione 4G. Il vote screen deve rispondere al tap in meno di 100ms.

## RNF02 - Scalabilita
L'architettura deve supportare fino a 10.000 utenti concorrenti senza degrado delle performance grazie a Firestore e CDN.

## RNF03 - Sicurezza
Tutte le comunicazioni devono avvenire su HTTPS. I dati sensibili devono essere criptati. L'autenticazione deve supportare 2FA.

## RNF04 - Usabilita
L'interfaccia deve essere intuitiva e utilizzabile senza tutorial. Il layout coupe deve essere immediatamente comprensibile.

## RNF05 - Compatibilita
L'applicazione web deve funzionare su Chrome, Firefox, Safari e Edge nelle ultime 2 versioni. Il design deve essere responsive per mobile, tablet e desktop.

## RNF06 - Manutenibilita
Il codice deve seguire le best practice React con componenti modulari e riutilizzabili. Il codice deve essere documentato con commenti JSDoc.

## RNF07 - Privacy
Compliance GDPR completa. Nessun dato personale condiviso con terze parti senza consenso esplicito. Dati aggregati per advertiser sempre anonimi.

## RNF08 - Disponibilita
Uptime target del 99.5% grazie a Firebase hosting e Vercel CDN.
