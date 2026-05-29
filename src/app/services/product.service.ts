import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from '../../../Product List/node_modules/rxjs/dist/types';
import { map } from '../../../Product List/node_modules/rxjs/dist/types/operators';
import { FilterParams } from '../interfaces/filter-params';
import { ProductsResponse } from '../interfaces/products-response';
import { Product } from '../interfaces/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://3a2cbc2a2b454671.mokky.dev';

  fetchProducts(filters: FilterParams): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('page', String(filters.page))
      .set('limit', '10');

    if (filters.search) {
      params = params.set('title', `*${filters.search}*`);
    }

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    if (filters.priceMin) {
      params = params.set('price[from]', filters.priceMin);
    }

    if (filters.priceMax) {
      params = params.set('price[to]', filters.priceMax);
    }

    if (filters.sortField) {
      const prefix = filters.sortOrder === 'desc' ? '-' : '';
      params = params.set('sortBy', `${prefix}${filters.sortField}`);
    }

    return this.http.get<ProductsResponse>(`${this.baseUrl}/products`, { params });
  }

  fetchAllProducts(): Observable<Product[]> {
    return this.http.get<ProductsResponse>(`${this.baseUrl}/products`, {
      params: new HttpParams().set('limit', '100'),
    }).pipe(map(res => res.items));
  }
}
