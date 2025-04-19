import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarberService } from '../../services/barber.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  barbers: any[] = [];
  services: any[] = [];
  products: any[] = [];

  constructor(
    private fb: FormBuilder,
    private barberService: BarberService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      barberId: ['', Validators.required],
      date: ['', Validators.required],
      selectedServices: [[]],
      selectedProducts: [[]],
      serviceAmount: ['', Validators.required],
      paymentMode: ['cash', Validators.required],
      totalProductAmount: [0]  // Add this line to store the total product amount
    });

    this.loadBarbers();
    this.loadServices();
    this.loadProducts();
  }

  loadBarbers() {
    this.barberService.getBarbers().subscribe(data => {
      this.barbers = data;
    });
  }

  loadServices() {
    this.bookingService.getServices().subscribe(data => {
      this.services = data;
    });
  }

  loadProducts() {
    this.bookingService.getProducts().subscribe(data => {
      this.products = data;
    });
  }


  toggleCheckbox(event: any, field: string): void {
    const formArray = this.bookingForm.get(field)?.value || [];
    const value = event.target.value;

    if (event.target.checked) {
      // Add to array
      this.bookingForm.get(field)?.setValue([...formArray, value]);
    } else {
      // Remove from array
      const updatedArray = formArray.filter((item: any) => item !== value);
      this.bookingForm.get(field)?.setValue(updatedArray);
    }

    this.bookingForm.get(field)?.markAsDirty();
  }


  get selectedProducts(): FormArray {
    return this.bookingForm.get('selectedProducts') as FormArray;
  }


  // here

  totalProductPrice = 0;

  toggleProductCheckbox(event: any, product: any): void {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];

    if (event.target.checked) {
      selected.push({ ...product });  // store full product object
    } else {
      const index = selected.findIndex((p: any) => p._id === product._id);
      if (index !== -1) selected.splice(index, 1);
    }

    this.bookingForm.get('selectedProducts')?.setValue([...selected]);
    this.updateTotalProductAmount();  // Update the total product amount after selection
  }

  isProductSelected(productId: string): boolean {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];
    return selected.some((p: any) => p._id === productId);
  }

  getProductPrice(productId: string): number {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];
    const product = selected.find((p: any) => p._id === productId);
    return product ? product.perUsePrice : 0;
  }

  updateProductPrice(productId: string, event: any): void {
    const value = parseFloat(event.target.value);
    const selected = this.bookingForm.get('selectedProducts')?.value || [];

    const index = selected.findIndex((p: any) => p._id === productId);
    if (index !== -1) {
      selected[index].perUsePrice = value;
      this.bookingForm.get('selectedProducts')?.setValue([...selected]);
      this.updateTotalProductAmount();  // Update the total product amount after price update
    }
  }

  updateTotalProductAmount(): void {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];
    const totalAmount = selected.reduce((sum: number, p: any) => sum + (p.perUsePrice || 0), 0);

    this.bookingForm.get('totalProductAmount')?.setValue(totalAmount);  // Set the total product amount in the form
    this.totalProductPrice = totalAmount;
  }



  onSubmit() {
    if (this.bookingForm.valid) {
      console.log('this.bookingForm.value', this.bookingForm.value)
      this.bookingService.createBooking(this.bookingForm.value).subscribe(res => {

        alert('Booking Created!');
        // this.bookingForm.reset();
      });
    }
  }
}
