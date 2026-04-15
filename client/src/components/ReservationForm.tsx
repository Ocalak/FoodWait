import { useState } from 'react';
import { Calendar, Clock, Users, Phone, Mail, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface ReservationFormProps {
  restaurantName: string;
  restaurantId: string;
  onSubmit: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  onClose: () => void;
}

export default function ReservationForm({
  restaurantName,
  restaurantId,
  onSubmit,
  onClose,
}: ReservationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !date || !time || !guests) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      onSubmit({
        restaurantId,
        restaurantName,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date,
        time,
        guests: parseInt(guests),
        specialRequests: specialRequests.trim() || undefined,
      });

      setSubmitted(true);
      setIsSubmitting(false);

      // Close form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center border-2 border-black">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reservation Confirmed!</h2>
          <p className="text-muted mb-4">
            Your table at <strong>{restaurantName}</strong> has been reserved for{' '}
            <strong>{guests} guests</strong> on <strong>{date}</strong> at <strong>{time}</strong>.
          </p>
          <p className="text-sm text-muted">
            A confirmation email has been sent to <strong>{email}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-red-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Reserve a Table</h2>
            <p className="text-sm opacity-90">{restaurantName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Name *
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-black text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Email *
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-black text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-2 border-black text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-2 border-black text-sm"
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time *
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-2 border-black text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Number of Guests *
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm focus:outline-none focus:border-primary"
              disabled={isSubmitting}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              placeholder="e.g., Window seat, high chair needed, dietary restrictions..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm resize-none focus:outline-none focus:border-primary"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Confirm Reservation
              </>
            )}
          </Button>

          <p className="text-xs text-muted text-center">
            You'll receive a confirmation email with your reservation details
          </p>
        </form>
      </div>
    </div>
  );
}
