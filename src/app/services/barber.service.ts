
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BarberService {
  private apiUrl = environment.apiUrl+ '/barbers';


  constructor(private http: HttpClient) {}

  getBarbers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addBarber(barber: any): Observable<any> {
    return this.http.post(this.apiUrl, barber);
  }

  updateBarber(barberId: string, barber: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${barberId}`, barber);
  }

  deleteBarber(barberId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${barberId}`);
  }
}
