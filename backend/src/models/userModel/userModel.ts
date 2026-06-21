import { Gender, Role, ActiveStatus } from "../../enum.js";
export interface IUser {
  id: number;

  first_name: string;

  last_name: string;

  gender: Gender;

  email: string;

  password: string;

  phone_number: string;

  street_name: string;

  city: string;

  state: string;

  country: string;

  pincode: string;

  role: Role;

  status: ActiveStatus;

  email_verified: boolean;

  created_at: Date;

  updated_at: Date;
}
