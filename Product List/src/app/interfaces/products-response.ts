import { Meta } from './meta';
import { Product } from './product';

export interface ProductsResponse {
  meta: Meta;
  items: Product[];
}