import { MasterStatus } from "../../enum.js";

export interface IUnit {
  id: number;

  name: string;

  symbol: string;

  display_order: number;

  status: MasterStatus;

  created_at: Date;

  updated_at: Date;
}