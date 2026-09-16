const BROJ_TELEFONA_RESTORANA = "+385 98 123 456";

const FIREBASE_BAZA_URL =
    "https://restoran-bella-default-rtdb.europe-west1.firebasedatabase.app";

// Početna jela prikazuju se ako Firebase baza još nema spremljene proizvode.
const pocetnaJela = [
    {
        id: 1,
        kategorija: "pizza",
        naziv: "Pizza Margherita",
        slika: "assets/images/pizza-margherita.jpg",
        opis: "Klasična pizza s blagim i svježim okusom.",
        sastojci: [
            "Umak od rajčice",
            "Mozzarella",
            "Svježi bosiljak",
            "Maslinovo ulje"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 8.5
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 11.5
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 18.5
            }
        ],
        aktivan: true
    },
    {
        id: 2,
        kategorija: "pizza",
        naziv: "Pizza Capricciosa",
        slika: "assets/images/pizza-capricciosa.jpg",
        opis: "Popularna pizza bogata klasičnim sastojcima.",
        sastojci: [
            "Umak od rajčice",
            "Mozzarella",
            "Šunka",
            "Gljive",
            "Masline",
            "Origano"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 9.5
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 12.5
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 20.5
            }
        ],
        aktivan: true
    },
    {
        id: 3,
        kategorija: "pizza",
        naziv: "Pizza Slavonska",
        slika: "assets/images/pizza-slavonska.jpg",
        opis: "Pikantna pizza s domaćim karakterom.",
        sastojci: [
            "Umak od rajčice",
            "Mozzarella",
            "Kulen",
            "Šunka",
            "Luk",
            "Feferoni"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 10.5
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 14.5
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 23.5
            }
        ],
        aktivan: true
    },
    {
        id: 4,
        kategorija: "pizza",
        naziv: "Pizza Quattro Formaggi",
        slika: "assets/images/pizza-quattro-formaggi.jpg",
        opis: "Pizza s četiri vrste sira.",
        sastojci: [
            "Mozzarella",
            "Gorgonzola",
            "Edamer",
            "Parmezan",
            "Maslinovo ulje"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 10.2
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 13.8
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 22.5
            }
        ],
        aktivan: true
    },
    {
        id: 5,
        kategorija: "pizza",
        naziv: "Pizza Diavola",
        slika: "assets/images/pizza-diavola.jpg",
        opis: "Ljuta pizza za ljubitelje pikantnog okusa.",
        sastojci: [
            "Umak od rajčice",
            "Mozzarella",
            "Ljuta salama",
            "Chili",
            "Feferoni",
            "Origano"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 10
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 13.5
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 22
            }
        ],
        aktivan: true
    },
    {
        id: 6,
        kategorija: "pizza",
        naziv: "Pizza Vegetariana",
        slika: "assets/images/pizza-vegetariana.jpg",
        opis: "Lagana pizza s povrćem.",
        sastojci: [
            "Umak od rajčice",
            "Mozzarella",
            "Paprika",
            "Tikvica",
            "Gljive",
            "Kukuruz",
            "Masline"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 9.8
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 12.9
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 21
            }
        ],
        aktivan: true
    },
    {
        id: 7,
        kategorija: "pizza",
        naziv: "Pizza Prosciutto e Funghi",
        slika: "assets/images/pizza-prosciutto-funghi.jpg",
        opis: "Pizza sa šunkom i gljivama.",
        sastojci: [
            "Umak od rajčice",
            "Mozzarella",
            "Šunka",
            "Gljive",
            "Origano"
        ],
        velicine: [
            {
                naziv: "Mala",
                opisVelicine: "24 cm",
                cijena: 9.7
            },
            {
                naziv: "Srednja",
                opisVelicine: "32 cm",
                cijena: 12.8
            },
            {
                naziv: "Jumbo",
                opisVelicine: "45 cm",
                cijena: 20.8
            }
        ],
        aktivan: true
    },
    {
        id: 8,
        kategorija: "burger",
        naziv: "Klasični cheeseburger",
        slika: "assets/images/burger-classic.jpg",
        opis: "Klasični burger s junećim mesom i cheddar sirom.",
        sastojci: [
            "Burger pecivo",
            "Juneće meso",
            "Cheddar",
            "Salata",
            "Rajčica",
            "Kiseli krastavci",
            "Burger umak"
        ],
        gramaza: "250 g",
        cijena: 9.5,
        aktivan: true
    },
    {
        id: 9,
        kategorija: "burger",
        naziv: "Burger sa slaninom i BBQ umakom",
        slika: "assets/images/burger-bacon-bbq.jpg",
        opis: "Burger s hrskavom slaninom i BBQ umakom.",
        sastojci: [
            "Burger pecivo",
            "Juneće meso",
            "Cheddar",
            "Slanina",
            "Prženi luk",
            "BBQ umak"
        ],
        gramaza: "300 g",
        cijena: 11.5,
        aktivan: true
    },
    {
        id: 10,
        kategorija: "burger",
        naziv: "Bella dupli burger",
        slika: "assets/images/burger-double.jpg",
        opis: "Veliki burger s dva komada mesa.",
        sastojci: [
            "Burger pecivo",
            "2x juneće meso",
            "Dupli cheddar",
            "Salata",
            "Rajčica",
            "Bella umak"
        ],
        gramaza: "420 g",
        cijena: 14.5,
        aktivan: true
    },
    {
        id: 11,
        kategorija: "burger",
        naziv: "Pileći burger",
        slika: "assets/images/burger-chicken.jpg",
        opis: "Burger s piletinom i blagim umakom.",
        sastojci: [
            "Burger pecivo",
            "Pileći file",
            "Salata",
            "Rajčica",
            "Majoneza",
            "Blagi umak"
        ],
        gramaza: "260 g",
        cijena: 9.8,
        aktivan: true
    },
    {
        id: 12,
        kategorija: "cevapi",
        naziv: "Mali ćevapi",
        slika: "assets/images/cevapi-mali.jpg",
        opis: "Manja porcija ćevapa u lepinji.",
        sastojci: [
            "5 ćevapa",
            "Lepinja",
            "Luk",
            "Ajvar"
        ],
        gramaza: "180 g",
        cijena: 7.5,
        aktivan: true
    },
    {
        id: 13,
        kategorija: "cevapi",
        naziv: "Veliki ćevapi",
        slika: "assets/images/cevapi-veliki.jpg",
        opis: "Klasična velika porcija ćevapa.",
        sastojci: [
            "10 ćevapa",
            "Lepinja",
            "Luk",
            "Ajvar"
        ],
        gramaza: "300 g",
        cijena: 10.5,
        aktivan: true
    },
    {
        id: 14,
        kategorija: "cevapi",
        naziv: "Ćevapi s kajmakom",
        slika: "assets/images/cevapi-kajmak.jpg",
        opis: "Velika porcija ćevapa s kajmakom.",
        sastojci: [
            "10 ćevapa",
            "Lepinja",
            "Luk",
            "Kajmak",
            "Ajvar"
        ],
        gramaza: "340 g",
        cijena: 12,
        aktivan: true
    },
    {
        id: 15,
        kategorija: "cevapi",
        naziv: "Mega ćevapi",
        slika: "assets/images/cevapi-mega.jpg",
        opis: "Velika porcija za jako gladne goste.",
        sastojci: [
            "15 ćevapa",
            "Velika lepinja",
            "Luk",
            "Kajmak",
            "Ajvar"
        ],
        gramaza: "500 g",
        cijena: 15.5,
        aktivan: true
    }
];

