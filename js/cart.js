let kosarica =
    JSON.parse(localStorage.getItem("kosarica")) || [];

function spremiKosaricu() {
    localStorage.setItem(
        "kosarica",
        JSON.stringify(kosarica)
    );

    azurirajBrojKosarice();
}

function azurirajBrojKosarice() {
    const oznakaKosarice =
        document.getElementById("oznakaKosarice");

    if (!oznakaKosarice) {
        return;
    }

    const ukupanBroj = kosarica.reduce(
        (zbroj, stavka) => {
            return zbroj + Number(stavka.kolicina || 0);
        },
        0
    );

    oznakaKosarice.textContent = ukupanBroj;

    if (ukupanBroj > 0) {
        oznakaKosarice.classList.remove("hidden");
    } else {
        oznakaKosarice.classList.add("hidden");
    }
}

function pronadiProizvod(id) {
    let trazeniId = String(id);

    try {
        trazeniId = decodeURIComponent(trazeniId);
    } catch (greska) {
        console.warn(
            "ID proizvoda nije bilo potrebno dekodirati."
        );
    }

    return proizvodi.find(proizvod => {
        const obicniId = String(proizvod.id ?? "");
        const firebaseId = String(
            proizvod.firebaseId ?? ""
        );

        return (
            obicniId === trazeniId ||
            firebaseId === trazeniId
        );
    });
}

function dodajProizvodSVarijantomUKosaricu(id) {
    const proizvod = pronadiProizvod(id);

    if (!proizvod) {
        prikaziPopup(
            "error",
            "Jelo nije pronađeno",
            "Odabrano jelo nije moguće pronaći. Osvježite stranicu i pokušajte ponovno."
        );

        return;
    }

    const izbornik = document.getElementById(
        `velicina-${proizvod.id}`
    );

    if (!izbornik) {
        prikaziPopup(
            "error",
            "Varijanta nije pronađena",
            "Nije moguće pronaći odabranu veličinu jela."
        );

        return;
    }

    const indeksVelicine = Number(izbornik.value);
    const velicina =
        proizvod.velicine?.[indeksVelicine];

    if (!velicina) {
        prikaziPopup(
            "error",
            "Varijanta nije odabrana",
            "Odaberite veličinu ili varijantu jela."
        );

        return;
    }

    const opisVelicine =
        velicina.opisVelicine ||
        (
            velicina.cm
                ? `${velicina.cm} cm`
                : ""
        );

    dodajStavku({
        id: `${proizvod.firebaseId ?? proizvod.id}-${velicina.naziv}`,
        proizvodId:
            proizvod.firebaseId ?? proizvod.id,
        odabranaVarijanta: velicina.naziv,
        naziv:
            `${proizvod.naziv} (` +
            `${velicina.naziv}` +
            `${
                opisVelicine
                    ? `, ${opisVelicine}`
                    : ""
            })`,
        cijena: Number(velicina.cijena),
        detalji: Array.isArray(proizvod.sastojci)
            ? proizvod.sastojci.join(", ")
            : ""
    });
}

function dodajStandardniProizvodUKosaricu(id) {
    const proizvod = pronadiProizvod(id);

    if (!proizvod) {
        prikaziPopup(
            "error",
            "Jelo nije pronađeno",
            "Odabrano jelo nije moguće pronaći. Osvježite stranicu i pokušajte ponovno."
        );

        return;
    }

    const dodatakNazivu = proizvod.gramaza
        ? ` (${proizvod.gramaza})`
        : "";

    dodajStavku({
        id: String(
            proizvod.firebaseId ?? proizvod.id
        ),
        proizvodId:
            proizvod.firebaseId ?? proizvod.id,
        odabranaVarijanta: "",
        naziv: `${proizvod.naziv}${dodatakNazivu}`,
        cijena: Number(proizvod.cijena),
        detalji: Array.isArray(proizvod.sastojci)
            ? proizvod.sastojci.join(", ")
            : ""
    });
}

