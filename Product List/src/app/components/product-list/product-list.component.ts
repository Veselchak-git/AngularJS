import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, switchMap, tap, of, catchError, Subscription } from '../../../../node_modules/rxjs/dist/types';
import { SORT_OPTIONS } from '../../const/sort-options';
import { ProductService } from '../../services/product.service';
import { FilterParams } from '../../interfaces/filter-params';
import { PageData } from '../../interfaces/page-data';

@Component({
  selector: 'app-product-list',
  imports: [FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService)

  readonly SORT_OPTIONS = SORT_OPTIONS;
  readonly categories = signal<string[]>([]);

  search = '';
  category = '';
  priceMin = '';
  priceMax = '';
  sortValue = '';

  pageData = signal<PageData | null>(null);
  loading = signal(false);
  error = signal('');

  private readonly filters$ = new Subject<void>();
  private readonly page$ = new Subject<number>();
  private currentPage = 1;
  private sub?: Subscription;

  ngOnInit() {
    this.loadCategories();

    this.sub = this.filters$.pipe(
      debounceTime(300),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.productService.fetchProducts(this.buildFilters()).pipe(
          tap(() => this.error.set('')),
          catchError(err => {
            this.error.set(err.message ?? 'Ошибка загрузки');
            return of(null);
          }),
        ),
      ),
    ).subscribe(res => {
      if (res) {
        this.pageData.set({
          items: res.items,
          totalPages: res.meta.total_pages,
          currentPage: res.meta.current_page,
          totalItems: res.meta.total_items,
        });
      }
      this.loading.set(false);
    });

    this.applyFilters();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private loadCategories() {
    this.productService.fetchAllProducts().subscribe({
      next: items => {
        const cats = [...new Set(items.map(p => p.category))].sort();
        this.categories.set(cats);
      },
      error: () => this.categories.set([]),
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.filters$.next();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.filters$.next();
  }

  resetFilters() {
    this.search = '';
    this.category = '';
    this.priceMin = '';
    this.priceMax = '';
    this.sortValue = '';
    this.applyFilters();
  }

  getPageNumbers(): number[] {
    const data = this.pageData();
    if (!data) return [];
    const current = data.currentPage;
    const total = data.totalPages;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  private buildFilters(): FilterParams {
    let sortField = '';
    let sortOrder: 'asc' | 'desc' = 'asc';

    if (this.sortValue) {
      const opt = SORT_OPTIONS.find(o => o.value === this.sortValue);
      if (opt) {
        sortField = opt.field;
        sortOrder = opt.order;
      }
    }

    return {
      search: this.search,
      category: this.category,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      sortField,
      sortOrder,
      page: this.currentPage,
    };
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(n);
  }

  renderRating(n: number): string {
    const full = Math.floor(n);
    const half = n - full >= 0.5;
    let stars = '★'.repeat(full);
    if (half) stars += '☆';
    stars += '☆'.repeat(5 - full - (half ? 1 : 0));
    return stars;
  }
}
