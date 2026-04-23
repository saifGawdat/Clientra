"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const OAUTH_ERRORS: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_token: "Failed to authenticate with Google. Please try again.",
  google_userinfo: "Could not retrieve your Google profile. Please try again.",
  google_failed: "Google sign-in failed. Please try again.",
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const oauthError = searchParams.get("error");
  const defaultError =
    oauthError && OAUTH_ERRORS[oauthError] ? OAUTH_ERRORS[oauthError] : "";

  const [error, setError] = useState(defaultError);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = searchParams.get("registered") === "1";

  return (
    <motion.div
      className="w-full max-w-sm space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="lg:hidden flex items-center gap-3">
        <Image
          src="/clientra-icon-dark.svg"
          alt="Clientra"
          width={36}
          height={36}
        />
        <span className="font-bold text-xl text-white">Clientra</span>
      </motion.div>

      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-[#71717a] text-sm mt-1">
          Sign in to your account to continue
        </p>
      </motion.div>

      {showSuccess && (
        <motion.div
          variants={item}
          className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-sm"
        >
          Account created! Sign in below.
        </motion.div>
      )}

      {error && (
        <motion.div
          variants={item}
          className="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        variants={item}
        type="button"
        onClick={() => {
          setGoogleLoading(true);
          window.location.href = "/api/auth/google";
        }}
        disabled={googleLoading || loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-sidebar-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#27272a] hover:border-[#3f3f46] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </motion.button>

      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#1e1e24]" />
        <span className="text-xs text-[#52525b]">or continue with email</span>
        <div className="flex-1 h-px bg-[#1e1e24]" />
      </motion.div>

      <motion.form
        variants={item}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[#a1a1aa] text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="bg-sidebar-accent border-border text-white placeholder:text-[#52525b] focus-visible:ring-accent focus-visible:border-accent"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-[#a1a1aa] text-sm font-medium"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="bg-sidebar-accent border-border text-white placeholder:text-[#52525b] focus-visible:ring-accent focus-visible:border-accent"
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium shadow-lg shadow-violet-900/20"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </motion.form>

      <motion.p variants={item} className="text-center text-sm text-[#71717a]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#7c3aed] hover:text-[#8b5cf6] font-medium transition-colors"
        >
          Sign up free
        </Link>
      </motion.p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#09090b]">
      {/* Left branding panel */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-border"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.06) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/clientra-icon-dark.svg"
            alt="Clientra"
            width={36}
            height={36}
          />
          <span className="font-bold text-xl text-white">Clientra</span>
        </div>

        <div className="relative z-10 space-y-6">
          <p className="text-2xl font-medium text-white leading-snug">
            &quot;The simplest CRM we&apos;ve ever used. Everything is exactly
            where you expect it.&quot;
          </p>
          <div className="space-y-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-4 w-4 text-[#7c3aed]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-[#71717a]">
              — Saif Gawdat, Product Lead
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            ["10k+", "Contacts managed"],
            ["98%", "Uptime SLA"],
            ["4.9★", "User rating"],
          ].map(([val, label]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-sidebar-accent/60 p-4"
            >
              <p className="text-xl font-bold text-white">{val}</p>
              <p className="text-xs text-[#71717a] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
