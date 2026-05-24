// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand-icon">🎉</div>
          <h1>Join Birthday Wisher</h1>
          <p>Never miss a birthday again</p>
        </div>
        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="row-2">
            <div class="field">
              <label>First name</label>
              <input type="text" [(ngModel)]="form.firstName" name="firstName" placeholder="Jane" required/>
            </div>
            <div class="field">
              <label>Last name</label>
              <input type="text" [(ngModel)]="form.lastName" name="lastName" placeholder="Doe" required/>
            </div>
          </div>
          <div class="field">
            <label>Email address</label>
            <input type="email" [(ngModel)]="form.email" name="email" placeholder="jane@company.com" required/>
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="form.password" name="password" placeholder="min 8 characters" required/>
          </div>
          <div class="field">
            <label>Birthday</label>
            <input type="date" [(ngModel)]="form.birthday" name="birthday" required [max]="today"/>
          </div>
          <div class="field">
            <label>Phone (optional, for SMS)</label>
            <input type="tel" [(ngModel)]="form.phoneNumber" name="phoneNumber" placeholder="+91 98765 43210"/>
          </div>
          <div class="field">
            <label>Notification preference</label>
            <select [(ngModel)]="form.notificationPreference" name="notificationPreference">
              <option value="EMAIL">Email only</option>
              <option value="SMS">SMS only</option>
              <option value="BOTH">Email + SMS</option>
            </select>
          </div>
          <div class="field">
            <label>Custom birthday message (optional)</label>
            <textarea [(ngModel)]="form.customMessage" name="customMessage" rows="2"
                      placeholder="Your personal birthday message…"></textarea>
          </div>
          @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
          @if (success()) { <div class="alert alert-success">{{ success() }}</div> }
          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> }
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
          <p class="auth-link">Already registered? <a routerLink="/auth/login">Sign in</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f0a1e; position:relative; overflow:hidden; font-family:'Outfit','Segoe UI',sans-serif; padding: 20px; }
    .auth-bg { position:absolute; inset:0; }
    .orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.35; }
    .orb-1 { width:400px; height:400px; background:#7c3aed; top:-100px; right:-100px; }
    .orb-2 { width:350px; height:350px; background:#ec4899; bottom:-80px; left:-80px; }
    .auth-card { position:relative; z-index:1; background:rgba(255,255,255,0.05); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:36px; width:100%; max-width:500px; }
    .auth-brand { text-align:center; margin-bottom:24px; }
    .brand-icon { font-size:40px; margin-bottom:8px; }
    .auth-brand h1 { color:#fff; font-size:20px; font-weight:700; margin:0; }
    .auth-brand p { color:rgba(255,255,255,0.4); font-size:13px; margin:4px 0 0; }
    .row-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .field { margin-bottom:16px; }
    .field label { display:block; color:rgba(255,255,255,0.7); font-size:13px; font-weight:500; margin-bottom:5px; }
    .field input, .field select, .field textarea { width:100%; padding:10px 14px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); border-radius:10px; color:#fff; font-size:14px; outline:none; box-sizing:border-box; transition:all 0.2s; font-family:inherit; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color:#7c3aed; background:rgba(124,58,237,0.1); }
    .field input::placeholder, .field textarea::placeholder { color:rgba(255,255,255,0.25); }
    .field select option { background:#1e1234; }
    .field textarea { resize:vertical; }
    .alert { padding:10px 14px; border-radius:10px; font-size:13px; margin-bottom:14px; }
    .alert-error { background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; }
    .alert-success { background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); color:#86efac; }
    .btn-primary { width:100%; padding:12px; background:linear-gradient(135deg,#7c3aed,#ec4899); border:none; border-radius:12px; color:#fff; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
    .btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(124,58,237,0.4); }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .auth-link { text-align:center; color:rgba(255,255,255,0.5); font-size:14px; margin-top:16px; }
    .auth-link a { color:#a78bfa; font-weight:600; text-decoration:none; }
  `]
})
export class RegisterComponent {
  form = {
    firstName: '', lastName: '', email: '', password: '',
    birthday: '', phoneNumber: '', customMessage: '', notificationPreference: 'EMAIL' as 'EMAIL' | 'SMS' | 'BOTH'
  };
  today = new Date().toISOString().split('T')[0];
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.loading.set(true);
    this.error.set(''); this.success.set('');
    this.auth.register(this.form).subscribe({
      next: () => {
        this.success.set('Account created! Redirecting to login…');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
