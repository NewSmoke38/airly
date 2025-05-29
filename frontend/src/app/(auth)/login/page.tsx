"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // TODO: Replace with your API endpoint
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.usernameOrEmail,
          email: form.usernameOrEmail,
          password: form.password,
        }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      // handle success (redirect, etc)
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-3">
          <div className="mx-auto w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-neutral-900">Log in to Vibely</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="usernameOrEmail"
              placeholder="Email or username"
              value={form.usernameOrEmail}
              onChange={handleChange}
              required
              className="h-12"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="h-12"
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button
              type="submit"
              className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-neutral-600 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-neutral-900 font-semibold hover:underline">Sign up</Link>
          </div>
          
          <div className="mt-8 text-xs text-center text-neutral-500">
            By continuing, you agree to Vibely's Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 