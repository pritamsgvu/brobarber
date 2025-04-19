import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BarberService {
  constructor(private http: HttpClient) {}

  getBarbers() {
    return this.http.get<any[]>('http://localhost:5000/api/barbers');
  }
}
