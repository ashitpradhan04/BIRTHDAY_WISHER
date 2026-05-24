// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationLog } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  triggerScheduler(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.post(`${this.API}/scheduler/trigger`, null, { params });
  }

  sendTestNotification(userId: number, type: 'EMAIL' | 'SMS' = 'EMAIL'): Observable<any> {
    const params = new HttpParams().set('type', type);
    return this.http.post(`${this.API}/notifications/test/${userId}`, null, { params });
  }

  getNotificationLogs(): Observable<NotificationLog[]> {
    return this.http.get<NotificationLog[]>(`${this.API}/notifications/logs`);
  }
}
