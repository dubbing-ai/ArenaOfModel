import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { LanguageCode } from "../types/translation";

interface StarRatingComponentProps {
  language?: LanguageCode;
  rating: number;
  maxRating?: number;
  onRatingChange: (value: number) => void;
  error?: boolean;
  stepSize?: 0.5 | 1;
  id: string;
  ariaLabel?: string;
}

const StarRatingComponent: React.FC<StarRatingComponentProps> = ({
  language = "th",
  rating = 0,
  maxRating = 5,
  onRatingChange,
  error = false,
  stepSize = 1,
  id,
  ariaLabel = "Rating",
}) => {
  const [displayRating, setDisplayRating] = useState(rating);

  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleRatingChange = (newRating: number) => {
    // If step size is 1, round to the nearest integer
    const adjustedRating = stepSize === 1 ? Math.round(newRating) : newRating;
    onRatingChange(adjustedRating);

    // Announce the rating change for screen readers
    const announcement = document.getElementById(`${id}-announcement`);
    if (announcement) {
      announcement.textContent =
        language == "en"
          ? `Selected rating: ${adjustedRating} out of ${maxRating}`
          : `เลือกคะแนน: ${adjustedRating} จาก ${maxRating}`;
    }
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
      // Create a container for each star
      stars.push(
        <div key={i} className="relative inline-block w-6 h-6">
          {/* Base empty star */}
          <Star
            size={24}
            className={`absolute top-0 left-0 ${
              displayRating === 0 && error ? "text-red-300" : "text-gray-300"
            }`}
            aria-hidden="true"
          />

          {stepSize === 0.5 ? (
            // Half-star increment mode
            <>
              {/* Left half (for half-star) */}
              <div
                className="absolute top-0 left-0 w-3 h-6 cursor-pointer overflow-hidden z-10"
                onClick={() => handleRatingChange(Math.max(1, i - 0.5))}
                tabIndex={0}
                role="radio"
                aria-checked={displayRating >= i - 0.5}
                aria-label={`${i - 0.5} stars`}
              >
                {displayRating >= i - 0.5 && (
                  <Star
                    size={24}
                    className="text-yellow-400 fill-yellow-400"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Right half (for full star) */}
              <div
                className="absolute top-0 right-0 w-3 h-6 cursor-pointer overflow-hidden z-10"
                onClick={() => handleRatingChange(Math.max(1, i))}
                tabIndex={0}
                role="radio"
                aria-checked={displayRating >= i}
                aria-label={`${i} stars`}
              >
                {displayRating >= i && (
                  <Star
                    size={24}
                    className="text-yellow-400 fill-yellow-400"
                    style={{ marginLeft: "-12px" }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </>
          ) : (
            // Full-star increment mode
            <div
              className="absolute top-0 left-0 w-6 h-6 cursor-pointer z-10"
              onClick={() => handleRatingChange(i)}
              tabIndex={0}
              role="radio"
              aria-checked={displayRating >= i}
              aria-label={`${i} stars`}
            >
              {displayRating >= i && (
                <Star
                  size={24}
                  className="text-yellow-400 fill-yellow-400"
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>
      );
    }

    return stars;
  };

  return (
    <div className="flex flex-col">
      {/* Visible label for screen readers */}
      <div className="flex items-center mb-2">
        <label id={`${id}-label`} className="text-sm text-gray-700 sr-only">
          {ariaLabel}
        </label>
        {/* Live region for screen reader announcements */}
        <div
          id={`${id}-announcement`}
          className="sr-only"
          aria-live="polite"
          role="status"
        >
          {displayRating > 0
            ? `Selected rating: ${displayRating} out of ${maxRating}`
            : "No rating selected"}
        </div>
      </div>

      {/* Star rating for visual users */}
      <div
        className="flex items-center"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
      >
        {renderStars()}
      </div>
    </div>
  );
};

export default StarRatingComponent;
