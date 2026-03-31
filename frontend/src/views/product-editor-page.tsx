import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload, type UploadedImage } from "@/components/ui/image-upload";
import { apiFetch } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  sku: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  slug: z.string().optional(),
  externalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductEditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!productId;
  const [images, setImages] = useState<UploadedImage[]>([]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { status: "draft", featured: false },
    });

  const productName = watch("name");
  useEffect(() => {
    if (!isEditing && productName) {
      setValue("slug", toSlug(productName), { shouldValidate: false });
    }
  }, [productName, isEditing, setValue]);

  const { data: productData } = useQuery<FormData & { images?: UploadedImage[] }>({
    queryKey: ["product", productId],
    queryFn: () =>
      apiFetch(`/api/products/${productId}`).then((r) => r.json()),
    enabled: isEditing,
  });

  useEffect(() => {
    if (productData) {
      reset(productData);
      // Strip displayUrl/progress — blob URLs from prior sessions are invalid
      setImages(
        (productData.images ?? []).map(({ displayUrl: _d, progress: _p, ...img }) => img)
      );
    }
  }, [productData]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditing ? `/api/products/${productId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...data,
          images: images.map(({ displayUrl: _d, progress: _p, ...img }) => img),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Save failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast("Product saved");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (file: File) => {
    const tempId = Math.random().toString(36).slice(2);
    setImages((prev) => [
      ...prev,
      { id: tempId, url: URL.createObjectURL(file), isCover: prev.length === 0, progress: 0 },
    ]);
    try {
      const { uploadUrl, imageId } = await apiFetch(
        `/api/products/${productId ?? "new"}/images/presign`,
        { method: "POST", body: JSON.stringify({ fileName: file.name, contentType: file.type }) }
      ).then((r) => r.json());

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setImages((prev) => prev.map((i) => (i.id === tempId ? { ...i, progress: pct } : i)));
        }
      };
      await new Promise<void>((res, rej) => {
        xhr.onload = () => res();
        xhr.onerror = () => rej(new Error("Upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.send(file);
      });

      const confirmed: UploadedImage = await apiFetch(
        `/api/products/${productId ?? "new"}/images/confirm`,
        { method: "POST", body: JSON.stringify({ imageId }) }
      ).then((r) => r.json());

      setImages((prev) => prev.map((i) => (i.id === tempId ? { ...confirmed, isCover: i.isCover, displayUrl: i.url, progress: 100 } : i)));
    } catch {
      setImages((prev) => prev.filter((i) => i.id !== tempId));
      toast.error("Image upload failed");
    }
  };

  const save = (overrideStatus?: "draft" | "published") =>
    handleSubmit((data) => saveMutation.mutate(overrideStatus ? { ...data, status: overrideStatus } : data))();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          {isEditing ? "Edit Product" : "New Product"}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/products")}>Discard</Button>
          <Button variant="outline" onClick={() => save("draft")} disabled={isSubmitting}>Save draft</Button>
          <Button onClick={() => save("published")} disabled={isSubmitting}>Publish →</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Product details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Product name *</label>
                <Input placeholder="e.g. Wool Scarf" {...register("name")} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Description *</label>
                <Textarea placeholder="Describe your product…" {...register("description")} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Price *</label>
                  <Input type="number" step="0.01" placeholder="0.00" {...register("price")} />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">SKU</label>
                  <Input placeholder="PROD-001" {...register("sku")} className="font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} onUpload={handleUpload} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Status</label>
                <Select defaultValue="draft" onValueChange={(v) => setValue("status", v as "draft" | "published")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Feature in catalog</p>
                  <p className="text-xs text-[var(--text-secondary)]">Highlighted at the top</p>
                </div>
                <Switch
                  checked={watch("featured")}
                  onCheckedChange={(v) => setValue("featured", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Slug</label>
                <Input placeholder="my-product" {...register("slug")} className="font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">External URL</label>
                <Input placeholder="https://…" {...register("externalUrl")} />
                {errors.externalUrl && <p className="text-xs text-red-500 mt-1">{errors.externalUrl.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
