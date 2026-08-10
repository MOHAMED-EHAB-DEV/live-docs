"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

const Signup = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        // 1. Sign up
        const signUpRes = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const signUpData = await signUpRes.json();

        if (!signUpRes.ok) {
          setError(signUpData.error || "Failed to sign up");
          return;
        }

        // 2. Automatically sign in after sign up
        const signInRes = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const signInData = await signInRes.json();

        if (!signInRes.ok) {
          setError(
            signInData.error ||
              "Failed to auto-login. Please sign in manually.",
          );
        } else {
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
              Create your account
            </h4>
            <p className="text-sm text-gray-400">
              Welcome! Please fill in the details to get started.
            </p>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              required
              label="Full Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border-dark-350 bg-dark-300"
            />
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
              placeholder="Create a password"
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
              Sign up
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-dark-350"></div>
            <span className="shrink-0 mx-4 text-gray-500 text-sm">Or continue with</span>
            <div className="grow border-t border-dark-350"></div>
          </div>

          <Button
            as={Link}
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
              Already have an account?
            </span>
            <Link
              href="/sign-in"
              className="text-blue-500 font-medium text-sm hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Signup;
