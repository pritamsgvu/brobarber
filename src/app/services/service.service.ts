import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Service {
  _id?: string;
  serviceName: string;
  servicePrice: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private baseUrl = environment.apiUrl+ '/services';

  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.baseUrl);
  }

  getService(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }

  addService(service: Service): Observable<Service> {
    return this.http.post<Service>(this.baseUrl, service);
  }

  updateService(id: string, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/${id}`, service);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
