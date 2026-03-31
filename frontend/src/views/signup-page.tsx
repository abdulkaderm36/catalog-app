import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OwnerNotice } from "@/components/ui/owner-notice";

const schema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    companySlug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const companyName = watch("companyName");
  useEffect(() => {
    if (companyName) setValue("companySlug", toSlug(companyName), { shouldValidate: false });
  }, [companyName, setValue]);

  const onSubmit = async (data: FormData) => {
    const { confirmPassword: _, ...payload } = data;
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error((err as { error?: string }).error ?? "Failed to create account");
      return;
    }
    const { token } = await res.json();
    const meRes = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await meRes.json();
    login(token, user);
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-[420px] sm:rounded-[14px] sm:border sm:border-[var(--border)] sm:bg-[var(--bg-surface)] sm:shadow-[var(--shadow-elevated)] px-8 py-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-sm bg-white" />
        </div>
        <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">Catalogr</span>
      </div>

      <OwnerNotice />

      <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mb-1">Create your account</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Set up your company catalog in minutes</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Company name</label>
          <Input placeholder="Acme Co." {...register("companyName")} />
          {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Catalog URL:{" "}
            <span className="text-[var(--text-muted)]">catalogr.app/</span>
            <span className="text-[var(--accent)] font-mono">{watch("companySlug") || "your-slug"}</span>
          </label>
          <Input placeholder="acme-co" {...register("companySlug")} className="font-mono" />
          {errors.companySlug && <p className="text-xs text-red-500 mt-1">{errors.companySlug.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Your name</label>
            <Input placeholder="Jane Doe" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
            <Input type="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
          <Input type="password" placeholder="Min 8 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Confirm password</label>
          <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account →"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--accent)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
