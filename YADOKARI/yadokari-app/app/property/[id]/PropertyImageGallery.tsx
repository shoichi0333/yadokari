"use client";

import Image from "next/image";
import { useState } from "react";

type PropertyImageGalleryProps = {
  images: string[];
  title: string;
};

export default function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  if (!selectedImage) {
    return <div className="h-64 sm:h-80 rounded-2xl bg-gray-100" />;
  }

  return (
    <div className="space-y-3">
      <div className="relative h-64 sm:h-80 overflow-hidden rounded-2xl">
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`${title}の画像${index + 1}を表示`}
                aria-pressed={isSelected}
                className={`relative h-16 overflow-hidden rounded-lg border transition ${
                  isSelected
                    ? "border-teal-600 ring-2 ring-teal-100"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
