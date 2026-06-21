"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ClientraIcon } from "@/components/ui/clientra-icon";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations";

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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Something went wrong");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
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
              "radial-gradient(ellipse at 30% 60%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 10%, rgba(124,58,237,0.06) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <ClientraIcon size={36} />
          <span className="font-bold text-xl text-foreground">Clientra</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Your contacts,
              <br />
              organized for you.
            </h2>
            <p className="text-subtle mt-3 text-sm leading-relaxed">
              Track deals, manage contacts, and close more business — all in one
              clean workspace.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "Contact & company management",
              "Visual deals pipeline",
              "Activity tracking & notes",
              "Team collaboration",
            ].map((feature, i) => (
              <motion.li
                key={feature}
                className="flex items-center gap-3 text-sm text-muted"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.4 + i * 0.08,
                  duration: 0.4,
                  ease: "easeOut",
                }}
              >
                <div className="h-5 w-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
                  <svg
                    className="h-2.5 w-2.5 text-accent"
                    fill="none"
                    viewBox="0 0 12 10"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 5l3 3 7-7"
                    />
                  </svg>
                </div>
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-subtle">
          Free to get started · No credit card required
        </p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-sm space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="lg:hidden flex items-center gap-3"
          >
            <ClientraIcon size={36} />
            <span className="font-bold text-xl text-foreground">Clientra</span>
          </motion.div>

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
            <p className="text-subtle text-sm mt-1">
              Get started for free, no card required
            </p>
          </motion.div>

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
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-raised hover:border-border-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : "Sign up with Google"}
          </motion.button>

          <motion.div variants={item} className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-subtle">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          <motion.form
            variants={item}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full shadow-lg shadow-violet-900/20"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </motion.form>

          <motion.p
            variants={item}
            className="text-center text-sm text-subtle"
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent-light font-medium transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
