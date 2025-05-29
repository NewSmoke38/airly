"use client";
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    pfp: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "pfp" && files && files.length > 0) {
      setForm((prev) => ({ ...prev, pfp: files[0] }));
      // Create a preview URL for the selected image
      const fileUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(fileUrl);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("username", form.username);
      formData.append("password", form.password);
      if (form.pfp) formData.append("pfp", form.pfp);
      // TODO: Replace with your API endpoint
      const res = await fetch("http://localhost:3000/api/v1/users/register", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Signup failed");
      // handle success (redirect, etc)
    } catch (err: any) {
      setError(err.message || "Signup failed");
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
          <CardTitle className="text-2xl font-bold text-center text-neutral-900">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 mb-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200 flex items-center justify-center">
                {previewUrl ? (
                  <Image 
                    src={previewUrl} 
                    alt="Profile preview" 
                    fill 
                    style={{ objectFit: "cover" }} 
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
              </div>
              <label className="cursor-pointer text-sm font-medium text-neutral-900 hover:underline">
                {previewUrl ? "Change profile picture" : "Add profile picture"}
                <input
                  name="pfp"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  className="hidden"
                />
              </label>
            </div>

            <Input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="h-12"
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="h-12"
            />
            <Input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="h-12"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password (6-8 characters)"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              maxLength={8}
              required
              className="h-12"
            />
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            
            <Button
              type="submit"
              className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-neutral-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-neutral-900 font-semibold hover:underline">Log in</Link>
          </div>
          
          <div className="mt-8 text-xs text-center text-neutral-500">
            By signing up, you agree to Vibely's Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 