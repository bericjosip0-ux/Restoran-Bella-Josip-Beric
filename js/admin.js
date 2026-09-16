import { auth, db } from "../firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    ref,
    get,
    set,
    push,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

let administratorskaJela = [];
let adminSlusaci = [];
let trenutniAdmin = null;

document.addEventListener("DOMContentLoaded", () => {
    pokreniAdminPrijavu();
    pokreniObrazacJela();
    pokreniAdminKlikove();
    pokreniAdminOdjavu();

    onAuthStateChanged(auth, provjeriAdminSesiju);
});

function sigurniTekst(vrijednost) {
    return String(vrijednost ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function postaviAdminPoruku(element, poruka, uspjesno) {
    if (!element) {
        return;
    }

    element.textContent = poruka;
    element.className = uspjesno
        ? "poruka-obrasca uspjeh"
        : "poruka-obrasca greska";
}

function uljepsajNazivGrupe(grupa) {
    if (!grupa) {
        return "";
    }

    return grupa.charAt(0).toUpperCase() + grupa.slice(1);
}

function oznaciPromjenuMenija() {
    localStorage.setItem(
        "bellaJelaAzurirana",
        Date.now().toString()
    );
}

function pretvoriUPopis(podatci) {
    if (!podatci) {
        return [];
    }

    return Object.entries(podatci)
        .filter(([, vrijednost]) => vrijednost !== null)
        .map(([firebaseId, vrijednost]) => ({
            ...vrijednost,
            firebaseId
        }));
}

async function provjeriAdminSesiju(korisnik) {
    if (!korisnik) {
        trenutniAdmin = null;
        prikaziAdminPrijavu();
        return;
    }

    try {
        const korisnikSnimka = await get(
            ref(db, `users/${korisnik.uid}`)
        );

        const profil = korisnikSnimka.val();

        if (!profil || profil.role !== "admin") {
            trenutniAdmin = null;
            prikaziAdminPrijavu();

            postaviAdminPoruku(
                document.getElementById("adminPrijavaPoruka"),
                "Ovaj korisnički račun nema administratorska prava.",
                false
            );

            return;
        }

        trenutniAdmin = korisnik;
        await prikaziAdministraciju();
    } catch (greska) {
        console.error(
            "Pogreška provjere administratorske uloge:",
            greska
        );

        prikaziAdminPrijavu();

        postaviAdminPoruku(
            document.getElementById("adminPrijavaPoruka"),
            "Nije moguće provjeriti administratorska prava.",
            false
        );
    }
}

function prikaziAdminPrijavu() {
    zaustaviAdminSlusace();

    document
        .getElementById("adminPrijavaOkvir")
        ?.classList.remove("hidden");

    document
        .getElementById("adminSadrzaj")
        ?.classList.add("hidden");
}

async function prikaziAdministraciju() {
    document
        .getElementById("adminPrijavaOkvir")
        ?.classList.add("hidden");

    document
        .getElementById("adminSadrzaj")
        ?.classList.remove("hidden");

    try {
        await spremiPocetnaJelaAkoJeBazaPrazna();
    } catch (greska) {
        console.error(
            "Početna jela nisu spremljena:",
            greska
        );
    }

    pokreniSlusanjeAdminPodataka();
}

function pokreniAdminPrijavu() {
    const obrazac = document.getElementById(
        "adminPrijavaForma"
    );

    if (!obrazac) {
        return;
    }

    obrazac.addEventListener("submit", async dogadaj => {
        dogadaj.preventDefault();

        const poruka = document.getElementById(
            "adminPrijavaPoruka"
        );

        const email = document
            .getElementById("adminKorisnickoIme")
            .value
            .trim();

        const lozinka = document
            .getElementById("adminLozinka")
            .value;

        if (!email || !lozinka) {
            postaviAdminPoruku(
                poruka,
                "Unesite e-mail i lozinku administratora.",
                false
            );

            return;
        }

        try {
            postaviAdminPoruku(
                poruka,
                "Provjera administratorskih podataka...",
                true
            );

            await signInWithEmailAndPassword(
                auth,
                email,
                lozinka
            );
        } catch (greska) {
            console.error(
                "Pogreška administratorske prijave:",
                greska
            );

            let tekst = "Prijava administratora nije uspjela.";

            if (
                greska.code === "auth/invalid-credential" ||
                greska.code === "auth/wrong-password" ||
                greska.code === "auth/user-not-found"
            ) {
                tekst = "E-mail ili lozinka nisu ispravni.";
            }

            if (greska.code === "auth/invalid-email") {
                tekst = "Unesena e-mail adresa nije ispravna.";
            }

            if (greska.code === "auth/too-many-requests") {
                tekst =
                    "Previše pokušaja prijave. Pokušajte ponovno kasnije.";
            }

            postaviAdminPoruku(
                poruka,
                tekst,
                false
            );
        }
    });
}

async function spremiPocetnaJelaAkoJeBazaPrazna() {
    const proizvodiReferenca = ref(db, "products");
    const snimka = await get(proizvodiReferenca);

    if (snimka.exists()) {
        return;
    }

    const pocetniProizvodi =
        window.pocetnaJelaZaFirebase;

    if (
        !Array.isArray(pocetniProizvodi) ||
        pocetniProizvodi.length === 0
    ) {
        throw new Error(
            "Početna jela nisu dostupna u data.js."
        );
    }

    await set(
        proizvodiReferenca,
        pocetniProizvodi
    );

    oznaciPromjenuMenija();

    console.log(
        "Početna jela spremljena su u Firebase."
    );
}

function pokreniSlusanjeAdminPodataka() {
    zaustaviAdminSlusace();

    const odjavaJela = onValue(
        ref(db, "products"),
        snimka => {
            const jela = pretvoriUPopis(
                snimka.val()
            );

            administratorskaJela = jela;

            const brojJela =
                document.getElementById("brojJela");

            if (brojJela) {
                brojJela.textContent = jela.length;
            }

            prikaziGrupeJela(jela);
            prikaziAdminJela(jela);
        },
        greska => {
            console.error(
                "Pogreška dohvaćanja jela:",
                greska
            );
        }
    );

    const odjavaNarudzbi = onValue(
        ref(db, "orders"),
        snimka => {
            const narudzbe = pretvoriUPopis(
                snimka.val()
            );

            const brojNarudzbi =
                document.getElementById("brojNarudzbi");

            if (brojNarudzbi) {
                brojNarudzbi.textContent =
                    narudzbe.length;
            }

            prikaziAdminNarudzbe(narudzbe);
        },
        greska => {
            console.error(
                "Pogreška dohvaćanja narudžbi:",
                greska
            );
        }
    );

    const odjavaRezervacija = onValue(
        ref(db, "reservations"),
        snimka => {
            const rezervacije = pretvoriUPopis(
                snimka.val()
            );

            const brojRezervacija =
                document.getElementById(
                    "brojRezervacija"
                );

            if (brojRezervacija) {
                brojRezervacija.textContent =
                    rezervacije.length;
            }

            prikaziAdminRezervacije(
                rezervacije
            );
        },
        greska => {
            console.error(
                "Pogreška dohvaćanja rezervacija:",
                greska
            );
        }
    );

    const odjavaKorisnika = onValue(
        ref(db, "users"),
        snimka => {
            const korisnici = pretvoriUPopis(
                snimka.val()
            );

            const brojKorisnika =
                document.getElementById(
                    "brojKorisnika"
                );

            if (brojKorisnika) {
                brojKorisnika.textContent =
                    korisnici.length;
            }

            prikaziAdminKorisnike(korisnici);
        },
        greska => {
            console.error(
                "Pogreška dohvaćanja korisnika:",
                greska
            );
        }
    );

    adminSlusaci = [
        odjavaJela,
        odjavaNarudzbi,
        odjavaRezervacija,
        odjavaKorisnika
    ];
}

function zaustaviAdminSlusace() {
    adminSlusaci.forEach(odjaviSlusaca => {
        odjaviSlusaca();
    });

    adminSlusaci = [];
}

function prikaziGrupeJela(jela) {
    const popis = document.getElementById(
        "popisGrupaJela"
    );

    if (!popis) {
        return;
    }

    const grupe = [
        ...new Set(
            jela
                .map(jelo => jelo.kategorija)
                .filter(Boolean)
        )
    ];

    popis.innerHTML = grupe
        .map(grupa => {
            return `
                <option value="${sigurniTekst(grupa)}">
                    ${sigurniTekst(
                        uljepsajNazivGrupe(grupa)
                    )}
                </option>
            `;
        })
        .join("");
}

function prikaziAdminJela(jela) {
    const prikaz = document.getElementById(
        "adminJela"
    );

    if (!prikaz) {
        return;
    }

    if (jela.length === 0) {
        prikaz.innerHTML =
            "<p>Još nema spremljenih jela.</p>";

        return;
    }

    prikaz.innerHTML = jela
        .map(jelo => {
            let cijene;

            if (
                Array.isArray(jelo.velicine) &&
                jelo.velicine.length > 0
            ) {
                cijene = jelo.velicine
                    .map(stavka => {
                        return `${sigurniTekst(
                            stavka.naziv
                        )}: ${Number(
                            stavka.cijena
                        ).toFixed(2)} €`;
                    })
                    .join(" · ");
            } else {
                cijene =
                    `${Number(
                        jelo.cijena || 0
                    ).toFixed(2)} €`;
            }

            return `
                <article class="admin-red">
                    <div>
                        <h3>${sigurniTekst(
                            jelo.naziv
                        )}</h3>

                        <p>
                            ${sigurniTekst(
                                uljepsajNazivGrupe(
                                    jelo.kategorija
                                )
                            )}
                            · ${cijene}
                        </p>

                        <p>
                            ${
                                jelo.aktivan !== false
                                    ? "Dostupno gostima"
                                    : "Sakriveno"
                            }
                        </p>
                    </div>

                    <div class="admin-gumbi-reda">
                        <button
                            type="button"
                            data-radnja="uredi-jelo"
                            data-id="${sigurniTekst(
                                jelo.firebaseId
                            )}"
                        >
                            Uredi
                        </button>

                        <button
                            type="button"
                            data-radnja="obrisi-jelo"
                            data-id="${sigurniTekst(
                                jelo.firebaseId
                            )}"
                            class="opasan-gumb"
                        >
                            Obriši
                        </button>
                    </div>
                </article>
            `;
        })
        .join("");
}

function prikaziAdminNarudzbe(narudzbe) {
    const prikaz = document.getElementById(
        "adminNarudzbe"
    );

    if (!prikaz) {
        return;
    }

    if (narudzbe.length === 0) {
        prikaz.innerHTML =
            "<p>Još nema narudžbi.</p>";

        return;
    }

    const statusi = [
        "Zaprimljena",
        "U pripremi",
        "Spremna",
        "Dostavljena",
        "Otkazana"
    ];

    prikaz.innerHTML = narudzbe
        .map(narudzba => {
            let stavke = [];

            if (Array.isArray(narudzba.stavke)) {
                stavke = narudzba.stavke;
            } else if (
                narudzba.stavke &&
                typeof narudzba.stavke === "object"
            ) {
                stavke = Object.values(
                    narudzba.stavke
                );
            }

            const prikazStavki = stavke.length
                ? stavke
                    .map(stavka => {
                        return `
                            <li>
                                ${Number(
                                    stavka.kolicina || 1
                                )}
                                ×
                                ${sigurniTekst(
                                    stavka.naziv
                                )}
                            </li>
                        `;
                    })
                    .join("")
                : "<li>Nema spremljenih stavki.</li>";

            return `
                <article class="admin-red admin-narudzba">
                    <div>
                        <h3>
                            ${sigurniTekst(
                                narudzba.brojNarudzbe ||
                                narudzba.firebaseId
                            )}
                            —
                            ${sigurniTekst(
                                narudzba.ime ||
                                narudzba.korisnikIme
                            )}
                        </h3>

                        <p>
                            ${sigurniTekst(
                                narudzba.adresa
                            )}
                            ·
                            ${sigurniTekst(
                                narudzba.telefon
                            )}
                        </p>

                        <ul>${prikazStavki}</ul>

                        <p>
                            <strong>
                                Ukupno:
                                ${Number(
                                    narudzba.ukupno || 0
                                ).toFixed(2)}
                                €
                            </strong>
                        </p>
                    </div>

                    <div class="status-kontrola">
                        <select>
                            ${statusi
                                .map(status => {
                                    const odabrano =
                                        status ===
                                        narudzba.status
                                            ? "selected"
                                            : "";

                                    return `
                                        <option ${odabrano}>
                                            ${status}
                                        </option>
                                    `;
                                })
                                .join("")}
                        </select>

                        <button
                            type="button"
                            data-radnja="status-narudzbe"
                            data-id="${sigurniTekst(
                                narudzba.firebaseId
                            )}"
                        >
                            Spremi status
                        </button>
                    </div>
                </article>
            `;
        })
        .join("");
}

function prikaziAdminRezervacije(rezervacije) {
    const prikaz = document.getElementById(
        "adminRezervacije"
    );

    if (!prikaz) {
        return;
    }

    prikaz.innerHTML = rezervacije.length
        ? rezervacije
            .map(stavka => {
                return `
                    <article class="admin-red">
                        <div>
                            <h3>
                                ${sigurniTekst(
                                    stavka.ime
                                )}
                            </h3>

                            <p>
                                ${sigurniTekst(
                                    stavka.datum
                                )}
                                u
                                ${sigurniTekst(
                                    stavka.vrijeme
                                )}
                                ·
                                ${Number(
                                    stavka.brojOsoba || 0
                                )}
                                osoba
                            </p>

                            <p>
                                ${sigurniTekst(
                                    stavka.telefon
                                )}
                                ·
                                ${sigurniTekst(
                                    stavka.status ||
                                    "Zaprimljena"
                                )}
                            </p>
                        </div>
                    </article>
                `;
            })
            .join("")
        : "<p>Još nema rezervacija.</p>";
}

function prikaziAdminKorisnike(korisnici) {
    const prikaz = document.getElementById(
        "adminKorisnici"
    );

    if (!prikaz) {
        return;
    }

    prikaz.innerHTML = korisnici.length
        ? korisnici
            .map(korisnik => {
                return `
                    <article class="admin-red">
                        <div>
                            <h3>
                                ${sigurniTekst(
                                    korisnik.name ||
                                    korisnik.ime
                                )}
                            </h3>

                            <p>
                                ${sigurniTekst(
                                    korisnik.email
                                )}
                            </p>

                            <p>
                                Uloga:
                                ${sigurniTekst(
                                    korisnik.role ||
                                    "user"
                                )}
                            </p>
                        </div>
                    </article>
                `;
            })
            .join("")
        : "<p>Još nema registriranih korisnika.</p>";
}

function procitajVarijante() {
    const polje = document.getElementById(
        "jeloVarijante"
    );

    return polje.value
        .split("\n")
        .map(red => {
            return red
                .split("|")
                .map(dio => dio.trim());
        })
        .filter(dijelovi => {
            return (
                dijelovi[0] &&
                Number(dijelovi[2]) > 0
            );
        })
        .map(dijelovi => {
            return {
                naziv: dijelovi[0],
                opisVelicine: dijelovi[1] || "",
                cijena: Number(dijelovi[2])
            };
        });
}

function pokreniObrazacJela() {
    const obrazac = document.getElementById(
        "jeloForma"
    );

    if (!obrazac) {
        return;
    }

    obrazac.addEventListener(
        "submit",
        async dogadaj => {
            dogadaj.preventDefault();

            if (!trenutniAdmin) {
                return;
            }

            const firebaseId = document
                .getElementById("jeloId")
                .value;

            const postojeceJelo =
                administratorskaJela.find(jelo => {
                    return (
                        jelo.firebaseId === firebaseId
                    );
                });

            const varijante = procitajVarijante();

            const unesenaCijena = Number(
                document.getElementById(
                    "jeloCijena"
                ).value
            );

            if (
                varijante.length === 0 &&
                unesenaCijena <= 0
            ) {
                postaviAdminPoruku(
                    document.getElementById(
                        "jeloPoruka"
                    ),
                    "Unesite cijenu ili najmanje jednu varijantu.",
                    false
                );

                return;
            }

            const sastojci = document
                .getElementById("jeloSastojci")
                .value
                .split(",")
                .map(stavka => stavka.trim())
                .filter(Boolean);

            const jelo = {
                id:
                    postojeceJelo?.id ||
                    Date.now(),

                naziv: document
                    .getElementById("jeloNaziv")
                    .value
                    .trim(),

                kategorija: document
                    .getElementById("jeloKategorija")
                    .value
                    .trim()
                    .toLowerCase(),

                opis: document
                    .getElementById("jeloOpis")
                    .value
                    .trim(),

                sastojci,

                cijena:
                    varijante.length > 0
                        ? 0
                        : unesenaCijena,

                gramaza: document
                    .getElementById("jeloGramaza")
                    .value
                    .trim(),

                velicine: varijante,

                slika: document
                    .getElementById("jeloSlika")
                    .value
                    .trim(),

                aktivan: document
                    .getElementById("jeloAktivno")
                    .checked,

                updatedAt: Date.now()
            };

            try {
                if (firebaseId) {
                    await set(
                        ref(
                            db,
                            `products/${firebaseId}`
                        ),
                        jelo
                    );
                } else {
                    jelo.createdAt = Date.now();

                    const novoJeloReferenca = push(
                        ref(db, "products")
                    );

                    await set(
                        novoJeloReferenca,
                        jelo
                    );
                }

                postaviAdminPoruku(
                    document.getElementById(
                        "jeloPoruka"
                    ),
                    firebaseId
                        ? "Jelo je uspješno ažurirano."
                        : "Novo jelo je uspješno dodano.",
                    true
                );

                oznaciPromjenuMenija();
                ocistiObrazacJela();
            } catch (greska) {
                console.error(
                    "Pogreška spremanja jela:",
                    greska
                );

                postaviAdminPoruku(
                    document.getElementById(
                        "jeloPoruka"
                    ),
                    "Jelo nije moguće spremiti.",
                    false
                );
            }
        }
    );

    document
        .getElementById("odustaniOdUredivanja")
        ?.addEventListener(
            "click",
            ocistiObrazacJela
        );
}

function ucitajJeloUObrazac(firebaseId) {
    const jelo = administratorskaJela.find(
        stavka => {
            return (
                stavka.firebaseId === firebaseId
            );
        }
    );

    if (!jelo) {
        return;
    }

    document.getElementById("jeloId").value =
        jelo.firebaseId;

    document.getElementById("jeloNaziv").value =
        jelo.naziv || "";

    document.getElementById(
        "jeloKategorija"
    ).value = jelo.kategorija || "";

    document.getElementById("jeloOpis").value =
        jelo.opis || "";

    document.getElementById(
        "jeloSastojci"
    ).value = Array.isArray(jelo.sastojci)
        ? jelo.sastojci.join(", ")
        : "";

    document.getElementById(
        "jeloCijena"
    ).value = jelo.cijena || "";

    document.getElementById(
        "jeloGramaza"
    ).value = jelo.gramaza || "";

    document.getElementById(
        "jeloVarijante"
    ).value = Array.isArray(jelo.velicine)
        ? jelo.velicine
            .map(stavka => {
                return (
                    `${stavka.naziv} | ` +
                    `${stavka.opisVelicine || ""} | ` +
                    `${stavka.cijena}`
                );
            })
            .join("\n")
        : "";

    document.getElementById(
        "jeloSlika"
    ).value =
        jelo.slika ||
        "assets/images/pizza-margherita.jpg";

    document.getElementById(
        "jeloAktivno"
    ).checked = jelo.aktivan !== false;

    document
        .getElementById("jeloForma")
        .scrollIntoView({
            behavior: "smooth"
        });
}

function ocistiObrazacJela() {
    const obrazac = document.getElementById(
        "jeloForma"
    );

    obrazac?.reset();

    document.getElementById("jeloId").value = "";

    document.getElementById(
        "jeloSlika"
    ).value =
        "assets/images/pizza-margherita.jpg";

    document.getElementById(
        "jeloAktivno"
    ).checked = true;
}

function pokreniAdminKlikove() {
    document
        .getElementById("adminSadrzaj")
        ?.addEventListener(
            "click",
            async dogadaj => {
                const gumb = dogadaj.target.closest(
                    "button[data-radnja]"
                );

                if (!gumb || !trenutniAdmin) {
                    return;
                }

                const firebaseId =
                    gumb.dataset.id;

                if (
                    gumb.dataset.radnja ===
                    "uredi-jelo"
                ) {
                    ucitajJeloUObrazac(
                        firebaseId
                    );

                    return;
                }

                if (
                    gumb.dataset.radnja ===
                    "obrisi-jelo"
                ) {
                    const potvrdeno = confirm(
                        "Želite li zaista obrisati ovo jelo?"
                    );

                    if (!potvrdeno) {
                        return;
                    }

                    try {
                        await remove(
                            ref(
                                db,
                                `products/${firebaseId}`
                            )
                        );

                        oznaciPromjenuMenija();
                    } catch (greska) {
                        console.error(
                            "Pogreška brisanja jela:",
                            greska
                        );
                    }

                    return;
                }

                if (
                    gumb.dataset.radnja ===
                    "status-narudzbe"
                ) {
                    const kontrola = gumb.closest(
                        ".status-kontrola"
                    );

                    const status = kontrola
                        ?.querySelector("select")
                        ?.value;

                    if (!status) {
                        return;
                    }

                    try {
                        await update(
                            ref(
                                db,
                                `orders/${firebaseId}`
                            ),
                            {
                                status,
                                updatedAt: Date.now()
                            }
                        );
                    } catch (greska) {
                        console.error(
                            "Pogreška promjene statusa:",
                            greska
                        );
                    }
                }
            }
        );
}

function pokreniAdminOdjavu() {
    document
        .getElementById("adminOdjava")
        ?.addEventListener(
            "click",
            async () => {
                zaustaviAdminSlusace();
                await signOut(auth);
                window.location.reload();
            }
        );
}