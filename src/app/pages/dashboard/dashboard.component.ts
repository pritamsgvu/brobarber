import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bookings: any[] = [];
  filteredTransactions: any[] = [];
  barberCommission: any[] = [];

  services: any[] = [];
  products: any[] = [];
  barbers: any[] = [];

  incomeStats: any[] = [];

  page = 1;
  pageSize = 10;
  hasMore = true;

  filterForm!: FormGroup;

  totalIncome = 0;
  totalProductCost = 0;

  constructor(
    private dashboardService: DashboardService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.loadBookings();
  }

  // Initialize filter form
  initForm() {
    this.filterForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      barber: ['']
    });
  }

  // Load initial data like services, products, barbers
  loadInitialData() {
    this.dashboardService.getServices().subscribe(data => this.services = data);
    this.dashboardService.getProducts().subscribe(data => this.products = data);
    this.dashboardService.getBarbers().subscribe(data => this.barbers = data);
  }

  // Load bookings with pagination and filters applied
  loadBookings(reset = false) {
    if (reset) {
      this.page = 1;
      this.bookings = [];
    }

    const filters = this.filterForm.value;

    this.dashboardService.getBookings(this.page, this.pageSize, filters)
      .subscribe((data: any[]) => {
        if (data.length < this.pageSize) this.hasMore = false;
        this.bookings = [...this.bookings, ...data];
        this.processData();
        this.page++;
      });
  }

  // Process data to get services, products, and barber names
  processData() {
    this.filteredTransactions = this.bookings.map(tx => {
      const serviceNames = tx.selectedServices.map((id: string) => {
        const s = this.services.find(serv => serv._id === id);
        return s ? s.serviceName : id;
      });

      const productNames = tx.selectedProducts.map((id: string) => {
        const p = this.products.find(prod => prod._id === id);
        return p ? p.productName : id;
      });

      const barber = this.barbers.find(b => b._id === tx.barberId._id);

      return {
        ...tx,
        serviceNames,
        productNames,
        barberName: barber ? barber.name : 'Unknown'
      };
    });

    this.generateStats();
  }

  // Generate statistics for income, product cost, and commissions
  generateStats() {
    const incomeMap: any = {};
    const commissionMap: any = {};
    let productCost = 0;

    const fromDate = this.filterForm.value.fromDate ? new Date(this.filterForm.value.fromDate) : null;
    const toDate = this.filterForm.value.toDate ? new Date(this.filterForm.value.toDate) : null;

    this.filteredTransactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (fromDate && txDate < fromDate) return;
      if (toDate && txDate > toDate) return;

      const name = tx.barberName;

      if (!incomeMap[name]) {
        incomeMap[name] = 0;
        commissionMap[name] = 0;
      }

      const serviceAmount = tx.serviceAmount || 0;
      const productAmount = tx.totalProductAmount || 0;

      incomeMap[name] += serviceAmount;
      commissionMap[name] += (serviceAmount - productAmount) * 0.5;

      productCost += productAmount;
    });

    // this.totalIncome = Object.values(incomeMap).reduce((acc: number, val: number) => acc + val, 0);
    
    this.totalProductCost = productCost;

    this.incomeStats = Object.keys(incomeMap).map(name => ({
      barberName: name,
      amount: incomeMap[name]
    }));

    this.barberCommission = Object.keys(commissionMap).map(name => ({
      barberName: name,
      commission: commissionMap[name]
    }));
  }

  // Load more data (lazy load)
  loadMore() {
    if (this.hasMore) {
      this.loadBookings();
    }
  }

  // Apply filters and reset bookings data
  applyFilters() {
    this.page = 1;
    this.bookings = [];
    this.hasMore = true;
    this.loadBookings(true);
  }

  

  // Reset filters
  resetFilter() {
    this.filterForm.reset();
    this.applyFilters();
  }

  // Get barber name from barber ID
  getBarberName(barberId: string) {
    const barber = this.barbers.find(b => b._id === barberId);
    return barber ? barber.name : 'Unknown';
  }
}
