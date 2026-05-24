import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { UserService } from '../../core/services/user.service';
import { NotificationLog, User } from '../../shared/models/user.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notif-page">
      <!-- Scheduler Panel -->
      <div class="panel">
        <h3>🚀 Scheduler Controls</h3>
        <div class="controls-row">
          <div class="field">
            <label>Trigger for specific date</label>
            <input type="date" [(ngModel)]="triggerDate" [max]="today" class="date-input"/>
          </div>
          <button class="btn-trigger" (click)="triggerScheduler()" [disabled]="triggering()">
            {{ triggering() ? '⏳ Running…' : '▶ Run Scheduler' }}
          </button>
        </div>
        @if (triggerResult()) {
          <div class="result-box">{{ triggerResult() }}</div>
        }
      </div>

      <!-- Test Notification Panel -->
      <div class="panel">
        <h3>🧪 Send Test Notification</h3>
        <div class="controls-row">
          <div class="field" style="flex:1">
            <label>Select user</label>
            <select [(ngModel)]="selectedUserId" class="date-input">
              <option value="">-- Choose a user --</option>
              @for (u of users(); track u.id) {
                <option [value]="u.id">{{ u.firstName }} {{ u.lastName }} ({{ u.email }})</option>
              }
            </select>
          </div>
          <div class="field">
            <label>Type</label>
            <select [(ngModel)]="testType" class="date-input">
              <option value="EMAIL">📧 Email</option>
              <option value="SMS">📱 SMS</option>
            </select>
          </div>
          <button class="btn-trigger" (click)="sendTest()" [disabled]="!selectedUserId || testSending()">
            {{ testSending() ? '⏳ Sending…' : '📤 Send Test' }}
          </button>
        </div>
        @if (testResult()) {
          <div class="result-box" [class.error]="testError()">{{ testResult() }}</div>
        }
      </div>

      <!-- Logs Table -->
      <div class="panel">
        <div class="panel-header">
          <h3>📋 Notification Logs</h3>
          <button class="btn-refresh" (click)="loadLogs()">🔄 Refresh</button>
        </div>
        @if (logs().length === 0) {
          <div class="empty">📭 No notification logs yet</div>
        } @else {
          <table class="log-table">
            <thead>
              <tr><th>User</th><th>Type</th><th>Recipient</th><th>Status</th><th>Sent At</th><th>Error</th></tr>
            </thead>
            <tbody>
              @for (log of logs(); track log.id) {
                <tr>
                  <td>{{ log.userName }}</td>
                  <td><span class="type-chip" [class.sms]="log.type==='SMS'">{{ log.type === 'EMAIL' ? '📧' : '📱' }} {{ log.type }}</span></td>
                  <td class="muted">{{ log.recipient }}</td>
                  <td><span class="status" [class.sent]="log.status==='SENT'" [class.failed]="log.status==='FAILED'" [class.skipped]="log.status==='SKIPPED'">{{ log.status }}</span></td>
                  <td class="muted">{{ log.sentAt | date:'MMM d, HH:mm:ss' }}</td>
                  <td class="error-cell">{{ log.errorMessage || '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .notif-page { display: flex; flex-direction: column; gap: 20px; }
    .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; }
    .panel h3 { color: #fff; font-size: 15px; font-weight: 600; margin: 0 0 20px; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .panel-header h3 { margin: 0; }
    .controls-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500; }
    .date-input { padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #fff; font-size: 14px; outline: none; min-width: 180px; font-family: inherit; }
    .date-input option { background: #1e1234; }
    .btn-trigger { padding: 10px 20px; background: linear-gradient(135deg,#7c3aed,#ec4899); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; align-self: flex-end; }
    .btn-trigger:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,0.4); }
    .btn-trigger:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-refresh { padding: 8px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .result-box { margin-top: 14px; padding: 10px 16px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 8px; color: #86efac; font-size: 13px; }
    .result-box.error { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #fca5a5; }
    .empty { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
    .log-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .log-table th { padding: 10px 12px; color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .log-table td { padding: 12px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); vertical-align: middle; }
    .log-table tr:last-child td { border-bottom: none; }
    .log-table tr:hover td { background: rgba(255,255,255,0.02); }
    .muted { color: rgba(255,255,255,0.45) !important; }
    .type-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(124,58,237,0.2); color: #c4b5fd; }
    .type-chip.sms { background: rgba(6,182,212,0.2); color: #67e8f9; }
    .status { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .status.sent { background: rgba(34,197,94,0.15); color: #86efac; }
    .status.failed { background: rgba(239,68,68,0.15); color: #fca5a5; }
    .status.skipped { background: rgba(156,163,175,0.15); color: #9ca3af; }
    .error-cell { color: rgba(239,68,68,0.7) !important; font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `]
})
export class NotificationsComponent implements OnInit {
  logs = signal<NotificationLog[]>([]);
  users = signal<User[]>([]);
  triggerDate = '';
  today = new Date().toISOString().split('T')[0];
  triggering = signal(false);
  triggerResult = signal('');
  selectedUserId = '';
  testType: 'EMAIL' | 'SMS' = 'EMAIL';
  testSending = signal(false);
  testResult = signal('');
  testError = signal(false);

  constructor(private adminService: AdminService, private userService: UserService) {}

  ngOnInit() { this.loadLogs(); this.loadUsers(); }

  loadLogs() {
    this.adminService.getNotificationLogs().subscribe(l => this.logs.set(l));
  }

  loadUsers() {
    this.userService.getAll().subscribe(u => this.users.set(u.filter(x => x.active)));
  }

  triggerScheduler() {
    this.triggering.set(true); this.triggerResult.set('');
    this.adminService.triggerScheduler(this.triggerDate || undefined).subscribe({
      next: (res) => {
        this.triggerResult.set(`✅ Sent wishes to ${res.usersNotified} user(s) for ${res.date}`);
        this.triggering.set(false); this.loadLogs();
      },
      error: () => { this.triggerResult.set('❌ Scheduler run failed.'); this.triggering.set(false); }
    });
  }

  sendTest() {
    this.testSending.set(true); this.testResult.set(''); this.testError.set(false);
    this.adminService.sendTestNotification(+this.selectedUserId, this.testType).subscribe({
      next: (res) => {
        this.testResult.set('✅ ' + res.message); this.testSending.set(false); this.loadLogs();
      },
      error: () => { this.testResult.set('❌ Test notification failed.'); this.testError.set(true); this.testSending.set(false); }
    });
  }
}
