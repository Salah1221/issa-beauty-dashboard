export type Product = {
  _id: string;
  category: string;
  description: string;
  discountPercentage?: number;
  imageUrl: string;
  in_stock?: boolean;
  name: string;
  price: number;
  createdAt: string;
};

export type Category = {
  name: string;
  _id: string;
};

export type BannerImage = {
  _id: string;
  imageUrl: string;
  imageFileId?: string;
};

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  discountPercentage: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customer: { fullName: string; phone: string; email?: string };
  shipping: { address: string; city: string; area?: string; notes?: string };
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
};
