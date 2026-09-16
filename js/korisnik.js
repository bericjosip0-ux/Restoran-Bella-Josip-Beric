import { auth, db } from "../firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    ref,
    set,
    get,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

console.log("Firebase Realtime Database je povezan.");

document.addEventListener("DOMContentLoaded", async () => {
    const sesija = await dohvatiKorisnickuSesiju();

    urediNavigacijuKorisnika(sesija);
    popuniPodatkeNarudzbe(sesija);
    urediStranicuRacuna(sesija);
    pokreniRegistraciju();
    pokreniPrijavu();
    pokreniOdjavu();

    if (
        document.getElementById("mojeNarudzbe")
        && sesija.prijavljen
        && sesija.uloga === "korisnik"
    ) {
        await prikaziMojeNarudzbe(sesija.uid);
    }
});

function cekajProvjeruPrijave() {
    return new Promise((resolve, reject) => {
        const prekiniPracenje = onAuthStateChanged(
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

async function dohvatiKorisnickuSesiju() {
    try {
        const korisnik = await cekajProvjeruPrijave();

        if (!korisnik) {
            return {
                prijavljen: false
            };
        }

        const korisnikRezultat = await get(
            ref(db, `users/${korisnik.uid}`)
        );

        const podatciKorisnika = korisnikRezultat.exists()
            ? korisnikRezultat.val()
            : {};

        const uloga = podatciKorisnika.role || "user";

        return {
            prijavljen: true,
            uid: korisnik.uid,
            ime:
                podatciKorisnika.name
                || korisnik.displayName
                || korisnik.email,
            email: korisnik.email,
            uloga: uloga === "admin" ? "admin" : "korisnik"
        };
    } catch (greska) {
        console.error("Pogreška provjere korisnika:", greska);

        return {
            prijavljen: false
        };
    }
}

function urediNavigacijuKorisnika(sesija) {
    const popis = document.querySelector("#glavnaNavigacija ul");

    if (!popis || document.getElementById("korisnickaNavigacija")) {
        return;
    }

    const stavka = document.createElement("li");
    stavka.id = "korisnickaNavigacija";

    if (sesija.prijavljen && sesija.uloga === "admin") {
        stavka.innerHTML =
            '<a href="admin.html">Administracija</a>';
    } else if (sesija.prijavljen) {
        stavka.innerHTML = `
            <a href="registracija.html">
                👤 ${escapirajHTML(sesija.ime)}
            </a>
        `;
    } else {
        stavka.innerHTML =
            '<a href="registracija.html">Prijava</a>';
    }

    popis.appendChild(stavka);
}

function urediStranicuRacuna(sesija) {
    const obrasci = document.getElementById("obrasciKorisnika");
    const odjava = document.getElementById("odjavaKorisnika");
    const mojeNarudzbe = document.getElementById("mojeNarudzbe");

    if (!obrasci) {
        return;
    }

    if (sesija.prijavljen) {
        obrasci.classList.add("hidden");
        odjava?.classList.remove("hidden");

        if (mojeNarudzbe && sesija.uloga === "admin") {
            mojeNarudzbe.innerHTML = `
                <p>Prijavljeni ste kao administrator.</p>
                <a class="primary-link" href="admin.html">
                    Otvori administraciju
                </a>
            `;
        }
    } else {
        obrasci.classList.remove("hidden");
        odjava?.classList.add("hidden");

        if (mojeNarudzbe) {
            mojeNarudzbe.innerHTML =
                "<p>Prijavite se kako biste vidjeli svoje narudžbe.</p>";
        }
    }
}

function popuniPodatkeNarudzbe(sesija) {
    if (!sesija.prijavljen || sesija.uloga !== "korisnik") {
        return;
    }

    const ime = document.getElementById("ime");
    const email = document.getElementById("email");

    if (ime && !ime.value) {
        ime.value = sesija.ime;
    }

    if (email && !email.value) {
        email.value = sesija.email;
    }
}

function postaviPoruku(element, poruka, uspjesno) {
    if (!element) {
        return;
    }

    element.textContent = poruka;
    element.className = uspjesno
        ? "poruka-obrasca uspjeh"
        : "poruka-obrasca greska";
}

function pokreniRegistraciju() {
    const obrazac = document.getElementById("registracijaForma");

    if (!obrazac) {
        return;
    }

    obrazac.addEventListener("submit", async dogadaj => {
        dogadaj.preventDefault();

        const poruka =
            document.getElementById("registracijaPoruka");

        const ime =
            document.getElementById("registracijaIme")
                .value
                .trim();

        const email =
            document.getElementById("registracijaEmail")
                .value
                .trim();

        const lozinka =
            document.getElementById("registracijaLozinka").value;

        const potvrdaLozinke =
            document.getElementById("potvrdaLozinke").value;

        if (!ime || !email || !lozinka || !potvrdaLozinke) {
            postaviPoruku(
                poruka,
                "Ispunite sva obavezna polja.",
                false
            );
            return;
        }

        if (lozinka.length < 8) {
            postaviPoruku(
                poruka,
                "Lozinka mora imati najmanje 8 znakova.",
                false
            );
            return;
        }

        if (lozinka !== potvrdaLozinke) {
            postaviPoruku(
                poruka,
                "Lozinke nisu jednake.",
                false
            );
            return;
        }

        try {
            const rezultat = await createUserWithEmailAndPassword(
                auth,
                email,
                lozinka
            );

            await updateProfile(rezultat.user, {
                displayName: ime
            });

            await set(
                ref(db, `users/${rezultat.user.uid}`),
                {
                    name: ime,
                    email: email,
                    role: "user",
                    createdAt: Date.now()
                }
            );

            postaviPoruku(
                poruka,
                "Registracija je uspješna. Korisnik je prijavljen.",
                true
            );

            obrazac.reset();

            setTimeout(() => {
                window.location.reload();
            }, 900);
        } catch (greska) {
            console.error("Pogreška registracije:", greska);

            postaviPoruku(
                poruka,
                prevediFirebaseGresku(greska.code),
                false
            );
        }
    });
}

function pokreniPrijavu() {
    const obrazac = document.getElementById("prijavaForma");

    if (!obrazac) {
        return;
    }

    obrazac.addEventListener("submit", async dogadaj => {
        dogadaj.preventDefault();

        const poruka =
            document.getElementById("prijavaPoruka");

        const email =
            document.getElementById("prijavaEmail")
                .value
                .trim();

        const lozinka =
            document.getElementById("prijavaLozinka").value;

        if (!email || !lozinka) {
            postaviPoruku(
                poruka,
                "Unesite e-mail adresu i lozinku.",
                false
            );
            return;
        }

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                lozinka
            );

            postaviPoruku(
                poruka,
                "Prijava je uspješna.",
                true
            );

            obrazac.reset();

            setTimeout(() => {
                window.location.reload();
            }, 700);
        } catch (greska) {
            console.error("Pogreška prijave:", greska);

            postaviPoruku(
                poruka,
                prevediFirebaseGresku(greska.code),
                false
            );
        }
    });
}

function pokreniOdjavu() {
    const gumb = document.getElementById("odjavaKorisnika");

    if (!gumb) {
        return;
    }

    gumb.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.reload();
        } catch (greska) {
            console.error("Pogreška odjave:", greska);
        }
    });
}

