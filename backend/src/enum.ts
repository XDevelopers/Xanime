export enum Role {
  Admin = 100,
  User = 99,
}


export enum Gender {
  Male = 201,
  Female = 202,
  Trans = 203,
}




export enum DeliveryStatus {
  Initiate = 301,
  MidPoint = 302,
  Complete = 303,
  Cancelled = 304,
}


export enum ActiveStatus {
  Active = 401,
  InActive = 402,
  Blocked = 403,
}


export enum OrderStatus {
  New = 501,
  Pending = 502,
  Complete = 503,
  Cancelled = 504,
}


export enum Section {
  Blog = 601,
  Product = 602,
}


export enum PaymentStatus {
  Pending = 701,
  Paid = 702,
  Failed = 703,
}


export enum PaymentMethod {
  COD = 801,
  UPI = 802,
}


export enum MasterStatus {
    Active = 901,
    Inactive = 902
}


export enum ProductStatus {
  Active = 911,
  Inactive = 912,
  OutOfStock = 913,
  Draft = 914,
}