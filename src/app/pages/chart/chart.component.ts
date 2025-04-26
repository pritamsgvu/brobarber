import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
declare var Chart: any;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit{

  fromDate: string = '';
  toDate: string = '';
  transactions: any[] = [];
  services: any[] = [];
  products: any[] = [];
  barbers: any[] = [];


  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    // Set default date range to the first day of the current month
    // and last day of the current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Format dates to 'YYYY-MM-DD' format
    this.fromDate = this.formatDate(firstDayOfMonth);
    this.toDate = this.formatDate(lastDayOfMonth);

    // Fetch all necessary data initially
    this.dashboardService.getServices().subscribe((data: any[]) => {
      this.services = data;
    });

    this.dashboardService.getProducts().subscribe((data: any[]) => {
      this.products = data;
    });

    this.dashboardService.getBarbers().subscribe((data: any[]) => {
      this.barbers = data;
    });

    this.fetchData();
  }

  applyDateRange() {
    // Fetch data based on the selected date range
    this.fetchData(this.fromDate, this.toDate);
  }

  fetchData(fromDate: string = '', toDate: string = '') {
    this.dashboardService.getTransactions(0, 10, fromDate, toDate).subscribe((data: any[]) => {
      this.transactions = data;
      
      // Once data is fetched, call the method to render your charts
      this.renderCharts();
    });
  }

  renderCharts() {
    const paymentModes = this.getPaymentModeData(this.transactions);
    const productEarnings = this.getProductEarningsData(this.transactions);
    const serviceEarnings = this.getServiceEarningsData(this.transactions);
    const barberEarnings = this.getBarberEarningsData(this.transactions);

    // Now render the charts using Chart.js
    this.createPaymentModeChart(paymentModes);
    this.createProductEarningsChart(productEarnings);
    this.createServiceEarningsChart(serviceEarnings);
    this.createBarberEarningsChart(barberEarnings);
  }

  getPaymentModeData(transactions: any[]) {
    let cash = 0;
    let online = 0;

    transactions.forEach(transaction => {
      if (transaction.paymentMode === 'cash') {
        cash += transaction.netTotal;
      } else if (transaction.paymentMode === 'online') {
        online += transaction.netTotal;
      }
    });

    return { cash, online };
  }

  getProductEarningsData(transactions: any[]) {
    const productEarnings: any = {};

    transactions.forEach(transaction => {
      transaction.selectedProducts.forEach(productId => {
        const productName = this.getProductNameById(productId);
        if (!productEarnings[productName]) {
          productEarnings[productName] = 0;
        }
        productEarnings[productName] += transaction.totalProductAmount;
      });
    });

    return productEarnings;
  }

  getServiceEarningsData(transactions: any[]) {
    const serviceEarnings: any = {};

    transactions.forEach(transaction => {
      transaction.selectedServices.forEach(serviceId => {
        const serviceName = this.getServiceNameById(serviceId);
        if (!serviceEarnings[serviceName]) {
          serviceEarnings[serviceName] = 0;
        }
        serviceEarnings[serviceName] += transaction.serviceAmount;
      });
    });

    return serviceEarnings;
  }

  getBarberEarningsData(transactions: any[]) {
    const barberEarnings: any = {};

    transactions.forEach(transaction => {
      const barberName = this.getBarberNameById(transaction.barberId._id);
      if (!barberEarnings[barberName]) {
        barberEarnings[barberName] = 0;
      }
      barberEarnings[barberName] += transaction.netTotal;
    });

    return barberEarnings;
  }

  getProductNameById(productId: string) {
    const product = this.products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  }

  getServiceNameById(serviceId: string) {
    const service = this.services.find(s => s._id === serviceId);
    return service ? service.name : 'Unknown Service';
  }

  getBarberNameById(barberId: string) {
    const barber = this.barbers.find(b => b._id === barberId);
    return barber ? barber.name : 'Unknown Barber';
  }

  createPaymentModeChart(paymentModes: { cash: number, online: number }) {
    new Chart('paymentModeChart', {
      type: 'pie',
      data: {
        labels: ['Cash', 'Online'],
        datasets: [{
          data: [paymentModes.cash, paymentModes.online],
          backgroundColor: ['#36A2EB', '#FF6384'],
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1.5
      }
    });
  }

  createProductEarningsChart(productEarnings: any) {
    const labels = Object.keys(productEarnings);
    const data = Object.values(productEarnings);

    new Chart('productEarningsChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Product Earnings',
          data: data,
          backgroundColor: '#4BC0C0',
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1.5
      }
    });
  }

  createServiceEarningsChart(serviceEarnings: any) {
    const labels = Object.keys(serviceEarnings);
    const data = Object.values(serviceEarnings);

    new Chart('serviceEarningsChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Service Earnings',
          data: data,
          backgroundColor: '#FF9F40',
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1.5
      }
    });
  }

  createBarberEarningsChart(barberEarnings: any) {
    const labels = Object.keys(barberEarnings);
    const data = Object.values(barberEarnings);

    new Chart('barberEarningsChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Barber Earnings',
          data: data,
          backgroundColor: '#FFCD56',
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1.5
      }
    });
  }

  // Helper function to format date to 'YYYY-MM-DD'
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
