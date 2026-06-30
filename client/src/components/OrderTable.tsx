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

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onRowClick: (order: Order) => void;
}

const RowsSkeleton = () => (
  <>
    {[...Array(8)].map((_, i) => (
      <TableRow key={i}>
        {[...Array(5)].map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-full max-w-[140px]" />
          </TableCell>
        ))}
      </TableRow>
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
              <TableCell>
                {order.items.reduce((n, it) => n + it.quantity, 0)}
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
