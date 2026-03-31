import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Invalid email or password");
      return;
    }
    const { token } = await res.json();
    const meRes = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      toast.error("Failed to load user profile");
      return;
    }
    const user = await meRes.json();
    login(token, user);
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-[420px] sm:rounded-[14px] sm:border sm:border-[var(--border)] sm:bg-[var(--bg-surface)] sm:shadow-[var(--shadow-elevated)] px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">Catalogr</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
          <Input type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">Password</label>
            <button
              type="button"
              aria-disabled="true"
              className="text-xs text-[var(--accent)] opacity-50 cursor-not-allowed"
              title="Coming soon"
            >
              Forgot password?
            </button>
          </div>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in →"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-[var(--accent)] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
