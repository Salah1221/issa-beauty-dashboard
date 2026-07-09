import React, { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ikThumb } from "@/lib/image";

interface ImageWithSkeletonProps {
  src: string | null | undefined;
  alt: string;
  /** Target thumbnail width in pixels (pass ~2x the CSS width for retina). */
  width: number;
  /** Sizing/shape classes for the box, e.g. "h-10 aspect-[3/2] rounded". */
  className?: string;
}

// Shows a skeleton placeholder until the image is fully decoded, then fades it
// in — the image is never shown half-loaded. Falls back to an icon on error.
const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  width,
  className,
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const url = ikThumb(src, width);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    setStatus(url ? "loading" : "error");
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setStatus("loaded");
    }
  }, [url]);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {status !== "loaded" && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      )}
      {status === "error" ? (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <ImageOff className="h-4 w-4" />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            status === "loaded" ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
};

export default ImageWithSkeleton;
