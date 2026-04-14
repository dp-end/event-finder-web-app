import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../../services/event.service';
import { CategoryService } from '../../../services/category.service';
import { AuthService } from '../../../services/auth';
import { CategoryDto } from '../../../models/models';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css'
})
export class CreateEvent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categories: CategoryDto[] = [];
  isLoadingCategories = true;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  form = {
    title: '',
    description: '',
    date: '',
    location: '',
    address: '',
    price: 0,
    quota: 0,
    imageUrl: '',
    categoryId: '',
  };

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: cats => {
        this.categories = cats;
        this.isLoadingCategories = false;
      },
      error: () => { this.isLoadingCategories = false; }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.successMessage = null;
    this.errorMessage = null;

    const payload: any = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      date: new Date(this.form.date).toISOString(),
      location: this.form.location.trim(),
      address: this.form.address.trim(),
      price: Number(this.form.price),
      quota: Number(this.form.quota),
      imageUrl: this.form.imageUrl.trim(),
    };

    if (this.form.categoryId) payload.categoryId = this.form.categoryId;

    // Kulüp kullanıcısıysa clubId ekle
    const user = this.authService.getCurrentUser();
    if (user?.clubId) payload.clubId = user.clubId;

    this.isSubmitting = true;
    this.eventService.create(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: event => {
        this.successMessage = 'Etkinlik başarıyla oluşturuldu!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/event', event.id]), 1500);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Etkinlik oluşturulurken bir hata oluştu.';
        this.isSubmitting = false;
      }
    });
  }
}
