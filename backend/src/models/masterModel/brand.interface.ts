import { MasterStatus } from "../../enum.js";

export interface IBrand {
  id: number;

  name: string;

  slug: string;

  description: string;

  display_order: number;

  status: MasterStatus;

  created_at: Date;

  updated_at: Date;
}