import { PaymentMethod, PaymentStatus, OrderStatus } from "../../enum.js";
export interface IOrder {
  id: number;

  user_id: number;

  order_number: string;

  product_ids: number[];

  total_amount: number;

  discount_amount: number;

  final_amount: number;

  payment_method: PaymentMethod;

  payment_status: PaymentStatus;

  order_status: OrderStatus;

  shipping_address: string;

  created_at: Date;

  updated_at: Date;
}
