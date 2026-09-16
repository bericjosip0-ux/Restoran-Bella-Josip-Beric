# Restoran Bella – završni rad s backendom

Ova verzija zadržava postojeći izgled i glavne frontend funkcije projekta, a dodaje Node.js/Express backend, registraciju korisnika i zaštićenu administraciju.

## Pokretanje projekta

Preduvjet je instaliran Node.js 18 ili noviji.

1. Otvoriti mapu projekta u Visual Studio Codeu.
2. Otvoriti Terminal → New Terminal.
3. Pokrenuti:

```bash
npm install
npm start
```

4. U pregledniku otvoriti: `http://localhost:3000`

Na Windows računalu projekt se može pokrenuti i dvostrukim klikom na `POKRENI_PROJEKT.bat`.

Važno: stranice se ne pokreću dvostrukim klikom na `index.html`, jer registracija, jela i narudžbe koriste backend.
Ako backend trenutačno nije dostupan, stranica više ne prikazuje iskačuću
poruku „Meni nije učitan”. Administratorsko dodavanje jela nije uklonjeno i
normalno radi nakon pokretanja projekta naredbom `npm start`.

## Administratorska prijava

Administrator se ne registrira. Za demonstraciju koristi:

- korisničko ime: `admin`
- lozinka: `BellaAdmin2026!`

Administracija se otvara na `http://localhost:3000/admin.html`.

Prije javnog objavljivanja treba postaviti druge podatke kroz varijable `ADMIN_KORISNICKO_IME` i `ADMIN_LOZINKA`. Primjer se nalazi u `.env.example`.

## Dodane mogućnosti

- registracija i prijava korisnika
- spremanje korisničke lozinke kao scrypt hasha (obična lozinka se ne zapisuje)
- pamćenje korisnika i njegovih narudžbi u backendu
- administratorska prijava bez registracije
- dodavanje, uređivanje i brisanje jela
- automatsko stvaranje nove kartice grupe kada admin upiše novu grupu jela
- zadržan stari izgled menija s karticama Pizze, Burgeri i Ćevapi
- početna jela, vrste/veličine i cijene vidljivi su i kada backend nije pokrenut
- promjena cijene, opisa, sastojaka i dostupnosti jela
- jelo s jednom cijenom ili s više varijanti/veličina
- prikaz svih narudžbi administratoru
- promjena statusa narudžbe
- potvrda narudžbe s jedinstvenim brojem
- spremanje rezervacija i prikaz administratoru
- prikaz registriranih korisnika bez prikaza lozinki
- prikaz lokacije na besplatnoj OpenStreetMap karti pomoću Leafleta
- otvaranje adrese na OpenStreetMap stranici u novoj kartici preglednika

## Gdje se podatci spremaju

Backend sprema podatke u mapu `podatci`:

- `jela.json` – sva jela i cijene
- `korisnici.json` – registrirani korisnici i hashirane lozinke
- `narudzbe.json` – spremljene narudžbe
- `rezervacije.json` – spremljene rezervacije

Ovo je jednostavna datotečna pohrana prikladna za školski projekt. Za stvarni restoran JSON datoteke bi se zamijenile bazom podataka kao što je PostgreSQL, MySQL ili MongoDB.

## Kako administrator dodaje više vrsta jednog jela

U polju „Grupa jela” administrator može odabrati postojeću grupu, primjerice
`pizza`, ili upisati novu, primjerice `tjestenine`. Nakon spremanja backend pamti
jelo u `podatci/jela.json`, a meni automatski stvara novu karticu „Tjestenine”.
Ne postoji unaprijed napravljena prazna grupa „Ostalo”. Prikazuju se samo grupe
koje stvarno imaju spremljena i dostupna jela.

U polje „Varijante” svaka se varijanta upisuje u novi red ovim oblikom:

```text
Mala | 24 cm | 8.50
Srednja | 32 cm | 11.50
Jumbo | 45 cm | 18.50
```

Ako jelo ima samo jednu cijenu, polje „Varijante” ostavlja se prazno, a ispune se „Cijena” i „Gramaža”.

## Najvažnije datoteke

- `posluzitelj.js` – Express poslužitelj i API rute
- `backend/pohrana.js` – čitanje i spremanje JSON podataka
- `backend/sigurnost.js` – scrypt hashiranje lozinki i izrada tokena sesije
- `admin.html` i `js/admin.js` – administratorsko sučelje
- `registracija.html` i `<script type="module" src="js/korisnik.js?v=4"></script>` – registracija i prijava
- `js/data.js` – dohvaćanje jela iz backenda
- `js/app.js` – slanje narudžbe i rezervacije backendu
- `js/lokacija.js` – Leaflet karta s OpenStreetMap podlogom

## Besplatna karta lokacije

Projekt koristi biblioteku Leaflet i OpenStreetMap karte. Nije potreban API ključ
ni plaćeni korisnički račun. Trenutačne koordinate predstavljaju primjer
lokacije u Zagrebu. Kada se odredi stvarna adresa restorana, potrebno je promijeniti
`zemljopisnaSirina` i `zemljopisnaDuzina` u datoteci `js/lokacija.js` te koordinate
u poveznici unutar `kontakt.html`.

## Provjera projekta

Automatski testovi pokreću se naredbom:

```bash
npm test
```

Testovi provjeravaju registraciju, prijavu administratora, dodavanje jela u novu
grupu, slanje narudžbe i administratorski prikaz narudžbe.

## Sigurnosna napomena

Verifikacija kartice iz izvornog frontend projekta ostavljena je kao demonstracija. Ne spaja se na banku i ne smiju se unositi stvarni podatci kartice. Prava naplata zahtijevala bi certificirani sustav kao Stripe ili PayPal. Backend ne sprema broj kartice ni CVV.
