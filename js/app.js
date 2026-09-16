import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

console.log("Firebase spremanje narudžbi i rezervacija je povezano.");

/*
===================================
POMOĆNE FIREBASE FUNKCIJE
===================================
*/

function pricekajProvjeruPrijave() {
    if (auth.currentUser) {
        return Promise.resolve(auth.currentUser);
    }

    return new Promise((resolve, reject) => {
        let prekiniPracenje = () => {};

        prekiniPracenje = onAuthStateChanged(
            auth,
            korisnik => {
                prekiniPracenje();
                resolve(korisnik);
            },
            greska => {
                prekiniPracenje();
                reject(greska);
            }
        );
    });
}

function napraviBrojNarudzbe() {
    const vrijeme = Date.now().toString();
    return `BELLA-${vrijeme.slice(-6)}`;
}

function napraviBrojRezervacije() {
    const vrijeme = Date.now().toString();
    return `REZ-${vrijeme.slice(-6)}`;
}

function pretvoriFirebaseGresku(greska) {
    console.error("Firebase pogreška:", greska);

    if (
        greska?.code === "PERMISSION_DENIED" ||
        greska?.code === "permission-denied"
    ) {
        return "Firebase pravila ne dopuštaju spremanje podataka.";
    }

    if (greska?.code === "auth/network-request-failed") {
        return "Provjerite internetsku vezu.";
    }

    if (greska?.code === "auth/user-token-expired") {
        return "Prijava je istekla. Prijavite se ponovno.";
    }

    return greska?.message || "Dogodila se pogreška pri povezivanju s Firebaseom.";
}

function pripremiStavkeNarudzbe(stavke) {
    return stavke.map(stavka => {
        /*
        Firebase novim jelima dodjeljuje tekstualni ključ.
        Taj se ključ ne smije pretvarati u broj jer bi rezultat
        bio NaN, a Firebase tada odbija spremanje narudžbe.
        */
        const proizvodId =
            stavka.proizvodId ?? stavka.id ?? "";

        return {
            id: String(stavka.id || ""),
            proizvodId:
                typeof proizvodId === "number"
                    ? proizvodId
                    : String(proizvodId),
            odabranaVarijanta:
                stavka.odabranaVarijanta || "",
            naziv: String(stavka.naziv || ""),
            cijena: Number(stavka.cijena || 0),
            kolicina: Number(stavka.kolicina || 1),
            detalji: String(stavka.detalji || ""),
            ukupno: Number(
                (
                    Number(stavka.cijena || 0) *
                    Number(stavka.kolicina || 1)
                ).toFixed(2)
            )
        };
    });
}

/*
===================================
POKRETANJE STRANICE
===================================
*/

