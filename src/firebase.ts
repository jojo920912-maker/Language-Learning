// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAGC-UyNnzdnXxgUGx6xRFIe37tLZwKuTU",
  authDomain: "language-study-58fd8.firebaseapp.com",
  projectId: "language-study-58fd8",
  storageBucket: "language-study-58fd8.firebasestorage.app",
  messagingSenderId: "774905161715",
  appId: "1:774905161715:web:9a49907ff4896e0ad7d486"
}

const app = initializeApp(firebaseConfig)

// 匯出 Firestore 實例，之後元件裡直接 import db 來用
export const db = getFirestore(app)

// 匯出 Auth 實例，供登入/註冊/登出使用
export const auth = getAuth(app)