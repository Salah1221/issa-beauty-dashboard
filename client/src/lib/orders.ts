import axios from "axios";
import { Order, OrderStatus } from "../types";

export type OrdersPage = {
  orders: Order[];
  total: number;
  pages: number;
  pendingCount: number;
};

export async function getOrders(
  params: { page: number; limit?: number; status?: OrderStatus | "all" },
  signal?: AbortSignal,
): Promise<OrdersPage> {
  const res = await axios.get("/api/orders", {
    params: {
      page: params.page,
      limit: params.limit ?? 20,
      status: params.status && params.status !== "all" ? params.status : undefined,
    },
    signal,
  });
  const d = res.data;
  return { orders: d.data, total: d.total, pages: d.pages, pendingCount: d.pendingCount };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const res = await axios.patch(`/api/orders/${id}/status`, { status });
  return res.data.data;
}

export async function getPendingCount(): Promise<number> {
  const res = await axios.get("/api/orders/pending-count");
  return res.data.count;
}
