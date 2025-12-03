import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const ReviewForm = ({ order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Пожалуйста, поставьте оценку');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reviews', {
        order_id: order.id,
        rating,
        comment: comment.trim() || null
      });

      toast.success('Отзыв успешно отправлен!');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка отправки отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Оставьте отзыв</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Оценка *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition transform hover:scale-110"
            >
              <Star
                size={36}
                className={
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-4 text-lg font-semibold text-gray-700">
              {rating === 5 && '⭐ Отлично!'}
              {rating === 4 && '😊 Хорошо'}
              {rating === 3 && '😐 Нормально'}
              {rating === 2 && '😕 Плохо'}
              {rating === 1 && '😞 Ужасно'}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Комментарий (необязательно)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Расскажите о своем опыте работы с мастером..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  );
};

export default ReviewForm;
