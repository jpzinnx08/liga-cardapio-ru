import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signInWithPopup, GoogleAuthProvider, signOut, User,
} from 'firebase/auth';
import { firebaseConfig } from '../../environments/firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth(initializeApp(firebaseConfig));
  user: User | null = null;
  ready: Promise<void>;

  constructor() {
    this.ready = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (u) => { this.user = u; resolve(); });
    });
  }

  get firstName(): string {
    const n = this.user?.displayName || this.user?.email?.split('@')[0] || '';
    return n.split(' ')[0];
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    this.user = this.auth.currentUser;
  }

  async google() {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() { return signOut(this.auth); }
}
