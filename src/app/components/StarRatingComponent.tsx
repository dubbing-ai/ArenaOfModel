import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface StarRatingComponentProps {
  rating: number;
  maxRating?: number;
  onRatingChange: (value: number) => void;
  error?: boolean;
}

const StarRatingComponent: React.FC<StarRatingComponentProps> = ({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  error = false,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [displayRating, setDisplayRating] = useState(rating);

  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleMouseLeave = () => {
    setHoveredRating(0);
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

          {/* Left half (for half-star) */}
          <div
            className="absolute top-0 left-0 w-3 h-6 cursor-pointer overflow-hidden z-10"
            onMouseEnter={() => setHoveredRating(Math.max(1, i - 0.5))}
            onClick={() => onRatingChange(Math.max(1, i - 0.5))}
          >
            {activeRating >= i - 0.5 && (
              <Star size={24} className="text-yellow-400 fill-yellow-400" />
            )}
          </div>

          {/* Right half (for full star) */}
          <div
            className="absolute top-0 right-0 w-3 h-6 cursor-pointer overflow-hidden z-10"
            onMouseEnter={() => setHoveredRating(Math.max(1, i))}
            onClick={() => onRatingChange(Math.max(1, i))}
          >
            {activeRating >= i && (
              <Star
                size={24}
                className="text-yellow-400 fill-yellow-400"
                style={{ marginLeft: "-12px" }}
              />
            )}
          </div>
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
