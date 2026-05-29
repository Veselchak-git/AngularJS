import { Product } from './product';

export interface PageData {
  items: Product[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}