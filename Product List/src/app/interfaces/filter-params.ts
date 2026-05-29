export interface FilterParams {
  search: string;
  category: string;
  priceMin: string;
  priceMax: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  page: number;
}