import { Star, ThumbsUp } from 'lucide-react';
import type { Review } from '@/pages/Home';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">{review.author}</span>
            <span className="text-xs text-muted">{review.date}</span>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
            <span className="text-xs font-bold text-foreground ml-1">{review.rating}.0</span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <p className="text-sm text-foreground mb-2 line-clamp-2">{review.text}</p>

      {/* Helpful Count */}
      <div className="flex items-center gap-1 text-xs text-muted">
        <ThumbsUp className="w-3 h-3" />
        <span>{review.helpful} found helpful</span>
      </div>
    </div>
  );
}
