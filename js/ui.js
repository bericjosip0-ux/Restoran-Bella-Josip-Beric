function sigurniTekstMenija(vrijednost) {
    return String(vrijednost ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function uljepsajNazivGrupe(kategorija) {
    const poznatiNazivi = {
        pizza: "Pizze",
        burger: "Burgeri",
        cevapi: "Ćevapi"
    };

    if (poznatiNazivi[kategorija]) {
        return poznatiNazivi[kategorija];
    }

    return String(kategorija || "")
        .split(" ")
        .filter(Boolean)
        .map(rijec => {
            return (
                rijec
                    .charAt(0)
                    .toLocaleUpperCase("hr-HR") +
                rijec.slice(1)
            );
        })
        .join(" ");
}

function napraviKarticuJela(proizvod) {
    const kartica =
        document.createElement("article");

    kartica.className = "menu-item-card";

    /*
    Firebase može koristiti tekstualni ključ.
    Zato se ID više ne pretvara pomoću Number().
    */
    const idProizvoda = encodeURIComponent(
        String(
            proizvod.firebaseId ??
            proizvod.id
        )
    );

    const idIzbornika = sigurniTekstMenija(
        String(proizvod.id)
    );

    const sastojciHTML =
        (proizvod.sastojci || [])
            .map(sastojak => {
                return `
                    <li>
                        ${sigurniTekstMenija(sastojak)}
                    </li>
                `;
            })
            .join("");

    let opcijeHTML = "";

    /*
    Varijante nisu vezane samo uz pizzu.
    Administrator ih može dodati bilo kojem jelu.
    */
    if (
        Array.isArray(proizvod.velicine) &&
        proizvod.velicine.length > 0
    ) {
        const velicineHTML =
            proizvod.velicine
                .map((velicina, indeks) => {
                    const opis =
                        velicina.opisVelicine ||
                        (
                            velicina.cm
                                ? `${velicina.cm} cm`
                                : ""
                        );

                    const tekstOpisa = opis
                        ? ` - ${sigurniTekstMenija(opis)}`
                        : "";

                    return `
                        <option value="${indeks}">
                            ${sigurniTekstMenija(
                                velicina.naziv
                            )}
                            ${tekstOpisa}
                            -
                            ${Number(
                                velicina.cijena
                            ).toFixed(2)}
                            €
                        </option>
                    `;
                })
                .join("");

        opcijeHTML = `
            <label
                class="product-label"
                for="velicina-${idIzbornika}"
            >
                Odaberi varijantu
            </label>

            <select
                id="velicina-${idIzbornika}"
                class="product-select"
            >
                ${velicineHTML}
            </select>

            <button
                type="button"
                class="add-button"
                onclick="dodajProizvodSVarijantomUKosaricu('${idProizvoda}')"
            >
                Spremi u košaricu
            </button>
        `;
    } else {
        const gramazaHTML =
            proizvod.gramaza
                ? `
                    <p class="product-meta">
                        <strong>Gramaža:</strong>
                        ${sigurniTekstMenija(
                            proizvod.gramaza
                        )}
                    </p>
                `
                : "";

        opcijeHTML = `
            ${gramazaHTML}

            <p class="product-price">
                ${Number(
                    proizvod.cijena || 0
                ).toFixed(2)}
                €
            </p>

            <button
                type="button"
                class="add-button"
                onclick="dodajStandardniProizvodUKosaricu('${idProizvoda}')"
            >
                Spremi u košaricu
            </button>
        `;
    }

    kartica.innerHTML = `
        <details class="menu-item-details">
            <summary>
                <span class="menu-item-name">
                    ${sigurniTekstMenija(
                        proizvod.naziv
                    )}
                </span>

                <span class="menu-item-open">
                    Prikaži detalje
                </span>
            </summary>

            <div class="menu-item-body">
                <p class="product-description">
                    ${sigurniTekstMenija(
                        proizvod.opis
                    )}
                </p>

                <div class="ingredients-list">
                    <h4>Sastojci</h4>
                    <ul>${sastojciHTML}</ul>
                </div>

                ${opcijeHTML}
            </div>
        </details>
    `;

    return kartica;
}

function prikaziProizvode() {
    const prikazKategorija =
        document.getElementById(
            "dinamickeKategorije"
        );

    if (!prikazKategorija) {
        return;
    }

    /*
    Stare tri kartice ostaju u HTML-u.
    Uklanjaju se samo naknadno dodane grupe.
    */
    prikazKategorija
        .querySelectorAll(
            '[data-dinamicka-grupa="da"]'
        )
        .forEach(kartica => kartica.remove());

    const stalneGrupe = new Map([
        [
            "pizza",
            document.getElementById("pizzaLista")
        ],
        [
            "burger",
            document.getElementById("burgerLista")
        ],
        [
            "cevapi",
            document.getElementById("cevapiLista")
        ]
    ]);

    stalneGrupe.forEach(prikaz => {
        if (prikaz) {
            prikaz.innerHTML = "";
        }
    });

    const grupeJela = new Map();

    proizvodi.forEach(proizvod => {
        if (!proizvod || proizvod.aktivan === false) {
            return;
        }

        const kategorija =
            String(proizvod.kategorija || "ostalo")
                .trim()
                .toLocaleLowerCase("hr-HR");

        if (!grupeJela.has(kategorija)) {
            grupeJela.set(kategorija, []);
        }

        grupeJela
            .get(kategorija)
            .push(proizvod);
    });

    Array
        .from(grupeJela.entries())
        .forEach(
            ([kategorija, jelaGrupe], indeks) => {
                const prikazStalneGrupe =
                    stalneGrupe.get(kategorija);

                if (prikazStalneGrupe) {
                    jelaGrupe.forEach(jelo => {
                        prikazStalneGrupe.appendChild(
                            napraviKarticuJela(jelo)
                        );
                    });

                    return;
                }

                /*
                Za novu grupu iz Firebasea izrađuje
                se nova kartica kategorije.
                */
                const karticaGrupe =
                    document.createElement("article");

                const idSadrzaja =
                    `nova-grupa-jela-${indeks}`;

                const prvoJelo =
                    jelaGrupe[0];

                const slika =
                    prvoJelo.slika ||
                    "assets/images/restoran-interijer-2.png";

                karticaGrupe.className =
                    "menu-category";

                karticaGrupe.dataset.dinamickaGrupa =
                    "da";

                karticaGrupe.dataset.kategorija =
                    kategorija;

                karticaGrupe.innerHTML = `
                    <button
                        class="category-image-toggle"
                        type="button"
                        data-target="${idSadrzaja}"
                        aria-expanded="false"
                    >
                        <img
                            src="${sigurniTekstMenija(slika)}"
                            alt="Grupa ${sigurniTekstMenija(
                                uljepsajNazivGrupe(
                                    kategorija
                                )
                            )}"
                        >

                        <div class="category-image-overlay">
                            <h3>
                                ${sigurniTekstMenija(
                                    uljepsajNazivGrupe(
                                        kategorija
                                    )
                                )}
                            </h3>

                            <p>
                                Klikni za prikaz jela,
                                sastojaka i cijena.
                            </p>

                            <span
                                class="category-action-label"
                            >
                                Otvori ponudu
                            </span>
                        </div>
                    </button>

                    <div
                        id="${idSadrzaja}"
                        class="product-grid category-content hidden"
                    ></div>
                `;

                const sadrzajGrupe =
                    karticaGrupe.querySelector(
                        ".category-content"
                    );

                jelaGrupe.forEach(jelo => {
                    sadrzajGrupe.appendChild(
                        napraviKarticuJela(jelo)
                    );
                });

                prikazKategorija.appendChild(
                    karticaGrupe
                );
            }
        );

    stalneGrupe.forEach(prikaz => {
        if (
            prikaz &&
            prikaz.children.length === 0
        ) {
            prikaz.innerHTML = `
                <p>
                    Trenutačno nema dostupnih jela
                    u ovoj kategoriji.
                </p>
            `;
        }
    });
}

function pokreniKategorijeMenija() {
    const gumbi = document.querySelectorAll(
        ".category-toggle, .category-image-toggle"
    );

    gumbi.forEach(gumb => {
        if (gumb.dataset.pokrenut === "da") {
            return;
        }

        gumb.dataset.pokrenut = "da";

        gumb.addEventListener("click", () => {
            const idCilja =
                gumb.dataset.target;

            const sadrzaj =
                document.getElementById(idCilja);

            const oznaka =
                gumb.querySelector(
                    ".category-action-label"
                );

            if (!sadrzaj) {
                return;
            }

            sadrzaj.classList.toggle("hidden");
            gumb.classList.toggle("open");

            const otvoreno =
                !sadrzaj.classList.contains("hidden");

            gumb.setAttribute(
                "aria-expanded",
                String(otvoreno)
            );

            if (oznaka) {
                oznaka.textContent = otvoreno
                    ? "Zatvori ponudu"
                    : "Otvori ponudu";
            }
        });
    });
}

function pokreniAutomatskoOsvjezavanjeMenija() {
    if (
        !document.getElementById(
            "dinamickeKategorije"
        )
    ) {
        return;
    }

    /*
    Ako su administracija i meni otvoreni
    u dvije kartice, promjena se učitava ponovno.
    */
    window.addEventListener(
        "storage",
        async dogadaj => {
            if (
                dogadaj.key !==
                "bellaJelaAzurirana"
            ) {
                return;
            }

            const jelaUcitana =
                await ucitajProizvode();

            if (!jelaUcitana) {
                return;
            }

            prikaziProizvode();
            pokreniKategorijeMenija();
        }
    );
}

function prikaziPopup(tip, naslov, poruka) {
    const popup =
        document.getElementById("popup");

    const popupNaslov =
        document.getElementById("popupNaslov");

    const popupPoruka =
        document.getElementById("popupPoruka");

    const popupTelefon =
        document.getElementById("popupTelefon");

    if (
        !popup ||
        !popupNaslov ||
        !popupPoruka ||
        !popupTelefon
    ) {
        return;
    }

    popupNaslov.textContent = naslov;
    popupPoruka.textContent = poruka;

    popup.classList.remove(
        "hidden",
        "success",
        "error"
    );

    popup.classList.add(tip);

    if (tip === "error") {
        popupTelefon.classList.remove("hidden");
    } else {
        popupTelefon.classList.add("hidden");
    }
}

function zatvoriPopup() {
    const popup =
        document.getElementById("popup");

    if (popup) {
        popup.classList.add("hidden");
    }
}

function pokreniPomocnika() {
    const chatToggle =
        document.getElementById("chatToggle");

    const chatbox =
        document.getElementById("chatbox");

    const posaljiChat =
        document.getElementById("posaljiChat");

    if (
        !chatToggle ||
        !chatbox ||
        !posaljiChat
    ) {
        return;
    }

    chatToggle.addEventListener("click", () => {
        chatbox.classList.toggle("show");
    });

    posaljiChat.addEventListener("click", () => {
        const korisnickiUnos =
            document.getElementById(
                "korisnickiUnos"
            );

        const odgovor =
            document.getElementById(
                "odgovorChata"
            );

        if (!korisnickiUnos || !odgovor) {
            return;
        }

        const unos =
            korisnickiUnos.value.toLowerCase();

        if (unos.includes("meni")) {
            odgovor.textContent =
                "Meni možete otvoriti klikom na stavku Meni u navigaciji.";
        } else if (
            unos.includes("narudžba") ||
            unos.includes("naruc")
        ) {
            odgovor.textContent =
                "Narudžbu možete napraviti kroz Meni i Košaricu.";
        } else if (
            unos.includes("košarica") ||
            unos.includes("kosarica")
        ) {
            odgovor.textContent =
                "Košarica je posebna stavka u navigaciji i prikazuje broj spremljenih jela.";
        } else if (
            unos.includes("kontakt")
        ) {
            odgovor.textContent =
                `Kontakt restorana je ${BROJ_TELEFONA_RESTORANA}.`;
        } else if (
            unos.includes("radno vrijeme")
        ) {
            odgovor.textContent =
                "Radimo svaki dan od 10:00 do 23:00.";
        } else {
            odgovor.textContent =
                "Hvala na pitanju. Za dodatne informacije nazovite restoran.";
        }
    });
}