import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface StarRatingComponentProps {
  rating: number;
  maxRating?: number;
  onRatingChange: (value: number) => void;
  error?: boolean;
  stepSize?: 0.5 | 1;
}

const StarRatingComponent: React.FC<StarRatingComponentProps> = ({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  error = false,
  stepSize = 1,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [displayRating, setDisplayRating] = useState(rating);

  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleRatingChange = (newRating: number) => {
    // If step size is 1, round to the nearest integer
    const adjustedRating = stepSize === 1 ? Math.round(newRating) : newRating;
    onRatingChange(adjustedRating);
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = hoveredRating || displayRating;

    for (let i = 1; i <= maxRating; i++) {
      // Create a container for each star
      stars.push(
        <div key={i} className="relative inline-block w-6 h-6">
          {/* Base empty star */}
          <Star
            size={24}
            className={`absolute top-0 left-0 ${
              hoveredRating === 0 && displayRating === 0 && error
                ? "text-red-300"
                : "text-gray-300"
            }`}
          />

          {stepSize === 0.5 ? (
            // Half-star increment mode
            <>
              {/* Left half (for half-star) */}
              <div
                className="absolute top-0 left-0 w-3 h-6 cursor-pointer overflow-hidden z-10"
                onMouseEnter={() => setHoveredRating(Math.max(1, i - 0.5))}
                onClick={() => handleRatingChange(Math.max(1, i - 0.5))}
              >
                {activeRating >= i - 0.5 && (
                  <Star size={24} className="text-yellow-400 fill-yellow-400" />
                )}
              </div>

              {/* Right half (for full star) */}
              <div
                className="absolute top-0 right-0 w-3 h-6 cursor-pointer overflow-hidden z-10"
                onMouseEnter={() => setHoveredRating(Math.max(1, i))}
                onClick={() => handleRatingChange(Math.max(1, i))}
              >
                {activeRating >= i && (
                  <Star
                    size={24}
                    className="text-yellow-400 fill-yellow-400"
                    style={{ marginLeft: "-12px" }}
                  />
                )}
              </div>
            </>
          ) : (
            // Full-star increment mode
            <div
              className="absolute top-0 left-0 w-6 h-6 cursor-pointer z-10"
              onMouseEnter={() => setHoveredRating(i)}
              onClick={() => handleRatingChange(i)}
            >
              {activeRating >= i && (
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
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
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {renderStars()}
      </div>
    </div>
  );
};

export default StarRatingComponent;