function dodajStavku(novaStavka) {
    if (
        !novaStavka.naziv ||
        Number(novaStavka.cijena) <= 0
    ) {
        prikaziPopup(
            "error",
            "Jelo nije moguće dodati",
            "Jelo nema ispravno postavljenu cijenu."
        );

        return;
    }

    const postojecaStavka = kosarica.find(
        stavka => {
            return String(stavka.id) ===
                String(novaStavka.id);
        }
    );

    if (postojecaStavka) {
        postojecaStavka.kolicina =
            Number(postojecaStavka.kolicina || 0) + 1;
    } else {
        kosarica.push({
            ...novaStavka,
            cijena: Number(novaStavka.cijena),
            kolicina: 1
        });
    }

    spremiKosaricu();
    prikaziKosaricu();

    prikaziPopup(
        "success",
        "Dodano u košaricu",
        "Jelo je uspješno spremljeno u košaricu. Košaricu možete otvoriti preko navigacije."
    );
}

function prikaziKosaricu() {
    const kosaricaIspis =
        document.getElementById("kosaricaIspis");

    const ukupnaCijena =
        document.getElementById("ukupnaCijena");

    if (!kosaricaIspis || !ukupnaCijena) {
        return;
    }

    kosaricaIspis.innerHTML = "";

    if (kosarica.length === 0) {
        kosaricaIspis.innerHTML =
            '<p class="empty-cart">Košarica je prazna.</p>';

        ukupnaCijena.textContent = "0.00";
        return;
    }

    let ukupno = 0;

    kosarica.forEach(stavka => {
        const cijena = Number(stavka.cijena || 0);
        const kolicina =
            Number(stavka.kolicina || 1);

        const stavkaUkupno = cijena * kolicina;
        ukupno += stavkaUkupno;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <h4>${stavka.naziv}</h4>
            <p>${stavka.detalji || ""}</p>
            <p>Cijena: ${cijena.toFixed(2)} €</p>
            <p>Količina: ${kolicina}</p>

            <p>
                <strong>
                    Ukupno: ${stavkaUkupno.toFixed(2)} €
                </strong>
            </p>

            <div class="cart-actions">
                <button
                    type="button"
                    onclick="smanjiKolicinu('${stavka.id}')"
                >
                    −
                </button>

                <button
                    type="button"
                    onclick="povecajKolicinu('${stavka.id}')"
                >
                    +
                </button>

                <button
                    type="button"
                    onclick="obrisiStavku('${stavka.id}')"
                >
                    Obriši
                </button>
            </div>
        `;

        kosaricaIspis.appendChild(div);
    });

    ukupnaCijena.textContent = ukupno.toFixed(2);
}

function povecajKolicinu(id) {
    const stavka = kosarica.find(item => {
        return String(item.id) === String(id);
    });

    if (!stavka) {
        return;
    }

    stavka.kolicina =
        Number(stavka.kolicina || 0) + 1;

    spremiKosaricu();
    prikaziKosaricu();
}

function smanjiKolicinu(id) {
    const stavka = kosarica.find(item => {
        return String(item.id) === String(id);
    });

    if (!stavka) {
        return;
    }

    stavka.kolicina =
        Number(stavka.kolicina || 1) - 1;

    if (stavka.kolicina <= 0) {
        kosarica = kosarica.filter(item => {
            return String(item.id) !== String(id);
        });
    }

    spremiKosaricu();
    prikaziKosaricu();
}

function obrisiStavku(id) {
    kosarica = kosarica.filter(item => {
        return String(item.id) !== String(id);
    });

    spremiKosaricu();
    prikaziKosaricu();
}

function izracunajUkupno() {
    return kosarica.reduce(
        (ukupno, stavka) => {
            return ukupno +
                Number(stavka.cijena || 0) *
                Number(stavka.kolicina || 1);
        },
        0
    );
}

/*
Funkcije moraju biti dostupne gumbima u HTML-u.
Ovo radi i ako se druge datoteke učitavaju kao moduli.
*/

window.dodajProizvodSVarijantomUKosaricu =
    dodajProizvodSVarijantomUKosaricu;

window.dodajStandardniProizvodUKosaricu =
    dodajStandardniProizvodUKosaricu;

window.povecajKolicinu = povecajKolicinu;
window.smanjiKolicinu = smanjiKolicinu;
window.obrisiStavku = obrisiStavku;