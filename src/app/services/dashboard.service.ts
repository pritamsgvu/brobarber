import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getTransactions(skip = 0, limit = 10, from = '', to = '', barber = '') {
    let params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (barber) params = params.set('barber', barber);
    return this.http.get<any[]>(`${this.api}/transactions`, { params });
  }

  getBookings(page: number, pageSize: number, filters: any): Observable<any[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.barber) {
      params = params.set('barber', filters.barber);
    }

    return this.http.get<any[]>(`${this.api}/transactions`, { params });
  }

  getServices() {
    return this.http.get<any[]>(`${this.api}/services`);
  }

  getProducts() {
    return this.http.get<any[]>(`${this.api}/products`);
  }

  getBarbers() {
    return this.http.get<any[]>(`${this.api}/barbers`);
  }
}
