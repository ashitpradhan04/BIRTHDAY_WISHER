import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="form-page">
      <div class="form-card">
        <div class="form-header">
          <a routerLink="/users" class="back-btn">← Back</a>
          <h2>{{ isEdit ? 'Edit User' : 'Add New User' }}</h2>
        </div>

        <form (ngSubmit)="onSubmit()" class="user-form">
          <div class="form-row">
            <div class="field">
              <label>First name *</label>
              <input type="text" [(ngModel)]="form.firstName" name="firstName" required placeholder="Jane"/>
            </div>
            <div class="field">
              <label>Last name *</label>
              <input type="text" [(ngModel)]="form.lastName" name="lastName" required placeholder="Doe"/>
            </div>
          </div>

          <div class="field">
            <label>Email address *</label>
            <input type="email" [(ngModel)]="form.email" name="email" required [disabled]="isEdit" placeholder="jane@company.com"/>
          </div>

          @if (!isEdit) {
            <div class="field">
              <label>Password *</label>
              <input type="password" [(ngModel)]="form.password" name="password" required placeholder="min 8 characters"/>
            </div>
          }

          <div class="form-row">
            <div class="field">
              <label>Birthday *</label>
              <input type="date" [(ngModel)]="form.birthday" name="birthday" required [max]="today"/>
            </div>
            <div class="field">
              <label>Phone number</label>
              <input type="tel" [(ngModel)]="form.phoneNumber" name="phoneNumber" placeholder="+91 98765 43210"/>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Timezone</label>
              <select [(ngModel)]="form.timezone" name="timezone">
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </div>
            <div class="field">
              <label>Notification preference</label>
              <select [(ngModel)]="form.notificationPreference" name="notificationPreference">
                <option value="EMAIL">📧 Email only</option>
                <option value="SMS">📱 SMS only</option>
                <option value="BOTH">📧📱 Email + SMS</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Custom birthday message</label>
            <textarea [(ngModel)]="form.customMessage" name="customMessage" rows="3"
                      placeholder="Write a personal birthday message that will be included in the wish…"></textarea>
          </div>

          @if (isEdit) {
            <div class="field">
              <label>Status</label>
              <select [(ngModel)]="form.active" name="active">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Inactive</option>
              </select>
            </div>
          }

          @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
          @if (success()) { <div class="alert alert-success">{{ success() }}</div> }

          <div class="form-actions">
            <a routerLink="/users" class="btn-secondary">Cancel</a>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              @if (loading()) { <span class="spinner"></span> }
              {{ loading() ? 'Saving…' : (isEdit ? 'Save changes' : 'Create user') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 680px; margin: 0 auto; }
    .form-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; }
    .form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .back-btn { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .back-btn:hover { color: #fff; }
    .form-header h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 20px; }
    .field label { display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; margin-bottom: 6px; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #fff;
      font-size: 14px; outline: none; transition: all 0.2s; font-family: inherit; box-sizing: border-box;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: #7c3aed; background: rgba(124,58,237,0.1); }
    .field input::placeholder, .field textarea::placeholder { color: rgba(255,255,255,0.25); }
    .field input:disabled { opacity: 0.5; cursor: not-allowed; }
    .field select option { background: #1e1234; }
    .field textarea { resize: vertical; }
    .alert { padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
    .alert-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
    .alert-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    .btn-primary { padding: 11px 28px; background: linear-gradient(135deg,#7c3aed,#ec4899); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 11px 24px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.2s; }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class UserFormComponent implements OnInit {
  isEdit = false;
  userId: number | null = null;
  today = new Date().toISOString().split('T')[0];
  loading = signal(false);
  error = signal('');
  success = signal('');

  form: any = {
    firstName: '', lastName: '', email: '', password: '',
    birthday: '', phoneNumber: '', timezone: 'UTC',
    customMessage: '', notificationPreference: 'EMAIL', active: true
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = +id;
      this.userService.getById(this.userId).subscribe(u => {
        this.form = {
          firstName: u.firstName, lastName: u.lastName, email: u.email,
          birthday: u.birthday, phoneNumber: u.phoneNumber || '',
          timezone: u.timezone || 'UTC', customMessage: u.customMessage || '',
          notificationPreference: u.notificationPreference, active: u.active
        };
      });
    }
  }

  onSubmit() {
    this.loading.set(true); this.error.set(''); this.success.set('');
    const obs = this.isEdit
      ? this.userService.update(this.userId!, this.form)
      : this.userService.create(this.form);

    obs.subscribe({
      next: () => {
        this.success.set(this.isEdit ? 'User updated successfully!' : 'User created successfully!');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/users']), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Operation failed. Please try again.');
      }
    });
  }
}
