import React, { useState } from "react";
import { useMediaQuery } from "@react-hookz/web";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Order, OrderStatus } from "../types";
import { updateOrderStatus } from "../lib/orders";
import { STATUS_BADGE, StatusBadge } from "./OrderTable";
import ImageWithSkeleton from "./ImageWithSkeleton";

const ALL_STATUSES = Object.keys(STATUS_BADGE) as OrderStatus[];

interface OrderDetailDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged: (updated: Order) => void;
}

// Order detail presented as a centered modal on desktop and a bottom-sheet
// drawer on mobile. The body (items, customer, delivery, status) is shared;
// only the surrounding container differs by breakpoint.
const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  open,
  onOpenChange,
  onStatusChanged,
}) => {
  const [saving, setSaving] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)") ?? false;

  if (!order) return null;

  const handleStatus = async (status: OrderStatus) => {
    if (status === order.status) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order._id, status);
      toast.success(`Order ${order.orderNumber} → ${STATUS_BADGE[status].label}`);
      onStatusChanged(updated);
      window.dispatchEvent(new Event("orders:changed"));
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not update status";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const description = `${new Date(order.createdAt).toLocaleString()} · Cash on delivery`;

  const body = (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Items
        </p>
        <div className="divide-y">
          {order.items.map((it) => (
            <div key={it.productId} className="flex items-center gap-3 py-2">
              <ImageWithSkeleton
                src={it.imageUrl}
                alt={it.name}
                width={96}
                className="h-10 w-10 flex-shrink-0 rounded"
              />
              <span className="flex-1 text-sm">
                {it.name} × {it.quantity}
              </span>
              <span className="text-sm font-medium">
                ${it.lineTotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="text-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Customer
        </p>
        <p>{order.customer.fullName}</p>
        <p>{order.customer.phone}</p>
        {order.customer.email && <p>{order.customer.email}</p>}
      </section>

      <section className="text-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Delivery
        </p>
        <p>
          {order.shipping.address}
          {order.shipping.area ? `, ${order.shipping.area}` : ""}, {order.shipping.city}
        </p>
        {order.shipping.notes && (
          <p className="mt-1 text-muted-foreground">Notes: {order.shipping.notes}</p>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Update status
        </p>
        <Select
          value={order.status}
          onValueChange={(v) => handleStatus(v as OrderStatus)}
          disabled={saving}
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_BADGE[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {order.orderNumber}
              <StatusBadge status={order.status} />
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="flex items-center gap-3">
              {order.orderNumber}
              <StatusBadge status={order.status} />
            </DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {body}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderDetailDrawer;
