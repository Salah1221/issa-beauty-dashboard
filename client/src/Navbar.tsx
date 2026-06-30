import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, LogOut, KeyRound, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getPendingCount } from "./lib/orders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { logout, changePassword } from "./lib/auth";
import Logo from "./components/Logo";

const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      getPendingCount()
        .then((c) => { if (active) setPendingCount(c); })
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
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.toggle("dark", savedTheme === "dark");
      themeColorMetaTag?.setAttribute(
        "content",
        theme === "dark" ? "#020817" : "#ffffff"
      );
    }
  }, [theme, themeColorMetaTag]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.classList.toggle("dark", newTheme === "dark");
    themeColorMetaTag?.setAttribute(
      "content",
      theme === "dark" ? "#020817" : "#ffffff"
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

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <Link
            to={"/"}
            className="flex-shrink-0 flex items-center gap-3"
            id="logo"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" asChild className="h-11 px-3">
              <Link to="/">Products</Link>
            </Button>
            <Button variant="ghost" asChild className="h-11 px-3">
              <Link to="/orders" className="relative">
                Orders
                {pendingCount > 0 && (
                  <Badge className="ml-2 px-1.5 py-0 text-[10px]">{pendingCount}</Badge>
                )}
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 w-11 px-0 sm:w-auto sm:px-4"
                >
                  <KeyRound className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Change password</span>
                  <span className="sr-only sm:hidden">Change password</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                  <DialogDescription>
                    Update the dashboard password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current password</Label>
                    <Input
                      id="current"
                      type="password"
                      autoComplete="current-password"
                      className="h-11"
                      required
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New password</Label>
                    <Input
                      id="new"
                      type="password"
                      autoComplete="new-password"
                      className="h-11"
                      required
                      value={next}
                      onChange={(e) => setNext(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="h-11 w-full"
                    >
                      {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                  </DialogFooter>
                </form>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
