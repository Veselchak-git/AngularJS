export const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Название А→Я', field: 'title', order: 'asc' as const },
  { value: 'title-desc', label: 'Название Я→А', field: 'title', order: 'desc' as const },
  { value: 'price-asc', label: 'Цена ↑', field: 'price', order: 'asc' as const },
  { value: 'price-desc', label: 'Цена ↓', field: 'price', order: 'desc' as const },
  { value: 'rating-asc', label: 'Рейтинг ↑', field: 'rating', order: 'asc' as const },
  { value: 'rating-desc', label: 'Рейтинг ↓', field: 'rating', order: 'desc' as const },
];
