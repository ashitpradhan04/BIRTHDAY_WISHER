// src/app/features/users/users.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="users-page">
      <div class="page-header">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="search" placeholder="Search by name or email…" class="search-input"/>
        </div>
        <div class="header-actions">
          <select [(ngModel)]="filterStatus" class="filter-select">
            <option value="all">All users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="today">Birthday today</option>
          </select>
          <a routerLink="/users/add" class="btn-add">+ Add User</a>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner-lg"></div>
            <p>Loading users…</p>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="empty-state">
            <span>👥</span>
            <p>No users found</p>
            <a routerLink="/users/add" class="btn-link">Add the first user</a>
          </div>
        } @else {
          <table class="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Birthday</th>
                <th>Age</th>
                <th>Days Until</th>
                <th>Notification</th>
                <th>Status</th>
                <th>Last Wished</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.id) {
                <tr [class.birthday-today]="user.isBirthdayToday">
                  <td>
                    <div class="user-cell">
                      <div class="avatar" [class.admin]="user.role === 'ADMIN'">
                        {{ (user.firstName[0] + user.lastName[0]).toUpperCase() }}
                      </div>
                      <div>
                        <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                        <div class="user-email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="td-light">{{ user.birthday | date:'MMM d, yyyy' }}</td>
                  <td class="td-light">{{ user.age }}</td>
                  <td>
                    <span class="days-chip" [class.today]="user.isBirthdayToday" [class.soon]="user.daysUntilBirthday <= 7 && !user.isBirthdayToday">
                      {{ user.isBirthdayToday ? '🎂 Today!' : user.daysUntilBirthday + ' days' }}
                    </span>
                  </td>
                  <td>
                    <span class="notif-chip" [class.sms]="user.notificationPreference === 'SMS'" [class.both]="user.notificationPreference === 'BOTH'">
                      {{ user.notificationPreference === 'EMAIL' ? '📧' : user.notificationPreference === 'SMS' ? '📱' : '📧📱' }}
                      {{ user.notificationPreference }}
                    </span>
                  </td>
                  <td>
                    <span class="status-chip" [class.active]="user.active" [class.inactive]="!user.active">
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="td-light">{{ user.lastWishedAt ? (user.lastWishedAt | date:'MMM d, yyyy') : '—' }}</td>
                  <td>
                    <div class="actions">
                      <a [routerLink]="['/users', user.id, 'edit']" class="action-btn edit" title="Edit">✏️</a>
                      @if (auth.isAdmin()) {
                        <button class="action-btn notify" (click)="sendTestNotification(user)" title="Send test wish">🎁</button>
                        <button class="action-btn delete" (click)="deleteUser(user)" title="Deactivate">🗑️</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="table-footer">
            Showing {{ filteredUsers().length }} of {{ users().length }} users
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .users-page { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .search-bar { flex:1; min-width:200px; display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 16px; }
    .search-icon { font-size:16px; }
    .search-input { flex:1; background:none; border:none; outline:none; color:#fff; font-size:14px; }
    .search-input::placeholder { color:rgba(255,255,255,0.3); }
    .header-actions { display:flex; align-items:center; gap:10px; }
    .filter-select { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; color:#fff; font-size:13px; outline:none; cursor:pointer; }
    .filter-select option { background:#1e1234; }
    .btn-add { padding:10px 20px; background:linear-gradient(135deg,#7c3aed,#ec4899); border:none; border-radius:10px; color:#fff; font-size:14px; font-weight:600; text-decoration:none; white-space:nowrap; transition:all 0.2s; }
    .btn-add:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,0.4); }

    .table-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; }
    .loading-state, .empty-state { text-align:center; padding:60px; color:rgba(255,255,255,0.4); }
    .spinner-lg { width:40px; height:40px; border:3px solid rgba(255,255,255,0.1); border-top-color:#7c3aed; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16px; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .empty-state span { font-size:48px; display:block; margin-bottom:12px; }
    .btn-link { color:#a78bfa; text-decoration:none; font-size:14px; }

    .user-table { width:100%; border-collapse:collapse; }
    .user-table thead tr { background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.08); }
    .user-table th { padding:12px 16px; color:rgba(255,255,255,0.5); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; text-align:left; white-space:nowrap; }
    .user-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
    .user-table tbody tr:hover { background:rgba(255,255,255,0.03); }
    .user-table tbody tr:last-child { border-bottom:none; }
    .user-table tbody tr.birthday-today { background:rgba(236,72,153,0.07); }
    .user-table td { padding:14px 16px; vertical-align:middle; }
    .td-light { color:rgba(255,255,255,0.6); font-size:13px; }

    .user-cell { display:flex; align-items:center; gap:12px; }
    .avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#ec4899); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:700; flex-shrink:0; }
    .avatar.admin { background:linear-gradient(135deg,#f59e0b,#ef4444); }
    .user-name { color:#fff; font-size:14px; font-weight:500; }
    .user-email { color:rgba(255,255,255,0.45); font-size:12px; }

    .days-chip, .notif-chip, .status-chip { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .days-chip { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6); }
    .days-chip.today { background:rgba(236,72,153,0.2); color:#f9a8d4; }
    .days-chip.soon { background:rgba(245,158,11,0.15); color:#fcd34d; }
    .notif-chip { background:rgba(124,58,237,0.15); color:#c4b5fd; }
    .notif-chip.sms { background:rgba(6,182,212,0.15); color:#67e8f9; }
    .notif-chip.both { background:rgba(34,197,94,0.15); color:#86efac; }
    .status-chip { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); }
    .status-chip.active { background:rgba(34,197,94,0.15); color:#86efac; }
    .status-chip.inactive { background:rgba(239,68,68,0.15); color:#fca5a5; }

    .actions { display:flex; gap:6px; }
    .action-btn { padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:8px; cursor:pointer; font-size:14px; transition:all 0.2s; text-decoration:none; display:inline-flex; }
    .action-btn:hover { background:rgba(255,255,255,0.12); transform:scale(1.05); }
    .action-btn.delete:hover { background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.3); }

    .table-footer { padding:12px 16px; color:rgba(255,255,255,0.35); font-size:12px; border-top:1px solid rgba(255,255,255,0.06); }
  `]
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  search = '';
  filterStatus = 'all';

  filteredUsers = computed(() => {
    const q = this.search.toLowerCase();
    return this.users().filter(u => {
      const matchesSearch = !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesFilter =
        this.filterStatus === 'all' ? true :
        this.filterStatus === 'active' ? u.active :
        this.filterStatus === 'inactive' ? !u.active :
        this.filterStatus === 'today' ? u.isBirthdayToday : true;
      return matchesSearch && matchesFilter;
    });
  });

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  sendTestNotification(user: User) {
    if (!confirm(`Send test birthday wish to ${user.firstName}?`)) return;
    this.adminService.sendTestNotification(user.id).subscribe({
      next: () => alert(`✅ Test wish sent to ${user.email}`),
      error: () => alert('❌ Failed to send test notification')
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Deactivate ${user.firstName} ${user.lastName}?`)) return;
    this.userService.delete(user.id).subscribe({
      next: () => this.users.update(list => list.map(u => u.id === user.id ? {...u, active: false} : u)),
      error: () => alert('❌ Failed to deactivate user')
    });
  }
}
