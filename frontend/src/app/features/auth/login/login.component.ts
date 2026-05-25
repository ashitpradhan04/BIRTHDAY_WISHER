// src/app/features/auth/login/login.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand-icon">🎂</div>
          <h1>Birthday Wisher</h1>
          <p>Enterprise Edition</p>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form">
          <h2>Welcome back</h2>
          <p class="subtitle">Sign in to your account</p>

          <div class="field">
            <label for="email">Email address</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   placeholder="you@company.com" required autocomplete="email"/>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" [type]="showPwd ? 'text' : 'password'"
                   [(ngModel)]="password" name="password"
                   placeholder="••••••••" required autocomplete="current-password"/>
            <button type="button" class="pwd-toggle" (click)="showPwd = !showPwd">
              {{ showPwd ? '🙈' : '👁️' }}
            </button>
          </div>

          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> }
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>

          <p class="auth-link">
            Don't have an account? <a routerLink="/auth/register">Register</a>
          </p>
        </form>

        <div class="demo-hint">
          <strong>Demo:</strong> admin&#64;birthday.com / Admin&#64;123
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0f0a1e; position: relative; overflow: hidden;
      font-family: 'Outfit', 'Segoe UI', sans-serif;
    }
    .auth-bg { position: absolute; inset: 0; }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
    .orb-1 { width: 400px; height: 400px; background: #7c3aed; top: -100px; left: -100px; animation: float1 8s infinite ease-in-out; }
    .orb-2 { width: 350px; height: 350px; background: #ec4899; bottom: -80px; right: -80px; animation: float2 10s infinite ease-in-out; }
    .orb-3 { width: 250px; height: 250px; background: #06b6d4; top: 50%; left: 60%; animation: float1 12s infinite ease-in-out reverse; }
    @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)} }
    @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,20px)} }

    .auth-card {
      position: relative; z-index: 1; background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px; padding: 40px; width: 100%; max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .auth-brand { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 48px; margin-bottom: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    .auth-brand h1 { color: #fff; font-size: 22px; font-weight: 700; margin: 0; }
    .auth-brand p { color: rgba(255,255,255,0.4); font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 2px; }

    .auth-form h2 { color: #fff; font-size: 20px; font-weight: 600; margin: 0 0 4px; }
    .subtitle { color: rgba(255,255,255,0.5); font-size: 14px; margin: 0 0 24px; }

    .field { position: relative; margin-bottom: 18px; }
    .field label { display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; margin-bottom: 6px; }
    .field input {
      width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
      color: #fff; font-size: 15px; outline: none; box-sizing: border-box;
      transition: all 0.2s;
    }
    .field input:focus { border-color: #7c3aed; background: rgba(124,58,237,0.1); box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
    .field input::placeholder { color: rgba(255,255,255,0.25); }
    .pwd-toggle { position: absolute; right: 12px; top: 36px; background: none; border: none; cursor: pointer; font-size: 16px; }

    .alert { padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
    .alert-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }

    .btn-primary {
      width: 100%; padding: 13px; background: linear-gradient(135deg, #7c3aed, #ec4899);
      border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-link { text-align: center; color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 20px; }
    .auth-link a { color: #a78bfa; font-weight: 600; text-decoration: none; }
    .auth-link a:hover { color: #c4b5fd; }

    .demo-hint { margin-top: 20px; padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 8px; color: rgba(255,255,255,0.4); font-size: 12px; text-align: center; border: 1px dashed rgba(255,255,255,0.1); }
    .demo-hint strong { color: rgba(255,255,255,0.6); }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPwd = false;
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.status === 401 ? 'Invalid email or password.' : 'Login failed. Please try again.');
      }
    });
  }
}
