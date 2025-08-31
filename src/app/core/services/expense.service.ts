import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  _id?: string;
  expenseAmount: number;
  fromWhichAccount: 'cash' | 'online';
  expenseType:
    | 'barberCommission'
    | 'productPurchase'
    | 'rent'
    | 'electricityBill'
    | 'equipment'
    | 'others'
    | 'dueClearance';
  date: string;
  notes?: string;
  barberId?: string;
}

interface PaymentSummary {
  totalCashReceived: number;
  totalOnlineReceived: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  addExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  updateExpense(id: string, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMonthlyEarningsWithYears(year?: number) {
    const params = year ? { params: { year: year.toString() } } : {};
    return this.http.get<{ report: any[], availableYears: number[] }>(
      `${this.apiUrl}/earnings-report`,
      params
    );
  }

  getPaymentSummary(fromDate: string, toDate: string): Observable<PaymentSummary> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<PaymentSummary>(`${environment.apiUrl}/transactions/monthly-payment-summary`, { params });
  }
  
  getCurrentMonthBarberCommission() {
    return this.http.get<any[]>(`${this.apiUrl}/barber-commission/current-month`);
  }
  
}
