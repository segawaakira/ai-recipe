"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({ rating, onRate, disabled }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hovered ? star <= hovered : star <= (rating ?? 0);
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className="p-0.5 transition-colors disabled:cursor-default"
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onRate(star)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
