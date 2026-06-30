import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "@react-hookz/web";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationControls from "./components/PaginationControls";
import OrderTable, { STATUS_BADGE } from "./components/OrderTable";
import OrderDetailDrawer from "./components/OrderDetailDrawer";
import { getOrders } from "./lib/orders";
import { Order, OrderStatus } from "./types";

const STATUS_OPTIONS: ("all" | OrderStatus)[] = [
  "all",
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const mobile = useMediaQuery("(max-width: 640px)") ?? false;

  const fetchOrders = useCallback(
    async (p: number) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const { orders, pages } = await getOrders(
          { page: p, limit: 20, status: statusFilter },
          abortRef.current.signal,
        );
        setOrders(orders);
        setTotalPages(pages);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching orders:", err);
        setOrders([]);
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const openOrder = (order: Order) => {
    setSelected(order);
    setDrawerOpen(true);
  };

  const handleStatusChanged = (updated: Order) => {
    setSelected(updated);
    fetchOrders(page);
  };

  return (
    <div className="p-5 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Orders</h1>

      <div className="mb-4 w-full sm:max-w-[200px]">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | OrderStatus)}
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : STATUS_BADGE[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <OrderTable orders={orders} loading={loading} onRowClick={openOrder} />
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        mobile={mobile}
        onPageChange={setPage}
      />

      <OrderDetailDrawer
        order={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  );
};

export default Orders;
