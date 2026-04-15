import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Review } from '@/pages/Home';

interface ReviewFormProps {
  onSubmit: (review: Omit<Review, 'id' | 'helpful' | 'date'>) => void;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author.trim() || !text.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      onSubmit({
        author: author.trim(),
        rating,
        text: text.trim(),
      });
      
      // Reset form
      setAuthor('');
      setText('');
      setRating(5);
      setIsSubmitting(false);
    }, 500);
  };

  const renderStarButtons = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className="transition-transform hover:scale-110"
      >
        <Star
          className={`w-5 h-5 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-red-50 border-2 border-red-200 rounded-lg space-y-3">
      <h4 className="font-bold text-foreground text-sm">Share Your Experience</h4>

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-2">Rating</label>
        <div className="flex items-center gap-2">
          {renderStarButtons()}
          <span className="text-sm font-bold text-foreground ml-2">{rating}.0</span>
        </div>
      </div>

      {/* Author Name */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">Your Name</label>
        <Input
          type="text"
          placeholder="Enter your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border-2 border-red-300 text-sm"
          disabled={isSubmitting}
        />
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">Your Review</label>
        <textarea
          placeholder="Share your dining experience..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border-2 border-red-300 rounded-lg text-sm resize-none focus:outline-none focus:border-primary"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>Submitting...</>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
}
