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
  pageSize = 50;
  hasMore = true;
  noDataFound = false; // Flag to check if data is found
  filterForm!: FormGroup;
  totalIncome = 0;
  totalProductCost = 0;
  serviceTotalAmount = 0;
  totalDiscount = 0;
  cashAmount: any;
  onlineAmount: any;
  loading: boolean = true;

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
    const today = new Date().toISOString().split('T')[0];
    this.filterForm = this.fb.group({
      fromDate: [today],
      toDate: [today],
      barber: [''],
      paymentMode: ['']
    });
  }

  // Load initial data like services, products, barbers
  loadInitialData() {
    this.loading = true;
    this.dashboardService.getServices().subscribe(data => this.services = data);
    this.dashboardService.getProducts().subscribe(data => this.products = data);
    this.dashboardService.getBarbers().subscribe(data => this.barbers = data);
  }

  // Load bookings with pagination and filters applied
  loadBookings(reset = false) {
    this.loading = true;
    if (reset) {
      this.page = 1;
      this.bookings = [];
      this.hasMore = true;
    }

    const filters = this.filterForm.value;

    this.dashboardService.getBookings(this.page, this.pageSize, filters)
      .subscribe((data: any[]) => {
        if (!data || data.length === 0) {
          this.hasMore = false;
          this.noDataFound = true; // Set flag to true when no data is returned
          this.loading = false;
          return;
        }

        // Avoid pushing duplicate data
        const newData = data.filter(newTx =>
          !this.bookings.some(existingTx => existingTx._id === newTx._id)
        );

        this.bookings = [...this.bookings, ...newData];

        if (data.length < this.pageSize) {
          this.hasMore = false;
        } else {
          this.page++;
        }

        this.processData();
      });
  }

  // Process data to get services, products, and barber names
  processData() {
    this.filteredTransactions = this.bookings.map(tx => {
      // Map service IDs to names
      const serviceNames = (tx.selectedServices || []).map((id: string) => {
        const s = this.services.find(serv => serv._id === id);
        return s ? s.serviceName : id;
      });

      // Map product IDs to names
      const productNames = (tx.selectedProducts || []).map((id: string) => {
        const p = this.products.find(prod => prod._id === id);
        return p ? p.productName : id;
      });

      // Handle barber (object or ID)
      let barberName = 'Unknown';
      if (tx.barberId) {
        if (typeof tx.barberId === 'object' && tx.barberId.name) {
          barberName = tx.barberId.name;
        } else {
          const barber = this.barbers.find(b => b._id === tx.barberId);
          if (barber) barberName = barber.name;
        }
      }

      return {
        ...tx,
        serviceNames,
        productNames,
        barberName
      };
    });

    this.generateStats();
  }

  // Generate statistics for income, product cost, and commissions
  generateStats() {
    this.loading = false;
    const incomeMap: any = {};
    const commissionMap: any = {};
    let productCost = 0;
    let totalNetAmount = 0;
    let serviceTotalAmount = 0;
    let totalDiscount = 0;
    let cashAmount = 0;
    let onlineAmount = 0;
    let cashTransactions = 0;
    let onlineTransactions = 0;

    const { fromDate, toDate, paymentMode } = this.filterForm.value;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    this.filteredTransactions = this.filteredTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      const inDateRange = (!from || txDate >= from) && (!to || txDate <= to);
      const modeMatch = !paymentMode || tx.paymentMode === paymentMode;
      return inDateRange && modeMatch;
    });

    this.filteredTransactions.forEach(tx => {
      const name = tx.barberName;

      if (!incomeMap[name]) {
        incomeMap[name] = 0;
        commissionMap[name] = 0;
      }

      const serviceAmount = tx.serviceAmount || 0;
      const productAmount = tx.totalProductAmount || 0;
      const netTotal = tx.netTotal || 0;
      const discount = tx.discount || 0;

      incomeMap[name] += serviceAmount;
      commissionMap[name] += netTotal * 0.5;

      productCost += productAmount;
      totalNetAmount += netTotal;
      serviceTotalAmount += serviceAmount;
      totalDiscount += discount;

      if (tx.paymentMode === 'cash') {
        cashAmount += serviceAmount;
        cashTransactions++; // Count transactions for cash
      } else if (tx.paymentMode === 'online') {
        onlineAmount += serviceAmount;
        onlineTransactions++; // Count transactions for online
      }
    });

    this.totalIncome = totalNetAmount / 2;
    this.serviceTotalAmount = serviceTotalAmount;
    this.totalDiscount = totalDiscount;
    this.totalProductCost = productCost;
    this.cashAmount = cashAmount;
    this.onlineAmount = onlineAmount;

    this.incomeStats = Object.keys(incomeMap).map(name => ({
      barberName: name,
      amount: incomeMap[name]
    }));

    this.barberCommission = Object.keys(commissionMap).map(name => ({
      barberName: name,
      commission: commissionMap[name]
    }));

    // Add the transaction count for cash and online
    this.cashAmount = `${cashAmount} (${cashTransactions} Transaction${cashTransactions > 1 ? 's' : ''})`;
    this.onlineAmount = `${onlineAmount} (${onlineTransactions} Transaction${onlineTransactions > 1 ? 's' : ''})`;

    console.log('cashAmount', this.cashAmount)
    console.log('onlineAmount',this.onlineAmount)
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
    this.noDataFound = false; // Reset the flag when applying filters
    this.loadBookings(true);
  }

  // Reset filters
  resetFilter() {
    this.filterForm.reset();
    this.applyFilters();
  }

  // Delete a transaction
  deleteTransaction(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.dashboardService.deleteBooking(id).subscribe(() => {
        this.bookings = this.bookings.filter(tx => tx._id !== id);
        this.processData();
      });
    }
  }

  // Get barber name from barber ID
  getBarberName(barberId: string) {
    const barber = this.barbers.find(b => b._id === barberId);
    return barber ? barber.name : 'Unknown';
  }
}
