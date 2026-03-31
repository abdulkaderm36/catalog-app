import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  companyName: z.string().min(1, "Required"),
  companySlug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
});

const accountSchema = z.object({
  name: z.string().min(1, "Required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { companyName: user?.companyName ?? "", companySlug: user?.companySlug ?? "" },
  });

  const accountForm = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (data: z.infer<typeof profileSchema>) => {
    const res = await apiFetch("/api/settings/company", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) { toast.error("Failed to save"); return; }
    toast("Company profile saved");
  };

  const saveAccount = async (data: z.infer<typeof accountSchema>) => {
    const res = await apiFetch("/api/settings/account", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) { toast.error("Failed to save"); return; }
    toast("Account saved");
  };

  const savePassword = async (data: z.infer<typeof passwordSchema>) => {
    const res = await apiFetch("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    if (!res.ok) { toast.error("Failed to update password"); return; }
    toast("Password updated");
    setShowPasswordForm(false);
    passwordForm.reset();
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    const res = await apiFetch("/api/auth/account", { method: "DELETE" });
    setIsDeleting(false);
    if (!res.ok) { toast.error("Failed to delete account"); return; }
    setDeleteDialogOpen(false);
    logout();
    navigate("/login");
    toast("Account deleted");
  };

  return (
    <div className="space-y-6 max-w-[600px]">
      <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>

      {/* Company Profile */}
      <Card>
        <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Company name</label>
              <Input {...profileForm.register("companyName")} />
              {profileForm.formState.errors.companyName && (
                <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.companyName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Catalog URL:{" "}
                <span className="font-mono text-[var(--accent)]">
                  catalogr.app/{profileForm.watch("companySlug")}
                </span>
              </label>
              <Input {...profileForm.register("companySlug")} className="font-mono" />
              {profileForm.formState.errors.companySlug && (
                <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.companySlug.message}</p>
              )}
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save</Button>
          </form>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={accountForm.handleSubmit(saveAccount)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Your name</label>
              <Input {...accountForm.register("name")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <Input value={user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
            </div>
            <Button type="submit" disabled={accountForm.formState.isSubmitting}>Save account</Button>
          </form>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            {!showPasswordForm ? (
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-[var(--accent)] font-medium hover:underline"
              >
                Change password
              </button>
            ) : (
              <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-3 mt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Current password</label>
                  <Input type="password" {...passwordForm.register("currentPassword")} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">New password</label>
                  <Input type="password" {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Confirm new password</label>
                  <Input type="password" {...passwordForm.register("confirmPassword")} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={passwordForm.formState.isSubmitting}>Update password</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Catalog Appearance — placeholder */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Catalog Appearance</CardTitle>
          <span className="text-xs bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </CardHeader>
      </Card>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Permanently delete your account and all associated data.
        </p>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your company, all products, and your catalog. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={deleteAccount} disabled={isDeleting}>
                  {isDeleting ? "Deleting…" : "Yes, delete everything"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
