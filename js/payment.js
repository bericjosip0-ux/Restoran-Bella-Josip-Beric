/* ===================================
   VERIFIKACIJA KARTICE - FRONTEND SIMULACIJA
=================================== */

const STORAGE_KARTICA_KEY = "bellaVerificiranaKartica";

function formatirajBrojKartice(vrijednost) {
    return vrijednost
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
}

function dohvatiVerificiranuKarticu() {
    return JSON.parse(localStorage.getItem(STORAGE_KARTICA_KEY)) || null;
}

function spremiVerificiranuKarticu(podaci) {
    localStorage.setItem(STORAGE_KARTICA_KEY, JSON.stringify(podaci));
}

function validirajKarticnePodatke(brojKartice, datumKartice, cvv) {
    const broj = brojKartice.replaceAll(" ", "");
    const karticaIspravna = /^\d{16}$/.test(broj);
    const datumIspravan = /^(0[1-9]|1[0-2])\/\d{2}$/.test(datumKartice);
    const cvvIspravan = /^\d{3,4}$/.test(cvv);

    if (!karticaIspravna || !datumIspravan || !cvvIspravan) {
        return {
            uspjesno: false,
            poruka: "Podaci kartice nisu valjani. Provjerite broj kartice, datum i CVV."
        };
    }

    return {
        uspjesno: true,
        zadnjeCetiri: broj.slice(-4)
    };
}

function pokreniVerifikacijuKartice() {
    const brojInput = document.getElementById("rezBrojKartice");
    const datumInput = document.getElementById("rezDatumKartice");
    const cvvInput = document.getElementById("rezCvv");
    const gumb = document.getElementById("verificirajKarticuBtn");
    const status = document.getElementById("statusKartice");

    if (!brojInput || !datumInput || !cvvInput || !gumb || !status) {
        return;
    }

    const postojecaKartica = dohvatiVerificiranuKarticu();

    if (postojecaKartica) {
        status.textContent = `Kartica je već verificirana: **** **** **** ${postojecaKartica.zadnjeCetiri}`;
        status.classList.add("verified");
    }

    brojInput.addEventListener("input", () => {
        brojInput.value = formatirajBrojKartice(brojInput.value);
    });

    gumb.addEventListener("click", () => {
        const rezultat = validirajKarticnePodatke(
            brojInput.value,
            datumInput.value.trim(),
            cvvInput.value.trim()
        );

        if (!rezultat.uspjesno) {
            status.textContent = rezultat.poruka;
            status.classList.remove("verified");

            prikaziPopup(
                "error",
                "Kartica nije verificirana",
                `${rezultat.poruka} Za pomoć nazovite restoran na broj ${BROJ_TELEFONA_RESTORANA}.`
            );

            return;
        }

        const verificiranaKartica = {
            verificirana: true,
            zadnjeCetiri: rezultat.zadnjeCetiri,
            pruzatelj: "Bella demonstracijska simulacija",
            vrijemeVerifikacije: new Date().toISOString()
        };

        spremiVerificiranuKarticu(verificiranaKartica);

        brojInput.value = "";
        datumInput.value = "";
        cvvInput.value = "";

        status.textContent = `Kartica je uspješno verificirana: **** **** **** ${rezultat.zadnjeCetiri}`;
        status.classList.add("verified");

        prikaziPopup(
            "success",
            "Kartica je verificirana",
            "Kartica je uspješno verificirana i povezana s korisničkom rezervacijom/računom restorana za ovu frontend aplikaciju."
        );
    });
}

function prikaziStatusKarticeUKosarici() {
    const status = document.getElementById("kosaricaKarticaStatus");

    if (!status) {
        return;
    }

    const kartica = dohvatiVerificiranuKarticu();

    if (kartica && kartica.verificirana) {
        status.textContent = `Koristit će se verificirana kartica: **** **** **** ${kartica.zadnjeCetiri}`;
        status.classList.add("verified");
    } else {
        status.textContent = "Kartica nije verificirana. Za plaćanje karticom prvo napravite verifikaciju na stranici Rezervacije.";
        status.classList.remove("verified");
    }
}
