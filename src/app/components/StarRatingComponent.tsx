import React from 'react'
import { Star } from 'lucide-react';

interface StarRatingComponentProps {
  rating: number;
  maxRating?: number;
  onRatingChange: (value: number) => void;
  error?: boolean;
}


const StarRatingComponent: React.FC<StarRatingComponentProps> = ({ rating, maxRating = 5, onRatingChange, error }) => {
    return (
      <div className="flex space-x-1">
        {[...Array(maxRating)].map((_, i) => (
          <button
            key={i}
            onClick={() => onRatingChange(i + 1)}
            className="focus:outline-none"
            aria-label={`Rate ${i + 1} of ${maxRating}`}
          >
            <Star
              size={24}
              className={`${
                rating > 0 ? i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300' : error ? 'text-red-300' : 'text-gray-300'
              } cursor-pointer`}
            />
          </button>
        ))}
      </div>
    );
  };

export default StarRatingComponent