document.addEventListener("DOMContentLoaded", async () => {
    const zaglavlje = document.getElementById("zaglavlje");
    const gumbNavigacije = document.getElementById("gumbNavigacije");
    const glavnaNavigacija = document.getElementById("glavnaNavigacija");
    const nacinPlacanja = document.getElementById("nacinPlacanja");
    const karticniPodaci = document.getElementById("karticniPodaci");
    const forma = document.getElementById("narudzbaForma");
    const formaRezervacije = document.getElementById("formaRezervacije");
    const iskacuciProzor = document.getElementById("popup");
    const gumbZatvoriPopup = document.getElementById("zatvoriPopup");

    /*
    ===================================
    ZAGLAVLJE I NAVIGACIJA
    ===================================
    */

    window.addEventListener("scroll", () => {
        if (zaglavlje) {
            zaglavlje.classList.toggle(
                "scrolled",
                window.scrollY > 50
            );
        }
    });

    if (gumbNavigacije && glavnaNavigacija) {
        gumbNavigacije.addEventListener("click", () => {
            const otvoreno =
                glavnaNavigacija.classList.toggle("show");

            gumbNavigacije.setAttribute(
                "aria-expanded",
                String(otvoreno)
            );
        });

        glavnaNavigacija
            .querySelectorAll("a")
            .forEach(poveznica => {
                poveznica.addEventListener("click", () => {
                    glavnaNavigacija.classList.remove("show");

                    gumbNavigacije.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                });
            });
    }

    /*
    ===================================
    NAČIN PLAĆANJA
    ===================================
    */

    if (nacinPlacanja && karticniPodaci) {
        nacinPlacanja.addEventListener("change", () => {
            if (
                nacinPlacanja.value ===
                "verificiranaKartica"
            ) {
                karticniPodaci.classList.remove("hidden");
                prikaziStatusKarticeUKosarici();
            } else {
                karticniPodaci.classList.add("hidden");
            }
        });
    }

    /*
    ===================================
    SLANJE NARUDŽBE U FIREBASE
    ===================================
    */

    if (forma) {
        forma.addEventListener("submit", async dogadaj => {
            dogadaj.preventDefault();

            const rezultat = validirajNarudzbu();

            if (!rezultat.uspjesno) {
                prikaziPopup(
                    "error",
                    "Podaci nisu valjani",
                    `${rezultat.poruka} Molimo kontaktirajte restoran na broj ${BROJ_TELEFONA_RESTORANA} ili narudžbu napravite putem telefona.`
                );

                return;
            }

            const gumbZaSlanje =
                forma.querySelector('button[type="submit"]');

            if (gumbZaSlanje) {
                gumbZaSlanje.disabled = true;
                gumbZaSlanje.textContent =
                    "Šaljem narudžbu...";
            }

            try {
                const korisnik =
                    await pricekajProvjeruPrijave();

                if (!korisnik) {
                    throw new Error(
                        "Za slanje narudžbe prvo se morate registrirati ili prijaviti."
                    );
                }

                const novaNarudzbaReferenca = push(
                    ref(db, "orders")
                );

                const brojNarudzbe =
                    napraviBrojNarudzbe();

                const ukupno = Number(
                    rezultat.narudzba.ukupno.toFixed(2)
                );

                const kartica =
                    rezultat.narudzba.verificiranaKartica;

                const novaNarudzba = {
                    userId: korisnik.uid,
                    brojNarudzbe,
                    ime: rezultat.narudzba.ime,
                    adresa: rezultat.narudzba.adresa,
                    telefon: rezultat.narudzba.telefon,
                    email: rezultat.narudzba.email,
                    nacinPlacanja:
                        rezultat.narudzba.nacinPlacanja,
                    karticaZadnjeCetiri:
                        rezultat.narudzba.nacinPlacanja ===
                            "verificiranaKartica"
                            ? kartica?.zadnjeCetiri || ""
                            : "",
                    stavke: pripremiStavkeNarudzbe(
                        rezultat.narudzba.stavke
                    ),
                    ukupno,
                    status: "Zaprimljena",
                    createdAt: Date.now(),
                    datumNarudzbe:
                        new Date().toISOString()
                };

                await set(
                    novaNarudzbaReferenca,
                    novaNarudzba
                );

                prikaziPopup(
                    "success",
                    "Narudžba je uspješno poslana",
                    `Potvrda: ${brojNarudzbe}. Status: ${novaNarudzba.status}. Ukupno: ${ukupno.toFixed(2)} €.`
                );

                const potvrda =
                    document.getElementById(
                        "potvrdaNarudzbe"
                    );

                if (potvrda) {
                    potvrda.innerHTML = `
                        <h3>Potvrda narudžbe</h3>
                        <p>
                            Broj narudžbe:
                            <strong>${brojNarudzbe}</strong>
                        </p>
                        <p>Status: ${novaNarudzba.status}</p>
                        <p>
                            Narudžba je spremljena u Firebase
                            i vidljiva administratoru.
                        </p>
                    `;

                    potvrda.classList.remove("hidden");
                }

                kosarica = [];
                spremiKosaricu();
                prikaziKosaricu();
                forma.reset();

                if (karticniPodaci) {
                    karticniPodaci.classList.add("hidden");
                }
            } catch (greska) {
                prikaziPopup(
                    "error",
                    "Narudžba nije poslana",
                    `${pretvoriFirebaseGresku(greska)} Nazovite restoran na broj ${BROJ_TELEFONA_RESTORANA}.`
                );
            } finally {
                if (gumbZaSlanje) {
                    gumbZaSlanje.disabled = false;
                    gumbZaSlanje.textContent =
                        "Pošalji narudžbu";
                }
            }
        });
    }

    /*
    ===================================
    SLANJE REZERVACIJE U FIREBASE
    ===================================
    */

    if (formaRezervacije) {
        formaRezervacije.addEventListener(
            "submit",
            async dogadaj => {
                dogadaj.preventDefault();

                const ime = document
                    .getElementById("rezIme")
                    .value
                    .trim();

                const telefon = document
                    .getElementById("rezTelefon")
                    .value
                    .trim();

                const datum = document
                    .getElementById("rezDatum")
                    .value;

                const vrijeme = document
                    .getElementById("rezVrijeme")
                    .value;

                const osobe = document
                    .getElementById("rezOsobe")
                    .value;

                if (
                    ime.length < 3 ||
                    telefon.length < 6 ||
                    !datum ||
                    !vrijeme ||
                    Number(osobe) < 1
                ) {
                    prikaziPopup(
                        "error",
                        "Podaci nisu valjani",
                        `Provjerite podatke za rezervaciju ili nazovite restoran na broj ${BROJ_TELEFONA_RESTORANA}.`
                    );

                    return;
                }

                const kartica =
                    dohvatiVerificiranuKarticu();

                if (!kartica || !kartica.verificirana) {
                    prikaziPopup(
                        "error",
                        "Kartica nije verificirana",
                        `Za potvrdu rezervacije potrebno je prvo verificirati kreditnu karticu. Za pomoć nazovite restoran na broj ${BROJ_TELEFONA_RESTORANA}.`
                    );

                    return;
                }

                const gumbZaSlanje =
                    formaRezervacije.querySelector(
                        'button[type="submit"]'
                    );

                if (gumbZaSlanje) {
                    gumbZaSlanje.disabled = true;
                    gumbZaSlanje.textContent =
                        "Šaljem rezervaciju...";
                }

                try {
                    const korisnik =
                        await pricekajProvjeruPrijave();

                    if (!korisnik) {
                        throw new Error(
                            "Za slanje rezervacije prvo se morate registrirati ili prijaviti."
                        );
                    }

                    const novaRezervacijaReferenca =
                        push(ref(db, "reservations"));

                    const brojRezervacije =
                        napraviBrojRezervacije();

                    const novaRezervacija = {
                        userId: korisnik.uid,
                        brojRezervacije,
                        ime,
                        telefon,
                        datum,
                        vrijeme,
                        brojOsoba: Number(osobe),
                        karticaZadnjeCetiri:
                            kartica.zadnjeCetiri,
                        status: "Na čekanju",
                        createdAt: Date.now(),
                        datumSlanja:
                            new Date().toISOString()
                    };

                    await set(
                        novaRezervacijaReferenca,
                        novaRezervacija
                    );

                    prikaziPopup(
                        "success",
                        "Rezervacija je poslana",
                        `Rezervacija broj ${brojRezervacije} spremljena je u Firebase i vidljiva administratoru. Garancija: kartica **** ${kartica.zadnjeCetiri}.`
                    );

                    formaRezervacije.reset();
                } catch (greska) {
                    prikaziPopup(
                        "error",
                        "Rezervacija nije poslana",
                        pretvoriFirebaseGresku(greska)
                    );
                } finally {
                    if (gumbZaSlanje) {
                        gumbZaSlanje.disabled = false;
                        gumbZaSlanje.textContent =
                            "Pošalji rezervaciju";
                    }
                }
            }
        );
    }

    /*
    ===================================
    POPUP PROZOR
    ===================================
    */

    if (gumbZatvoriPopup) {
        gumbZatvoriPopup.addEventListener(
            "click",
            zatvoriPopup
        );
    }

    if (iskacuciProzor) {
        iskacuciProzor.addEventListener(
            "click",
            dogadaj => {
                if (dogadaj.target === iskacuciProzor) {
                    zatvoriPopup();
                }
            }
        );
    }

    /*
    ===================================
    UČITAVANJE OSTATKA APLIKACIJE
    ===================================
    */

    /*
    Osnovno sučelje pokreće se prije čekanja na Firebase.
    Tako se kategorije, košarica i pomoćnik mogu koristiti čak
    i ako je mreža spora ili Firebase privremeno nije dostupan.
    */
    prikaziProizvode();
    pokreniKategorijeMenija();
    pokreniAutomatskoOsvjezavanjeMenija();
    prikaziKosaricu();
    azurirajBrojKosarice();
    pokreniVerifikacijuKartice();
    prikaziStatusKarticeUKosarici();
    pokreniPomocnika();

    const jelaUcitana = await ucitajProizvode();

    if (jelaUcitana) {
        prikaziProizvode();
        pokreniKategorijeMenija();
    }
});

