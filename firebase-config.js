import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCqOsQB330J3oaR1lMMLD9Z7FK8lb_XGRs",
    authDomain: "restoran-bella.firebaseapp.com",
    databaseURL: "https://restoran-bella-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "restoran-bella",
    storageBucket: "restoran-bella.firebasestorage.app",
    messagingSenderId: "305969688706",
    appId: "1:305969688706:web:7c227134c5703be80b849b",
    measurementId: "G-S63GHQ05TC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };