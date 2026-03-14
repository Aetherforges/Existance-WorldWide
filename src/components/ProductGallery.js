"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { resolveImageUrl } from "../lib/format";

export default function ProductGallery({ images = [] }) {
  const [active, setActive] = useState(images[0]);

  useEffect(() => {
    if (images.length > 0) {
      setActive(images[0]);
    }
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <span className="text-white/50">No image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Image
        src={resolveImageUrl(active)}
        alt="Product view"
        width={720}
        height={520}
        quality={75}
        className="h-72 w-full rounded-2xl border border-white/10 object-cover"
      />
      <div className="flex gap-3">
        {images.slice(0, 5).map((image) => (
          <button
            key={image}
            type="button"
            className={`h-14 w-14 overflow-hidden rounded-xl border ${
              active === image ? "border-white" : "border-white/10"
            }`}
            onClick={() => setActive(image)}
          >
            <Image
              src={resolveImageUrl(image)}
              alt="Thumbnail"
              width={112}
              height={112}
              quality={60}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
