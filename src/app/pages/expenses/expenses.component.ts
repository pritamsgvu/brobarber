import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService, Expense } from '../../services/expense.service';
import { BarberService } from '../../services/barber.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  expenseForm!: FormGroup;
  isEditing: boolean = false;
  selectedExpense: Expense | null = null;
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  loading: boolean = false;
  barbers: any[] = [];
  expenseTypes: string[] = [
    'barberCommission',
    'productPurchase',
    'rent',
    'electricityBill',
    'equipment',
    'others',
    'dueClearance',
  ];


  // Filters
  filterKeyword: string = '';
  filterFromDate: string = '';
  filterToDate: string = '';
  filterExpenseType: string = '';
  filterBarberId: string = '';

  totalExpenseAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private barberService: BarberService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadExpenses();
    this.loadBarbers();
  }

  initForm(): void {
    this.expenseForm = this.fb.group({
      expenseAmount: [null, [Validators.required, Validators.min(1)]],
      fromWhichAccount: ['cash', Validators.required],
      expenseType: ['barberCommission', Validators.required],
      date: [null, Validators.required],
      notes: [''],
      barberId: ['']
    });

    this.expenseForm.get('expenseType')?.valueChanges.subscribe(type => {
      if (type === 'barberCommission') {
        this.expenseForm.get('barberId')?.setValidators([Validators.required]);
      } else {
        this.expenseForm.get('barberId')?.clearValidators();
        this.expenseForm.get('barberId')?.setValue('');
      }
      this.expenseForm.get('barberId')?.updateValueAndValidity();
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch expenses:', err);
        this.loading = false;
      }
    });
  }

  loadBarbers(): void {
    this.barberService.getBarbers().subscribe({
      next: (data) => this.barbers = data,
      error: (err) => console.error('Failed to load barbers:', err)
    });
  }

  getBarberName(barberId: string): string {
    const barber = this.barbers.find(b => b._id === barberId);
    return barber ? barber.name : '--';
  }

  applyFilter(): void {
    let data = [...this.expenses];

    // Text keyword filter
    const keyword = this.filterKeyword.toLowerCase().trim();
    if (keyword) {
      data = data.filter(exp =>
      (exp.notes?.toLowerCase().includes(keyword) ||
        exp.expenseType.toLowerCase().includes(keyword) ||
        (exp.barberId && this.getBarberName(exp.barberId).toLowerCase().includes(keyword)))
      );
    }

    // Date filter
    if (this.filterFromDate) {
      const from = new Date(this.filterFromDate);
      data = data.filter(exp => new Date(exp.date) >= from);
    }

    if (this.filterToDate) {
      const to = new Date(this.filterToDate);
      data = data.filter(exp => new Date(exp.date) <= to);
    }

    // Expense type filter
    if (this.filterExpenseType) {
      data = data.filter(exp => exp.expenseType === this.filterExpenseType);
    }

    // Barber filter
    if (this.filterBarberId) {
      data = data.filter(exp => exp.barberId === this.filterBarberId);
    }

    this.filteredExpenses = data;

    // Total expense calculation
    this.totalExpenseAmount = data.reduce((sum, exp) => sum + (exp.expenseAmount || 0), 0);
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }


  submitForm(): void {
    if (this.expenseForm.invalid) return;

    // const data: Expense = this.expenseForm.value;
    const formValue: Expense = this.expenseForm.value;

    const newExpense: any = {
      expenseAmount: formValue.expenseAmount,
      expenseType: formValue.expenseType,
      fromWhichAccount: formValue.fromWhichAccount,
      date: formValue.date,
      notes: formValue.notes || '',
    };

    if (formValue.expenseType === 'barberCommission' && formValue.barberId) {
      newExpense.barberId = formValue.barberId;
    }

    if (this.isEditing && this.selectedExpense?._id) {
      this.updateExpense(this.selectedExpense._id, newExpense);
    } else {
      this.createExpense(newExpense);
    }
  }

  createExpense(expense: Expense): void {
    this.expenseService.addExpense(expense).subscribe({
      next: (newExpense) => {
        this.expenses.unshift(newExpense);
        this.applyFilter();
        this.resetForm();
      },
      error: (err) => console.error('Error creating expense:', err)
    });
  }

  updateExpense(id: string, expense: Expense): void {
    this.expenseService.updateExpense(id, expense).subscribe({
      next: (updated) => {
        const i = this.expenses.findIndex(exp => exp._id === id);
        if (i !== -1) this.expenses[i] = updated;
        this.applyFilter();
        this.resetForm();
      },
      error: (err) => console.error('Error updating expense:', err)
    });
  }

  editExpense(expense: Expense): void {
    this.isEditing = true;
    this.selectedExpense = expense;
    this.expenseForm.patchValue({ ...expense, date: this.formatDateForInput(expense.date) });
  }

  deleteExpense(id: string): void {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    this.expenseService.deleteExpense(id).subscribe({
      next: () => {
        this.expenses = this.expenses.filter(exp => exp._id !== id);
        this.applyFilter();
      },
      error: (err) => console.error('Error deleting expense:', err)
    });
  }

  resetForm(): void {
    this.expenseForm.reset({
      expenseAmount: null,
      fromWhichAccount: 'cash',
      expenseType: 'barberCommission',
      date: null,
      notes: '',
      barberId: ''
    });
    this.isEditing = false;
    this.selectedExpense = null;
  }

  resetFilters(): void {
    this.filterKeyword = '';
    this.filterFromDate = '';
    this.filterToDate = '';
    this.filterExpenseType = '';
    this.filterBarberId = '';
    this.applyFilter();
  }
}
