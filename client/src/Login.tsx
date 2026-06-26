import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { login } from "./lib/auth";
import Logo from "./components/Logo";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/");
    } catch {
      setError("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center overflow-x-hidden bg-background p-4">
      <Card className="w-full max-w-sm overflow-hidden">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <CardDescription>Sign in to manage your products</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoFocus
                autoComplete="current-password"
                className="h-11 w-full"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 w-full text-sm font-medium"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
