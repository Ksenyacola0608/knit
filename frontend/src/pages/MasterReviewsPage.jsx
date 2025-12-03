import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const MasterReviewsPage = () => {
  const { masterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputingReviewId, setDisputingReviewId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [masterId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsResp, masterResp] = await Promise.all([
        api.get(`/reviews/master/${masterId}`),
        api.get(`/users/${masterId}`)
      ]);
      setReviews(reviewsResp.data.reviews);
      setMaster(masterResp.data);
    } catch (error) {
      toast.error('Ошибка загрузки отзывов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async (reviewId) => {
    if (!disputeReason.trim()) {
      toast.error('Укажите причину оспаривания');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/dispute`, {
        reason: disputeReason
      });
      toast.success('Отзыв оспорен. Администрация рассмотрит обращение.');
      setDisputingReviewId(null);
      setDisputeReason('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка оспаривания отзыва');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isMaster = user && user.id === masterId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          to={`/masters/${masterId}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Назад к профилю
        </Link>

        {master && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                {master.avatar ? (
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${master.avatar}`}
                    alt={master.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {master.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{master.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  {renderStars(Math.round(master.rating))}
                  <span className="text-gray-600">
                    {master.rating?.toFixed(1)} ({master.total_reviews} отзывов)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Отзывы ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600">Отзывов пока нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                      {review.customer_avatar ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${review.customer_avatar}`}
                          alt={review.customer_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl font-bold">
                          {review.customer_name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.customer_name}</p>
                      <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {review.comment && (
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                )}

                {review.is_disputed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-yellow-800 mb-2">Отзыв оспорен мастером</p>
                        <p className="text-sm text-yellow-700">
                          Причина: {review.dispute_reason}
                        </p>
                        <p className="text-xs text-yellow-600 mt-2">
                          Администрация рассмотрит обращение
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isMaster && !review.is_disputed && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {disputingReviewId === review.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          rows={3}
                          placeholder="Укажите причину оспаривания отзыва..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          minLength={10}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDisputingReviewId(null);
                              setDisputeReason('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => handleDispute(review.id)}
                            disabled={!disputeReason.trim() || disputeReason.length < 10}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                          >
                            Отправить оспаривание
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDisputingReviewId(review.id)}
                        className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm"
                      >
                        ⚠️ Оспорить отзыв
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterReviewsPage;
