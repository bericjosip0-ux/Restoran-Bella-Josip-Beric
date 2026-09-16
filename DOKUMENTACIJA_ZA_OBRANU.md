# Kratko objašnjenje projekta za obranu

## 1. Osnovna ideja projekta

Restoran Bella je višestranična web aplikacija izrađena u HTML-u, CSS-u i JavaScriptu. Naknadno je dodan Node.js/Express backend kako bi se jela, korisnici, narudžbe i rezervacije mogli spremati izvan samog preglednika.

Frontend i backend komuniciraju pomoću `fetch()` zahtjeva i REST API ruta. Za završni rad podatci se spremaju u JSON datoteke jer je takva pohrana jednostavna za prikaz i objašnjenje.

## 2. Kako registracija radi

Obrazac na `registracija.html` šalje ime, email i lozinku na rutu `POST /api/registracija`. Poslužitelj prvo provjerava unesene podatke. Lozinka se ne sprema kao običan tekst nego se pomoću funkcije `scrypt` iz ugrađenog Node.js modula `crypto` pretvara u hash.

Uz hash se sprema i nasumična sol. Kod prijave se iz unesene lozinke ponovno izračuna hash i uspoređuje sa spremljenim. Nakon uspješne registracije ili prijave poslužitelj izrađuje sesijski token i šalje ga u `HttpOnly` kolačiću.

Za obranu je dovoljno objasniti: obična lozinka se ne zapisuje u `korisnici.json`; spremaju se samo podatci potrebni za kasniju provjeru lozinke.

## 3. Zašto administrator nema registraciju

Administrator je unaprijed određen i prijavljuje se na posebnom administratorskom sučelju. Prijava se provjerava na backendu. Rute koje mijenjaju jela ili prikazuju sve narudžbe i rezervacije provjeravaju ima li trenutna sesija administratorsku ulogu.

## 4. Kako se prikazuju i ažuriraju jela

`js/data.js` sadrži početnih 15 jela kako bi osnovni meni bio vidljiv i ako backend nije pokrenut. Kada backend radi, frontend dohvaća jela putem rute `GET /api/jela` i podatci s poslužitelja imaju prednost.

Administrator može:

- dodati novo jelo,
- promijeniti naziv, cijenu, veličine ili dostupnost,
- obrisati jelo,
- dodati jelo u novu grupu.

Kartice grupa u meniju stvaraju se JavaScriptom prema vrijednosti `kategorija`. Zato se nova grupa prikazuje tek kada u njoj postoji barem jedno dostupno jelo.

## 5. Kako radi košarica i narudžba

Košarica se privremeno sprema u `localStorage`, pa odabrana jela ostaju zapamćena dok korisnik prelazi između stranica.

Kada korisnik pošalje narudžbu, `js/app.js` šalje podatke ruti `POST /api/narudzbe`. Backend ponovno pronalazi jela u spremljenom meniju i sam računa ukupnu cijenu. Nakon spremanja vraća broj potvrde, primjerice `BELLA-0001`. Narudžba je zatim vidljiva administratoru, koji joj može promijeniti status.

## 6. Rezervacije

Obrazac za rezervaciju provjerava obavezna polja i šalje podatke backendu. Rezervacije se spremaju u `podatci/rezervacije.json` i prikazuju se u administraciji.

Verifikacija kartice u projektu je samo školska simulacija. Stvarni broj kartice i CVV ne šalju se backendu i ne spremaju se u JSON datoteke.

## 7. Gdje se spremaju podatci

- košarica: `localStorage`
- demonstracijski status kartice: `localStorage`
- jela: `podatci/jela.json`
- korisnici: `podatci/korisnici.json`
- narudžbe: `podatci/narudzbe.json`
- rezervacije: `podatci/rezervacije.json`

Funkcije za čitanje i zapisivanje JSON datoteka nalaze se u `backend/pohrana.js`.

## 8. Lokacija restorana

Kontakt stranica koristi Leaflet i OpenStreetMap. Gumb za prikaz lokacije stvara kartu i oznaku restorana. Nije potreban poseban API ključ. Kod se nalazi u `js/lokacija.js`.

## 9. Pomoćnik za korisnike

Mali prozor "Pomoćnik za korisnike" nije pravi AI sustav. To je jednostavna JavaScript funkcija koja provjerava sadrži li korisnički unos nekoliko poznatih ključnih riječi, primjerice `meni`, `narudžba`, `košarica`, `kontakt` ili `radno vrijeme`, te prikazuje unaprijed pripremljen odgovor.

Funkcija se zove `pokreniPomocnika()` i nalazi se u `js/ui.js`.

## 10. Što bih dalje unaprijedio

- zamjena JSON datoteka pravom bazom podataka,
- trajno spremanje sesija,
- unos slika kroz administraciju,
- e-mail ili SMS potvrde,
- stvarno online plaćanje preko certificiranog servisa,
- dodatna zaštita prijave i više testova,
- objava aplikacije na poslužitelju uz HTTPS.
