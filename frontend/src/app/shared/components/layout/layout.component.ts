// src/app/shared/components/layout/layout.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="brand">
            <span class="brand-icon">🎂</span>
            @if (!sidebarCollapsed()) {
              <div class="brand-text">
                <span class="brand-name">Birthday</span>
                <span class="brand-sub">Wisher</span>
              </div>
            }
          </div>
          <button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            {{ sidebarCollapsed() ? '›' : '‹' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            @if (!sidebarCollapsed()) { <span>Dashboard</span> }
          </a>
          <a routerLink="/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            @if (!sidebarCollapsed()) { <span>Users</span> }
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🔔</span>
              @if (!sidebarCollapsed()) { <span>Notifications</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed()">
            <div class="avatar">{{ initials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ auth.currentUser()?.firstName }}</span>
              <span class="user-role">{{ auth.currentUser()?.role }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="auth.logout()" title="Logout">
            <span>🚪</span>
            @if (!sidebarCollapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <div class="topbar">
          <div class="page-info">
            <h2 class="page-title">{{ getPageTitle() }}</h2>
            <span class="page-date">{{ today | date:'EEEE, MMMM d, yyyy' }}</span>
          </div>
          <div class="topbar-actions">
            <div class="notification-badge">
              <span>🎂</span>
              <span class="badge">{{ birthdaysToday }}</span>
            </div>
          </div>
        </div>
        <div class="content-area">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .app-layout { display: flex; height: 100vh; background: #0f0a1e; font-family: 'Outfit','Segoe UI',sans-serif; }

    /* Sidebar */
    .sidebar {
      width: 240px; min-height: 100vh; background: rgba(255,255,255,0.04);
      border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column;
      transition: width 0.3s ease; flex-shrink: 0;
    }
    .sidebar.collapsed { width: 64px; }
    .sidebar-header { display:flex; align-items:center; justify-content:space-between; padding:20px 16px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .brand { display:flex; align-items:center; gap:10px; overflow:hidden; }
    .brand-icon { font-size:28px; flex-shrink:0; }
    .brand-text { display:flex; flex-direction:column; }
    .brand-name { color:#fff; font-size:16px; font-weight:700; line-height:1; }
    .brand-sub { color:#a78bfa; font-size:11px; text-transform:uppercase; letter-spacing:2px; }
    .collapse-btn { background:none; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.5); width:28px; height:28px; border-radius:8px; cursor:pointer; font-size:16px; flex-shrink:0; transition:all 0.2s; }
    .collapse-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }

    .sidebar-nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:4px; }
    .nav-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; color:rgba(255,255,255,0.55); text-decoration:none; font-size:14px; font-weight:500; transition:all 0.2s; white-space:nowrap; }
    .nav-item:hover { background:rgba(255,255,255,0.06); color:#fff; }
    .nav-item.active { background:linear-gradient(135deg,rgba(124,58,237,0.3),rgba(236,72,153,0.2)); color:#fff; border:1px solid rgba(124,58,237,0.3); }
    .nav-icon { font-size:18px; flex-shrink:0; width:20px; text-align:center; }

    .sidebar-footer { padding:16px 10px; border-top:1px solid rgba(255,255,255,0.06); }
    .user-info { display:flex; align-items:center; gap:10px; padding:8px 12px; margin-bottom:8px; }
    .avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#ec4899); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:700; flex-shrink:0; }
    .user-details { display:flex; flex-direction:column; overflow:hidden; }
    .user-name { color:#fff; font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-role { color:rgba(255,255,255,0.4); font-size:11px; text-transform:uppercase; }
    .logout-btn { display:flex; align-items:center; gap:10px; width:100%; padding:10px 12px; background:none; border:1px solid rgba(239,68,68,0.2); border-radius:10px; color:rgba(239,68,68,0.7); cursor:pointer; font-size:13px; font-weight:500; transition:all 0.2s; }
    .logout-btn:hover { background:rgba(239,68,68,0.1); color:#f87171; }

    /* Main */
    .main-content { flex:1; display:flex; flex-direction:column; overflow:hidden; }
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:16px 28px; background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.06); }
    .page-title { color:#fff; font-size:20px; font-weight:700; margin:0; }
    .page-date { color:rgba(255,255,255,0.4); font-size:13px; }
    .notification-badge { position:relative; padding:8px; cursor:pointer; font-size:20px; }
    .badge { position:absolute; top:4px; right:4px; background:#ec4899; color:#fff; border-radius:10px; font-size:10px; font-weight:700; padding:1px 5px; min-width:16px; text-align:center; }
    .content-area { flex:1; overflow-y:auto; padding:24px 28px; }
    .content-area::-webkit-scrollbar { width:6px; }
    .content-area::-webkit-scrollbar-track { background:transparent; }
    .content-area::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
  today = new Date();
  birthdaysToday = 0;

  constructor(public auth: AuthService) {}

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return (u.firstName[0] + (u.lastName?.[0] || '')).toUpperCase();
  }

  getPageTitle(): string {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('users/add')) return 'Add User';
    if (path.includes('users') && path.includes('edit')) return 'Edit User';
    if (path.includes('users')) return 'Users';
    if (path.includes('notifications')) return 'Notifications';
    return 'Birthday Wisher';
  }
}
