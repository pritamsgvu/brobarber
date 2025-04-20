import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BarberService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  getBarbers() {
    return this.http.get<any[]>(`${this.apiUrl}/barbers`);
  }
}
