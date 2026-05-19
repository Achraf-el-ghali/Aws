import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

        <!-- Login Form -->
        <form *ngIf="!showMfa" (ngSubmit)="onLogin()">
          <h2>Connexion</h2>
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
          <div class="demo-credentials">
            <p><strong>Comptes démo :</strong></p>
            <p>Admin : admin&#64;cloudhealth.com / admin123</p>
            <p>Patient : patient&#64;cloudhealth.com / patient123</p>
          </div>
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
          <div class="demo-credentials">
            <p><strong>Codes MFA démo :</strong></p>
            <p>Admin : 123456 | Patient : 654321</p>
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
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
      .logo-icon { font-size: 48px; color: #2563eb; }
      h1 { font-size: 24px; margin-top: 12px; color: #1e293b; }
      p { color: #64748b; font-size: 14px; }
    }
    h2 { font-size: 18px; margin-bottom: 20px; color: #334155; text-align: center; }
    .form-group { margin-bottom: 16px;
      label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #475569; i { margin-right: 6px; } }
      input { width: 100%; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;
        &:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; } }
    }
    .mfa-input { text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: 700; }
    .mfa-info { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 16px; }
    .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 6px; font-size: 13px; margin-bottom: 12px; text-align: center; }
    .btn-full { width: 100%; justify-content: center; padding: 12px; margin-top: 8px; }
    .demo-credentials { margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b; text-align: center;
      p { margin: 4px 0; } strong { color: #334155; } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  mfaCode = '';
  showMfa = false;
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.redirectByRole();
    }
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
        this.redirectByRole();
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
