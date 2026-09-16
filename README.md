# Restoran Bella – završni rad

Višestranična web-aplikacija restorana izrađena u HTML-u, CSS-u i JavaScriptu.
Aplikacija koristi Firebase Authentication za prijavu, Firebase Realtime Database
za podatke i Firebase Hosting za javnu objavu.

## Javne poveznice

- Aplikacija: https://restoran-bella.web.app
- GitHub: https://github.com/bericjosip0-ux/Restoran-Bella-Josip-Beric

## Glavne mogućnosti

- prikaz menija po grupama: pizze, burgeri, ćevapi i nove grupe
- dodavanje jela i varijanti u košaricu
- spremanje košarice u `localStorage`
- Firebase registracija, prijava i odjava korisnika
- slanje narudžbi i rezervacija u Firebase
- prikaz korisnikovih narudžbi
- administratorsko dodavanje, uređivanje i brisanje jela
- administratorski prikaz narudžbi, rezervacija i korisnika
- promjena statusa narudžbe
- Leaflet karta s OpenStreetMap podlogom

## Firebase podatci

Realtime Database koristi ove glavne putanje:

- `products` – jela i cijene
- `users` – osnovni profil i uloga korisnika
- `orders` – narudžbe
- `reservations` – rezervacije

Konfiguracija web-aplikacije nalazi se u `firebase-config.js`. Administratorski
račun mora postojati u Firebase Authenticationu, a njegov zapis pod
`users/UID/role` mora imati vrijednost `admin`.

## Lokalno pokretanje

Projekt je statička Firebase aplikacija. U Visual Studio Codeu može se otvoriti
pomoću dodatka Live Server. Ne treba pokretati stari Express poslužitelj.

## Objava

Ručna objava:

```bash
firebase deploy --only hosting
```

Datoteka `.github/workflows/firebase-hosting-merge.yml` automatski objavljuje
aplikaciju na Firebase Hosting nakon slanja promjena na granu `main`.

## Napomena o kartici

Verifikacija kartice samo je demonstracija za školski projekt. Pravi broj
kartice i CVV ne šalju se Firebaseu i ne spremaju se u bazu.
