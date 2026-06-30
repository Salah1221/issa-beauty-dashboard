import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Order, OrderStatus } from "../types";

export const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; variant?: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  pending: { label: "Pending", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default" },
  delivered: {
    label: "Delivered",
    variant: "outline",
    className: "border-transparent bg-[hsl(var(--chart-2))] text-white",
  },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const s = STATUS_BADGE[status];
  return (
    <Badge variant={s.variant} className={s.className}>
      {s.label}
    </Badge>
  );
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const itemCount = (order: Order) =>
  order.items.reduce((n, it) => n + it.quantity, 0);

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onRowClick: (order: Order) => void;
}

const RowsSkeleton = () => (
  <>
    {[...Array(8)].map((_, i) => (
      <TableRow key={i}>
        {[...Array(6)].map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-full max-w-[140px]" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const CardsSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-32" />
        <Skeleton className="mt-3 h-5 w-20" />
      </div>
    ))}
  </>
);

const OrderTable: React.FC<OrderTableProps> = ({ orders, loading, onRowClick }) => {
  if (!loading && orders.length === 0) {
    return (
      <p className="text-muted-foreground font-bold text-3xl mt-5">No Orders</p>
    );
  }

  return (
    <>
      {/* Mobile: card list (below sm) */}
      <div className="space-y-3 sm:hidden">
        {loading ? (
          <CardsSkeleton />
        ) : (
          orders.map((order) => (
            <button
              key={order._id}
              type="button"
              onClick={() => onRowClick(order)}
              className="block w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {order.customer.fullName} · {fmtDate(order.createdAt)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-semibold">
                  ${order.total.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {itemCount(order)} {itemCount(order) === 1 ? "item" : "items"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Desktop: table (sm and up) */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="whitespace-nowrap">
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="whitespace-nowrap">
            {loading ? (
              <RowsSkeleton />
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order._id}
                  className="cursor-pointer"
                  onClick={() => onRowClick(order)}
                >
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{fmtDate(order.createdAt)}</TableCell>
                  <TableCell>{order.customer.fullName}</TableCell>
                  <TableCell>{itemCount(order)}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default OrderTable;
