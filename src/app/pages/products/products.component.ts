import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-management',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  productForm: FormGroup;
  products: any[] = [];
  services: any[] = [];
  selectedProduct: any = null;
  loading: boolean = true;

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      productName: [''],
      brand: [''],
      productPrice: [0],
      perUsePrice: [0],
      serviceCharge: [0],
      services: [[]]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadProducts();
    this.loadServices();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.loading = false;
    });
  }

  loadServices() {
    this.productService.getServices().subscribe(data => {
      this.services = data;
    });
  }

  onSubmit() {
    this.loading = true;
    const data = this.productForm.value;

    if (this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct._id, data).subscribe(() => {
        this.loadProducts();
        this.resetForm();
      });
    } else {
      this.productService.addProduct(data).subscribe(() => {
        this.loadProducts();
        this.productForm.reset();
      });
    }
  }

  editProduct(product: any) {
    this.selectedProduct = product;
    this.productForm.patchValue({
      productName: product.productName,
      brand: product.brand,
      productPrice: product.productPrice,
      perUsePrice: product.perUsePrice,
      serviceCharge: product.serviceCharge,
      services: product.services.map((s: any) => s._id)
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  resetForm() {
    this.selectedProduct = null;
    this.productForm.reset({
      productName: '',
      brand: '',
      productPrice: 0,
      perUsePrice: 0,
      serviceCharge: 0,
      services: []
    });
  }
}
