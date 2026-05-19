import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'patient';
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private mfaPending = false;
  private pendingUser: User | null = null;

  // Simulated users database
  private users: Array<User & { password: string; mfaCode: string }> = [
    { id: 1, email: 'admin@cloudhealth.com', password: 'admin123', nom: 'Martin', prenom: 'Dr. Pierre', role: 'admin', mfaCode: '123456' },
    { id: 2, email: 'patient@cloudhealth.com', password: 'patient123', nom: 'Dupont', prenom: 'Jean', role: 'patient', mfaCode: '654321' },
  ];

  private nextId = 3;

  constructor(private router: Router) {
    const stored = localStorage.getItem('cloudhealth_user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser; }
  get isMfaPending(): boolean { return this.mfaPending; }
  get userRole(): string { return this.currentUser?.role || ''; }

  login(email: string, password: string): Observable<{ success: boolean; message: string; requiresMfa?: boolean }> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return of({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    this.pendingUser = { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role };
    this.mfaPending = true;
    return of({ success: true, message: 'Code MFA envoyé', requiresMfa: true }).pipe(delay(500));
  }

  verifyMfa(code: string): Observable<{ success: boolean; message: string }> {
    const user = this.users.find(u => u.email === this.pendingUser?.email);
    if (!user || user.mfaCode !== code) {
      return of({ success: false, message: 'Code MFA invalide' });
    }
    const token = 'jwt_' + btoa(JSON.stringify(this.pendingUser)) + '_' + Date.now();
    const authenticatedUser: User = { ...this.pendingUser!, token };
    this.currentUserSubject.next(authenticatedUser);
    localStorage.setItem('cloudhealth_user', JSON.stringify(authenticatedUser));
    this.mfaPending = false;
    this.pendingUser = null;
    return of({ success: true, message: 'Authentification réussie' }).pipe(delay(300));
  }

  register(email: string, password: string, nom: string, prenom: string, telephone: string): Observable<{ success: boolean; message: string; mfaCode?: string }> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return of({ success: false, message: 'Un compte avec cet email existe déjà' }).pipe(delay(500));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return of({ success: false, message: 'Format d\'email invalide' }).pipe(delay(300));
    }

    // Generate random 6-digit MFA code
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new patient user
    const newUser = {
      id: this.nextId++,
      email,
      password,
      nom,
      prenom,
      role: 'patient' as const,
      mfaCode,
      telephone
    };

    this.users.push(newUser as any);

    return of({
      success: true,
      message: `Inscription réussie ! Votre code MFA est : ${mfaCode}. Conservez-le précieusement.`,
      mfaCode
    }).pipe(delay(800));
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.mfaPending = false;
    this.pendingUser = null;
    localStorage.removeItem('cloudhealth_user');
    this.router.navigate(['/login']);
  }
}
