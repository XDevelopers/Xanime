import { ActiveStatus } from "../../enum.js";
export interface IBlog {
  id: number;

  product_id?: number;
  // optional relation with product

  image?: string;
  // header image path

  header: string;

  content: string;

  likes: number;

  dislikes: number;

  comment_enabled: boolean;
  // false for now

  status: ActiveStatus;

  created_at: Date;

  updated_at: Date;
}