/*
===================================
VALIDACIJA NARUDŽBE
===================================
*/

function validirajNarudzbu() {
    const imePolje = document.getElementById("ime");
    const adresaPolje = document.getElementById("adresa");
    const telefonPolje = document.getElementById("telefon");
    const emailPolje = document.getElementById("email");
    const placanjePolje =
        document.getElementById("nacinPlacanja");

    if (
        !imePolje ||
        !adresaPolje ||
        !telefonPolje ||
        !emailPolje ||
        !placanjePolje
    ) {
        return {
            uspjesno: false,
            poruka: "Obrazac narudžbe nije pravilno učitan."
        };
    }

    const ime = imePolje.value.trim();
    const adresa = adresaPolje.value.trim();
    const telefon = telefonPolje.value.trim();
    const email = emailPolje.value.trim();
    const nacinPlacanja = placanjePolje.value;

    if (kosarica.length === 0) {
        return {
            uspjesno: false,
            poruka: "Košarica je prazna."
        };
    }

    if (ime.length < 3) {
        return {
            uspjesno: false,
            poruka:
                "Ime i prezime nisu ispravno uneseni."
        };
    }

    if (adresa.length < 5) {
        return {
            uspjesno: false,
            poruka:
                "Adresa dostave nije ispravno unesena."
        };
    }

    if (telefon.length < 6) {
        return {
            uspjesno: false,
            poruka:
                "Broj telefona nije ispravno unesen."
        };
    }

    if (
        !email.includes("@") ||
        !email.includes(".")
    ) {
        return {
            uspjesno: false,
            poruka:
                "Email adresa nije ispravno unesena."
        };
    }

    if (!nacinPlacanja) {
        return {
            uspjesno: false,
            poruka:
                "Nije odabran način plaćanja."
        };
    }

    const verificiranaKartica =
        dohvatiVerificiranuKarticu();

    if (
        nacinPlacanja === "verificiranaKartica" &&
        (
            !verificiranaKartica ||
            !verificiranaKartica.verificirana
        )
    ) {
        return {
            uspjesno: false,
            poruka:
                "Kartica nije verificirana. Prvo verificirajte karticu na stranici Rezervacije."
        };
    }

    return {
        uspjesno: true,
        narudzba: {
            ime,
            adresa,
            telefon,
            email,
            nacinPlacanja,
            verificiranaKartica,
            ukupno: izracunajUkupno(),
            stavke: kosarica
        }
    };
}
