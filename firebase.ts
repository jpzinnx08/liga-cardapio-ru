import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../environments/firebase.config';

/** Uma única instância do Firebase para Auth e Firestore. */
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
