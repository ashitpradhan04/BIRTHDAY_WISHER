// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats, User, NotificationLog } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Today's Birthdays Banner -->
      @if (todaysBirthdays().length > 0) {
        <div class="birthday-banner">
          <div class="banner-content">
            <span class="banner-emoji">🎂</span>
            <div>
              <strong>{{ todaysBirthdays().length }} birthday{{ todaysBirthdays().length > 1 ? 's' : '' }} today!</strong>
              <span>{{ todaysBirthdayNames() }}</span>
            </div>
          </div>
          @if (auth.isAdmin()) {
            <button class="btn-send" (click)="triggerWishes()" [disabled]="sending()">
              {{ sending() ? '📤 Sending…' : '🚀 Send Wishes Now' }}
            </button>
          }
        </div>
      }

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-purple">
          <div class="stat-icon">👥</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats()?.totalUsers ?? '…' }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        <div class="stat-card stat-green">
          <div class="stat-icon">✅</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats()?.activeUsers ?? '…' }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
        <div class="stat-card stat-pink">
          <div class="stat-icon">🎂</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats()?.birthdaysToday ?? '…' }}</div>
            <div class="stat-label">Birthdays Today</div>
          </div>
        </div>
        <div class="stat-card stat-cyan">
          <div class="stat-icon">📅</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats()?.upcomingBirthdays ?? '…' }}</div>
            <div class="stat-label">Upcoming (7 days)</div>
          </div>
        </div>
        <div class="stat-card stat-amber">
          <div class="stat-icon">📨</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats()?.notificationsSent ?? '…' }}</div>
            <div class="stat-label">Wishes Sent</div>
          </div>
        </div>
        <div class="stat-card stat-red">
          <div class="stat-icon">⚠️</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats()?.notificationsFailed ?? '…' }}</div>
            <div class="stat-label">Failed</div>
          </div>
        </div>
      </div>

      <!-- Content row -->
      <div class="content-row">
        <!-- Upcoming Birthdays -->
        <div class="card upcoming-card">
          <div class="card-header">
            <h3>🗓️ Upcoming Birthdays</h3>
            <a routerLink="/users">View all</a>
          </div>
          @if (upcomingBirthdays().length === 0) {
            <div class="empty-state">
              <span>🎈</span>
              <p>No birthdays in the next 30 days</p>
            </div>
          }
          @for (user of upcomingBirthdays(); track user.id) {
            <div class="birthday-row">
              <div class="avatar-sm">{{ (user.firstName[0] + user.lastName[0]).toUpperCase() }}</div>
              <div class="birthday-info">
                <span class="person-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="birthday-date">{{ user.birthday | date:'MMMM d' }}</span>
              </div>
              <div class="days-badge" [class.today]="user.isBirthdayToday" [class.soon]="user.daysUntilBirthday <= 3">
                @if (user.isBirthdayToday) { 🎂 Today! }
                @else { in {{ user.daysUntilBirthday }} days }
              </div>
            </div>
          }
        </div>

        <!-- Recent Notification Logs -->
        @if (auth.isAdmin()) {
          <div class="card logs-card">
            <div class="card-header">
              <h3>🔔 Recent Notifications</h3>
              <a routerLink="/notifications">View all</a>
            </div>
            @if (recentLogs().length === 0) {
              <div class="empty-state"><span>📭</span><p>No notifications yet</p></div>
            }
            @for (log of recentLogs(); track log.id) {
              <div class="log-row">
                <span class="log-type-badge" [class.sms]="log.type === 'SMS'">
                  {{ log.type === 'EMAIL' ? '📧' : '📱' }} {{ log.type }}
                </span>
                <div class="log-info">
                  <span class="log-user">{{ log.userName }}</span>
                  <span class="log-time">{{ log.sentAt | date:'MMM d, HH:mm' }}</span>
                </div>
                <span class="status-badge" [class.sent]="log.status === 'SENT'" [class.failed]="log.status === 'FAILED'" [class.skipped]="log.status === 'SKIPPED'">
                  {{ log.status }}
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display:flex; flex-direction:column; gap:24px; }
    .birthday-banner { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:linear-gradient(135deg,rgba(236,72,153,0.2),rgba(124,58,237,0.2)); border:1px solid rgba(236,72,153,0.3); border-radius:16px; }
    .banner-content { display:flex; align-items:center; gap:16px; }
    .banner-emoji { font-size:32px; animation:bounce 1s infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .banner-content strong { display:block; color:#fff; font-size:16px; }
    .banner-content span { color:rgba(255,255,255,0.6); font-size:14px; }
    .btn-send { padding:10px 20px; background:linear-gradient(135deg,#7c3aed,#ec4899); border:none; border-radius:10px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
    .btn-send:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,0.4); }
    .btn-send:disabled { opacity:0.6; cursor:not-allowed; }

    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px; }
    .stat-card { display:flex; align-items:center; gap:16px; padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); transition:transform 0.2s; }
    .stat-card:hover { transform:translateY(-2px); }
    .stat-icon { font-size:28px; }
    .stat-value { color:#fff; font-size:28px; font-weight:700; line-height:1; }
    .stat-label { color:rgba(255,255,255,0.5); font-size:12px; margin-top:4px; }
    .stat-purple { border-color:rgba(124,58,237,0.3); background:rgba(124,58,237,0.1); }
    .stat-green { border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.08); }
    .stat-pink { border-color:rgba(236,72,153,0.3); background:rgba(236,72,153,0.1); }
    .stat-cyan { border-color:rgba(6,182,212,0.3); background:rgba(6,182,212,0.08); }
    .stat-amber { border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.08); }
    .stat-red { border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.08); }

    .content-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:20px; }
    .card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .card-header h3 { color:#fff; font-size:15px; font-weight:600; margin:0; }
    .card-header a { color:#a78bfa; font-size:13px; text-decoration:none; }
    .card-header a:hover { color:#c4b5fd; }
    .empty-state { text-align:center; padding:32px; color:rgba(255,255,255,0.3); }
    .empty-state span { font-size:32px; display:block; margin-bottom:8px; }
    .empty-state p { font-size:14px; margin:0; }

    .birthday-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .birthday-row:last-child { border-bottom:none; }
    .avatar-sm { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#ec4899); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:700; flex-shrink:0; }
    .birthday-info { flex:1; }
    .person-name { display:block; color:#fff; font-size:14px; font-weight:500; }
    .birthday-date { display:block; color:rgba(255,255,255,0.45); font-size:12px; }
    .days-badge { padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6); white-space:nowrap; }
    .days-badge.today { background:rgba(236,72,153,0.2); color:#f9a8d4; border:1px solid rgba(236,72,153,0.3); }
    .days-badge.soon { background:rgba(245,158,11,0.15); color:#fcd34d; border:1px solid rgba(245,158,11,0.3); }

    .log-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .log-row:last-child { border-bottom:none; }
    .log-type-badge { padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600; background:rgba(124,58,237,0.2); color:#c4b5fd; white-space:nowrap; }
    .log-type-badge.sms { background:rgba(6,182,212,0.2); color:#67e8f9; }
    .log-info { flex:1; overflow:hidden; }
    .log-user { display:block; color:#fff; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .log-time { display:block; color:rgba(255,255,255,0.4); font-size:11px; }
    .status-badge { padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600; }
    .status-badge.sent { background:rgba(34,197,94,0.2); color:#86efac; }
    .status-badge.failed { background:rgba(239,68,68,0.2); color:#fca5a5; }
    .status-badge.skipped { background:rgba(156,163,175,0.2); color:#9ca3af; }

    @media (max-width: 768px) { .content-row { grid-template-columns:1fr; } .stats-grid { grid-template-columns:repeat(2,1fr); } }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  todaysBirthdays = signal<User[]>([]);
  upcomingBirthdays = signal<User[]>([]);
  recentLogs = signal<NotificationLog[]>([]);
  sending = signal(false);

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.userService.getDashboardStats().subscribe(s => this.stats.set(s));
    this.userService.getTodaysBirthdays().subscribe(u => this.todaysBirthdays.set(u));
    this.userService.getUpcomingBirthdays(30).subscribe(u => this.upcomingBirthdays.set(u));
    if (this.auth.isAdmin()) {
      this.adminService.getNotificationLogs().subscribe(l => this.recentLogs.set(l));
    }
  }

  todaysBirthdayNames(): string {
    return this.todaysBirthdays().map(u => u.firstName + ' ' + u.lastName).join(', ');
  }

  triggerWishes() {
    this.sending.set(true);
    this.adminService.triggerScheduler().subscribe({
      next: (res) => {
        alert(`✅ Sent wishes to ${res.usersNotified} user(s)!`);
        this.sending.set(false);
        this.loadData();
      },
      error: () => { alert('❌ Failed to send wishes.'); this.sending.set(false); }
    });
  }
}
