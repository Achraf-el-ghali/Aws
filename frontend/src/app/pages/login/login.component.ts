import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <i class="fas fa-heartbeat logo-icon"></i>
          <h1>Cloud Health</h1>
          <p>Plateforme de Gestion de Santé</p>
        </div>

        <!-- Tab Toggle -->
        <div class="tab-toggle" *ngIf="!showMfa">
          <button class="tab-btn" [class.active]="activeTab === 'login'" (click)="switchTab('login')">
            <i class="fas fa-sign-in-alt"></i> Connexion
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'register'" (click)="switchTab('register')">
            <i class="fas fa-user-plus"></i> Inscription
          </button>
        </div>

        <!-- Success Message -->
        <div class="success-message" *ngIf="successMessage">
          <i class="fas fa-check-circle"></i> {{ successMessage }}
        </div>

        <!-- Login Form -->
        <form *ngIf="activeTab === 'login' && !showMfa" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label><i class="fas fa-envelope"></i> Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="votre@email.com" required>
          </div>
          <div class="form-group">
            <label><i class="fas fa-lock"></i> Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
            <i class="fas fa-sign-in-alt"></i> {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <!-- Collapsible Demo Credentials -->
          <div class="demo-section">
            <button type="button" class="demo-toggle" (click)="showDemoCredentials = !showDemoCredentials">
              <i class="fas" [ngClass]="showDemoCredentials ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              Comptes de démonstration
            </button>
            <div class="demo-credentials" *ngIf="showDemoCredentials">
              <p><strong>Admin :</strong> admin&#64;cloudhealth.com / admin123</p>
              <p><strong>Patient :</strong> patient&#64;cloudhealth.com / patient123</p>
              <p class="demo-mfa"><strong>Codes MFA :</strong> Admin: 123456 | Patient: 654321</p>
            </div>
          </div>
        </form>

        <!-- Registration Form -->
        <form *ngIf="activeTab === 'register' && !showMfa" (ngSubmit)="onRegister()">
          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-user"></i> Nom</label>
              <input type="text" [(ngModel)]="regNom" name="regNom" placeholder="Dupont" required>
            </div>
            <div class="form-group">
              <label><i class="fas fa-user"></i> Prénom</label>
              <input type="text" [(ngModel)]="regPrenom" name="regPrenom" placeholder="Jean" required>
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-envelope"></i> Email</label>
            <input type="email" [(ngModel)]="regEmail" name="regEmail" placeholder="votre@email.com" required>
          </div>
          <div class="form-group">
            <label><i class="fas fa-phone"></i> Téléphone</label>
            <input type="tel" [(ngModel)]="regTelephone" name="regTelephone" placeholder="+33 6 12 34 56 78" required>
          </div>
          <div class="form-group">
            <label><i class="fas fa-lock"></i> Mot de passe</label>
            <input type="password" [(ngModel)]="regPassword" name="regPassword" placeholder="••••••••" required>
          </div>
          <div class="form-group">
            <label><i class="fas fa-lock"></i> Confirmer mot de passe</label>
            <input type="password" [(ngModel)]="regConfirmPassword" name="regConfirmPassword" placeholder="••••••••" required>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
            <i class="fas fa-user-plus"></i> {{ loading ? 'Inscription...' : 'S\\'inscrire' }}
          </button>
        </form>

        <!-- MFA Form -->
        <form *ngIf="showMfa" (ngSubmit)="onVerifyMfa()">
          <h2><i class="fas fa-shield-alt"></i> Vérification MFA</h2>
          <p class="mfa-info">Un code de vérification a été envoyé à votre appareil.</p>
          <div class="form-group">
            <label>Code à 6 chiffres</label>
            <input type="text" [(ngModel)]="mfaCode" name="mfaCode" placeholder="000000" maxlength="6" class="mfa-input" required>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
            <i class="fas fa-check-circle"></i> {{ loading ? 'Vérification...' : 'Vérifier' }}
          </button>
          <div class="demo-section">
            <button type="button" class="demo-toggle" (click)="showDemoCredentials = !showDemoCredentials">
              <i class="fas" [ngClass]="showDemoCredentials ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              Codes MFA de démonstration
            </button>
            <div class="demo-credentials" *ngIf="showDemoCredentials">
              <p><strong>Admin :</strong> 123456 | <strong>Patient :</strong> 654321</p>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-full" (click)="backToLogin()">
            <i class="fas fa-arrow-left"></i> Retour
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e40af 100%);
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 24px;
      .logo-icon { font-size: 48px; color: #2563eb; }
      h1 { font-size: 24px; margin-top: 12px; color: #1e293b; }
      p { color: #64748b; font-size: 14px; }
    }

    /* Tab Toggle */
    .tab-toggle {
      display: flex;
      background: #f1f5f9;
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .tab-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &.active {
        background: white;
        color: #2563eb;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      &:hover:not(.active) {
        color: #334155;
      }
    }

    /* Success Message */
    .success-message {
      background: #ecfdf5;
      color: #059669;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
      border: 1px solid #a7f3d0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      i { font-size: 16px; }
    }

    /* Form */
    h2 { font-size: 18px; margin-bottom: 20px; color: #334155; text-align: center; }
    .form-row {
      display: flex;
      gap: 12px;
      .form-group { flex: 1; }
    }
    .form-group { margin-bottom: 14px;
      label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #475569; i { margin-right: 6px; color: #94a3b8; } }
      input { width: 100%; padding: 11px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.2s;
        &:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
        &::placeholder { color: #cbd5e1; }
      }
    }
    .mfa-input { text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: 700; }
    .mfa-info { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 16px; }
    .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 6px; font-size: 13px; margin-bottom: 12px; text-align: center; border: 1px solid #fecaca; }
    .btn-full { width: 100%; justify-content: center; padding: 12px; margin-top: 8px; }
    .btn-primary {
      background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 14px;
      cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
      &:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .btn-outline {
      background: none; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 500; font-size: 14px;
      cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
      &:hover { background: #f8fafc; color: #334155; border-color: #cbd5e1; }
    }

    /* Demo Section */
    .demo-section {
      margin-top: 20px;
    }
    .demo-toggle {
      width: 100%;
      padding: 10px;
      background: none;
      border: 1px dashed #e2e8f0;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: #cbd5e1;
        color: #64748b;
        background: #f8fafc;
      }
    }
    .demo-credentials {
      margin-top: 10px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 12px;
      color: #64748b;
      text-align: center;
      border: 1px solid #e2e8f0;
      p { margin: 4px 0; }
      strong { color: #334155; }
      .demo-mfa { margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
    }
  `]
})
export class LoginComponent {
  // Tab state
  activeTab: 'login' | 'register' = 'login';

  // Login fields
  email = '';
  password = '';
  mfaCode = '';
  showMfa = false;

  // Registration fields
  regNom = '';
  regPrenom = '';
  regEmail = '';
  regTelephone = '';
  regPassword = '';
  regConfirmPassword = '';

  // UI state
  loading = false;
  error = '';
  successMessage = '';
  showDemoCredentials = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // Force logout when arriving on login page
    if (this.authService.isLoggedIn) {
      this.authService.logout();
    }
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.error = '';
    this.successMessage = '';
  }

  onLogin(): void {
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe(res => {
      this.loading = false;
      if (res.success && res.requiresMfa) {
        this.showMfa = true;
      } else if (!res.success) {
        this.error = res.message;
      }
    });
  }

  onVerifyMfa(): void {
    this.loading = true;
    this.error = '';
    this.authService.verifyMfa(this.mfaCode).subscribe(res => {
      this.loading = false;
      if (res.success) {
        this.notificationService.showSuccess('Bienvenue sur Cloud Health !');
        this.redirectByRole();
      } else {
        this.error = res.message;
      }
    });
  }

  onRegister(): void {
    this.error = '';

    // Validate required fields
    if (!this.regNom || !this.regPrenom || !this.regEmail || !this.regTelephone || !this.regPassword || !this.regConfirmPassword) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.regEmail)) {
      this.error = 'Format d\'email invalide';
      return;
    }

    // Validate password length
    if (this.regPassword.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    // Validate password match
    if (this.regPassword !== this.regConfirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.authService.register(this.regEmail, this.regPassword, this.regNom, this.regPrenom, this.regTelephone).subscribe(res => {
      this.loading = false;
      if (res.success) {
        this.successMessage = res.message;
        this.notificationService.showSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        // Auto-switch to login tab
        this.activeTab = 'login';
        this.email = this.regEmail;
        // Clear registration fields
        this.regNom = '';
        this.regPrenom = '';
        this.regEmail = '';
        this.regTelephone = '';
        this.regPassword = '';
        this.regConfirmPassword = '';
      } else {
        this.error = res.message;
      }
    });
  }

  backToLogin(): void { this.showMfa = false; this.error = ''; this.mfaCode = ''; }

  private redirectByRole(): void {
    const role = this.authService.userRole;
    this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/patient/dashboard']);
  }
}
