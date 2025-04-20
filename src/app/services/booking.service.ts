import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getServices() {
    return this.http.get<any[]>(`${this.apiUrl}/services`);
  }

  getProducts() {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  createBooking(data: any) {
    return this.http.post(`${this.apiUrl}/transactions`, data);
  }
}
