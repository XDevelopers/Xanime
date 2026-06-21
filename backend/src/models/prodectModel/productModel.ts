export interface IProduct {
  id: number;

  name: string;

  price_before_discount: number;

  price_after_discount: number;

  images: string[];
  // contains image paths

  description?: string;

  stock: number;

  category_id: number;

  status: 7 | 9 | 11;
  // 7 Active
  // 9 Inactive
  // 11 Out of stock

  created_at: Date;

  updated_at: Date;
}
