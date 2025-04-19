import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:5000/api';

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
