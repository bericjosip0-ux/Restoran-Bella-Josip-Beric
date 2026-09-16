# Restoran Bella - final V4 cappuccino tema + realne lokalne slike

## Izmjene

- Baza je zadnja V3 verzija.
- Boja teme promijenjena je u cappuccino:
  - `--gold: #c7a17a`
  - `--gold-light: #ead7c0`
- Umjesto ilustracija, jela sada imaju realne lokalne JPG slike.
- Slike su spremljene u `assets/images/` i ostaju trajno u projektu.
- Svako jelo ima svoju posebnu datoteku slike.
- Zadržano je sve iz prethodne verzije:
  - odvojene HTML stranice
  - početna bez slika jela
  - meni s kategorijama koje se otvaraju klikom
  - zasebna košarica u navigaciji
  - broj proizvoda uz košaricu
  - sastojci, gramaže, veličine pizza i cijene
  - localStorage
  - popup za dodavanje u košaricu
  - popup za uspješnu narudžbu
  - popup za grešku s brojem telefona
  - responzivnost za mobitel, tablet, laptop i desktop

## Napomena

Slike su lokalno spremljene u projekt i aplikacija ne ovisi o internetu za njihov prikaz.


## Final V5 izmjena

- Baza je V4 cappuccino verzija.
- U meniju se više ne prikazuju odmah sva jela.
- Za svaku kategoriju postoji jedna velika slika:
  - Pizze
  - Burgeri
  - Ćevapi
- Klik na sliku kategorije otvara ponudu te kategorije.
- Nakon otvaranja ostaju sve ranije funkcije:
  - prikaz jela
  - sastojci na klik
  - gramaža
  - veličine pizza
  - cijene
  - spremanje u košaricu
  - broj stavki u navigaciji
  - popupovi


## Final V6 izmjena - verifikacija kartice

- Baza je V5 verzija.
- Na stranici `rezervacije.html` dodana je verifikacija kreditne kartice.
- Rezervacija se ne može poslati dok kartica nije verificirana.
- Košarica na `kosarica.html` može koristiti opciju "Verificirana kartica".
- Korisnik u košarici ne mora ponovno unositi broj kartice.
- U localStorage se sprema samo status verifikacije i zadnje 4 znamenke kartice.
- Puni broj kartice i CVV se ne spremaju.

## Sigurnosna napomena

Ovo je frontend simulacija za seminarski/projektni rad.
U stvarnoj aplikaciji kartice se ne verificiraju direktno u frontend kodu i ne povezuju se ručno s računom restorana.
Za stvarno plaćanje treba koristiti payment provider kao Stripe, PayPal, Mollie ili sličan servis s backend serverom.


## Final V7 izmjena - tekstualni meni

- Baza je V6 verzija.
- U meniju su glavne kategorije posložene jedna do druge na većim ekranima.
- Uklonjene su male ikonice iz naziva kategorija.
- Nakon otvaranja kategorije, jela više nemaju slike.
- Jela su prikazana kao tekstualne stavke.
- Klik na naziv jela otvara detalje:
  - opis
  - sastojci
  - gramaža ili veličina
  - cijena
  - spremanje u košaricu
- Sve ostalo iz V6 je zadržano.


## Final V8 izmjena - slike bez teksta

- Baza je V7 verzija.
- Uklonjeni su nazivi/slova koji su bili upisani direktno na slikama u meniju.
- Slike su ponovno spremljene lokalno u `assets/images/`.
- Sve ostale funkcionalnosti ostaju iste.


## Final V9 izmjena - rezervacije

- Baza je V8 verzija.
- Na stranici `rezervacije.html` okvir s naslovom "Rezerviraj stol" i forma za unos podataka sada imaju jednaku širinu.
- Sve ostale funkcionalnosti i dizajn ostaju isti.
