import { useRef, useState, useCallback } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  id: string;
  url: string;
  displayUrl?: string; // blob URL for local preview; falls back to url
  isCover: boolean;
  progress?: number;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onUpload: (file: File) => Promise<void>;
}

function SortableImage({
  image,
  onRemove,
  onSetCover,
}: {
  image: UploadedImage;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const [imgError, setImgError] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative rounded-lg overflow-hidden border-2",
        image.isCover ? "border-[var(--accent)]" : "border-[var(--border)]"
      )}
    >
      {!imgError ? (
        <img
          src={image.displayUrl ?? image.url}
          alt=""
          className="w-full h-20 object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-20 bg-[var(--bg-elevated)] flex items-center justify-center">
          <FileImage className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
      )}
      {image.progress !== undefined && image.progress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border)]">
          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${image.progress}%` }} />
        </div>
      )}
      <button
        type="button"
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
        onClick={() => onRemove(image.id)}
      >
        <X className="w-3 h-3" />
      </button>
      <button
        type="button"
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      {!image.isCover && (
        <button
          type="button"
          className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded"
          onClick={() => onSetCover(image.id)}
        >
          Set cover
        </button>
      )}
      {image.isCover && (
        <span className="absolute bottom-1 left-1 text-[10px] bg-[var(--accent)] text-white px-1.5 py-0.5 rounded">
          Cover
        </span>
      )}
    </div>
  );
}

export function ImageUpload({ images, onChange, onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((f) => onUpload(f));
    },
    [onUpload]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over.id);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const removeImage = (id: string) => onChange(images.filter((i) => i.id !== id));
  const setCover = (id: string) => onChange(images.map((i) => ({ ...i, isCover: i.id === id })));

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-150",
          isDragOver
            ? "border-[var(--accent)] bg-[var(--accent-pale-bg)]"
            : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-pale-bg)]"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-sm text-[var(--text-secondary)]">Click to upload or drag and drop</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG up to 10MB · Max 10 images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <SortableImage key={img.id} image={img} onRemove={removeImage} onSetCover={setCover} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
