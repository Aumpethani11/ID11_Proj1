import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-YrIFHIZQcFdYouvVix2O5d6YVjIqxg4",
  authDomain: "authentication-d4695.firebaseapp.com",
  projectId: "authentication-d4695",
  storageBucket: "authentication-d4695.firebasestorage.app",
  messagingSenderId: "1006779223139",
  appId: "1:1006779223139:web:1ac6c4059893c0a76e7c56",

};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db};