window.pocetnaJelaZaFirebase = pocetnaJela;

let proizvodi = pocetnaJela;

// Firebase može vratiti proizvode kao objekt ili kao polje.
// Funkcija oba oblika pretvara u običan popis.
function pretvoriFirebaseProizvode(podatci) {
    if (!podatci) {
        return [];
    }

    if (Array.isArray(podatci)) {
        return podatci.filter(jelo => jelo !== null);
    }

    return Object.entries(podatci).map(([firebaseId, jelo]) => {
        return {
            ...jelo,
            id: jelo.id ?? firebaseId,
            firebaseId
        };
    });
}

async function ucitajProizvode() {
    try {
        const odgovor = await fetch(
            `${FIREBASE_BAZA_URL}/products.json`
        );

        if (!odgovor.ok) {
            throw new Error("Firebase nije vratio popis jela.");
        }

        const podatci = await odgovor.json();
        const firebaseProizvodi =
            pretvoriFirebaseProizvode(podatci);

        if (firebaseProizvodi.length > 0) {
            proizvodi = firebaseProizvodi;

            console.log(
                "Jela su učitana iz Firebase Realtime Databasea."
            );
        } else {
            proizvodi = pocetnaJela;

            console.log(
                "Firebase još nema spremljena jela. Prikazuje se početni meni."
            );
        }

        return true;
    } catch (greska) {
        console.error(
            "Pogreška pri povezivanju s Firebase bazom:",
            greska
        );

        proizvodi = pocetnaJela;
        return true;
    }
}