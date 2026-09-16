document.addEventListener("DOMContentLoaded", () => {
    const gumb = document.getElementById("prikaziLokaciju");
    const okvir = document.getElementById("lokacijaOkvir");
    const elementKarte = document.getElementById("kartaRestorana");

    if (!gumb || !okvir || !elementKarte) {
        return;
    }

    // Koordinate se mogu zamijeniti kada restoran dobije stvarnu adresu.
    const zemljopisnaSirina = 45.8150;
    const zemljopisnaDuzina = 15.9819;
    let karta = null;

    function napraviKartu() {
        if (karta || typeof L === "undefined") {
            return;
        }

        karta = L.map("kartaRestorana").setView(
            [zemljopisnaSirina, zemljopisnaDuzina],
            16
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> suradnici'
        }).addTo(karta);

        L.marker([zemljopisnaSirina, zemljopisnaDuzina])
            .addTo(karta)
            .bindPopup("<strong>Restoran Bella</strong><br>Ulica restorana 12, Zagreb")
            .openPopup();
    }

    gumb.addEventListener("click", () => {
        const otvoreno = okvir.classList.toggle("hidden") === false;
        gumb.textContent = otvoreno ? "Sakrij lokaciju" : "Prikaži lokaciju";
        gumb.setAttribute("aria-expanded", String(otvoreno));

        if (otvoreno) {
            napraviKartu();

            // Leaflet mora ponovno izračunati veličinu nakon prikaza skrivenog okvira.
            setTimeout(() => karta?.invalidateSize(), 0);
        }
    });
});