async function prikaziMojeNarudzbe(uid) {
    const prikaz = document.getElementById("mojeNarudzbe");

    if (!prikaz) {
        return;
    }

    try {
        const upitNarudzbi = query(
            ref(db, "orders"),
            orderByChild("userId"),
            equalTo(uid)
        );

        const rezultat = await get(upitNarudzbi);

        if (!rezultat.exists()) {
            prikaz.innerHTML =
                "<p>Još nemate spremljenih narudžbi.</p>";
            return;
        }

        const narudzbe = Object.entries(rezultat.val())
            .map(([id, podatci]) => ({
                id,
                ...podatci
            }))
            .sort((prva, druga) =>
                Number(druga.createdAt || 0)
                - Number(prva.createdAt || 0)
            );

        prikaz.innerHTML = narudzbe.map(narudzba => {
            const broj =
                narudzba.brojNarudzbe || narudzba.id;

            const status =
                narudzba.status || "Zaprimljena";

            const ukupno =
                Number(narudzba.ukupno || 0).toFixed(2);

            return `
                <article class="mala-kartica">
                    <h3>${escapirajHTML(broj)}</h3>
                    <p>
                        Status:
                        <strong>${escapirajHTML(status)}</strong>
                    </p>
                    <p>Ukupno: ${ukupno} €</p>
                </article>
            `;
        }).join("");
    } catch (greska) {
        console.error(
            "Pogreška dohvaćanja narudžbi:",
            greska
        );

        prikaz.innerHTML =
            "<p>Narudžbe trenutačno nije moguće dohvatiti.</p>";
    }
}

function prevediFirebaseGresku(kod) {
    switch (kod) {
        case "auth/email-already-in-use":
            return "Korisnik s ovom e-mail adresom već postoji.";

        case "auth/invalid-email":
            return "Unesena e-mail adresa nije ispravna.";

        case "auth/weak-password":
            return "Lozinka nije dovoljno sigurna.";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "E-mail adresa ili lozinka nisu ispravni.";

        case "auth/too-many-requests":
            return "Previše pokušaja. Pokušajte ponovno kasnije.";

        case "auth/network-request-failed":
            return "Provjerite internetsku vezu.";

        case "PERMISSION_DENIED":
        case "permission-denied":
            return "Firebase pravila ne dopuštaju ovu radnju.";

        default:
            return "Dogodila se pogreška. Pokušajte ponovno.";
    }
}

function escapirajHTML(vrijednost) {
    return String(vrijednost)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

window.dohvatiKorisnickuSesiju =
    dohvatiKorisnickuSesiju;