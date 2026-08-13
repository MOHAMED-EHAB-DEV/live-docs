"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const Signin = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invalid email or password");
        } else {
          // Token is set in HTTP-only cookie, redirect to home
          window.location.href = "/dashboard";
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-dark-100">
      <Card className="w-full max-w-md bg-dark-200 border border-dark-350 p-4">
        <CardHeader className="flex flex-col gap-3 items-center pb-6">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={52}
              height={52}
            />
          </Link>
          <div className="text-center">
            <h4 className="font-bold text-xl text-white">
              Sign in to LiveDocs
            </h4>
            <p className="text-sm text-gray-400">
              Welcome back! Please sign in to continue.
            </p>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              required
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-dark-350 bg-dark-300"
            />
            <Input
              required
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border-dark-350 bg-dark-300"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full h-12 font-medium"
              isLoading={isPending}
            >
              Sign in
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-dark-350"></div>
            <span className="shrink-0 mx-4 text-gray-500 text-sm">Or continue with</span>
            <div className="grow border-t border-dark-350"></div>
          </div>

          <Button
            as="a"
            href="/api/auth/google"
            variant="outline"
            className="w-full h-12 font-medium flex items-center justify-center gap-2 border-dark-350 bg-dark-200 hover:bg-dark-300"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Google
          </Button>

          <div className="flex justify-center items-center gap-2 mt-4">
            <span className="text-gray-400 text-sm">
              Don't have an account?
            </span>
            <Link
              href="/sign-up"
              className="text-blue-500 font-medium text-sm hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Signin;
