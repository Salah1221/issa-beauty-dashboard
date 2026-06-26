import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, KeyRound, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

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
            <svg
              width="37"
              height="37"
              viewBox="0 0 37 37"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.56 3.76439C14.9204 4.91745 12.7902 5.65651 14.24 12.7787C14.04 12.6585 13.472 12.4181 12.8 12.4181C8.12 12.4181 4.48 14.1409 2 15.6633C5.84 17.2258 4.16 19.87 10.88 21.6728C10.96 21.152 11.552 19.87 13.28 18.9085C15.44 17.7065 17.24 16.0239 19.28 10.7355C19.24 11.3765 18.944 13.1874 18.08 15.3027C17 17.9469 14.24 19.6296 12.32 21.793C10.4 23.9565 8.84 31.7689 13.28 34.6535C11.48 24.4372 27.44 16.6248 21.08 6.64897C20 4.9663 18.92 4.84611 16.76 1C16.52 1.56089 16.16 2.68267 15.56 3.76439Z"
                fill="hsl(var(--primary))"
              />
              <path
                d="M35 9.53356C27.704 8.28357 24.6 9.814 23.96 10.7355C25.64 13.9806 23.72 13.4999 25.04 14.5816L26.96 15.9037C27.12 15.9437 27.44 16.1441 27.44 16.6248C27.44 17.2258 26.72 16.8652 26.72 17.7065C26.96 18.1873 27.92 17.9469 26.72 18.9085C27.04 19.0286 27.488 19.4133 26.72 19.9902C27.32 20.7113 27.68 22.5142 23.96 22.1536C23.24 22.1536 21.704 22.8267 21.32 25.519C24.296 29.2689 30.88 29.325 33.8 28.8843C33.76 27.3218 32.624 23.1392 28.4 18.9085C33.68 16.1441 33.8 10.7355 35 9.53356Z"
                fill="hsl(var(--primary))"
              />
            </svg>
            <div className="font-bold text-xl">Dashboard</div>
          </Link>
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
                  <span className="sr-only">Change password</span>
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
