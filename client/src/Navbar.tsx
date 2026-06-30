import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@react-hookz/web";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Sun,
  LogOut,
  KeyRound,
  Loader2,
  Menu,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getPendingCount } from "./lib/orders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { logout, changePassword } from "./lib/auth";
import Logo from "./components/Logo";

const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)") ?? false;

  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      getPendingCount()
        .then((c) => {
          if (active) setPendingCount(c);
        })
        .catch(() => {});
    refresh();
    window.addEventListener("orders:changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("orders:changed", refresh);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.toggle("dark", savedTheme === "dark");
      themeColorMetaTag?.setAttribute(
        "content",
        savedTheme === "dark" ? "#020817" : "#ffffff"
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.classList.toggle("dark", newTheme === "dark");
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    themeColorMetaTag?.setAttribute(
      "content",
      newTheme === "dark" ? "#020817" : "#ffffff"
    );
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success("Password changed");
      setCurrent("");
      setNext("");
      setOpen(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not change password";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Shared change-password form fields (used in both Dialog and Drawer)
  const changePasswordForm = (idPrefix: string) => (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-current`}>Current password</Label>
        <Input
          id={`${idPrefix}-current`}
          type="password"
          autoComplete="current-password"
          className="h-11"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-new`}>New password</Label>
        <Input
          id={`${idPrefix}-new`}
          type="password"
          autoComplete="new-password"
          className="h-11"
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={saving} className="h-11 w-full">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save
      </Button>
    </form>
  );

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-3"
            id="logo"
          >
            <Logo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              aria-current={isActive("/") ? "page" : undefined}
              className={`relative h-11 px-3 inline-flex items-center text-sm font-medium transition-colors rounded-md
                ${isActive("/")
                  ? "text-foreground font-semibold after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
            >
              Products
            </Link>
            <Link
              to="/orders"
              aria-current={isActive("/orders") ? "page" : undefined}
              className={`relative h-11 px-3 inline-flex items-center gap-2 text-sm font-medium transition-colors rounded-md
                ${isActive("/orders")
                  ? "text-foreground font-semibold after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
            >
              Orders
              {pendingCount > 0 && (
                <Badge className="px-1.5 py-0 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          </div>

          {/* Desktop secondary actions */}
          <div className="hidden sm:flex items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-11 w-11"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            {/* Desktop: always Dialog */}
            <Dialog open={isDesktop ? open : false} onOpenChange={isDesktop ? setOpen : undefined}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="h-11 px-3">
                  <KeyRound className="h-5 w-5 mr-2" />
                  Change password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                  <DialogDescription>
                    Update the dashboard password.
                  </DialogDescription>
                </DialogHeader>
                {changePasswordForm("desktop")}
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-11 w-11"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex sm:hidden items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-11 w-11"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 relative"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground leading-none">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-left text-sm font-medium text-muted-foreground">
              Navigation
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col px-4 pb-6 gap-1">
            <DrawerClose asChild>
              <Link
                to="/"
                aria-current={isActive("/") ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors ${
                  isActive("/")
                    ? "bg-accent text-accent-foreground font-medium"
                    : "font-medium hover:bg-accent/50"
                }`}
              >
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                Products
              </Link>
            </DrawerClose>
            <DrawerClose asChild>
              <Link
                to="/orders"
                aria-current={isActive("/orders") ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors ${
                  isActive("/orders")
                    ? "bg-accent text-accent-foreground font-medium"
                    : "font-medium hover:bg-accent/50"
                }`}
              >
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                Orders
                {pendingCount > 0 && (
                  <Badge className="ml-auto px-1.5 py-0 text-[10px]">
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            </DrawerClose>

            <div className="my-2 border-t" />

            {/* Change password — bottom-sheet Drawer on mobile */}
            <button
              className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent text-left w-full"
              onClick={() => {
                setDrawerOpen(false);
                setOpen(true);
              }}
            >
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              Change password
            </button>

            <button
              className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent text-left w-full"
              onClick={() => {
                setDrawerOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              Log out
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Change-password: bottom-sheet Drawer on mobile, Dialog on desktop */}
      {!isDesktop && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Change password</DrawerTitle>
              <DrawerDescription>Update the dashboard password.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2">
              {changePasswordForm("mobile")}
            </div>
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      )}
    </nav>
  );
};

export default Navbar;
