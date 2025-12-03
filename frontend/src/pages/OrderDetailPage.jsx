import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Package, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import ReviewForm from '../components/ReviewForm';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hasReview, setHasReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, user]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
      setNewStatus(response.data.status);
      setAgreedPrice(response.data.agreed_price || '');
      if (response.data.deadline) {
        setDeadline(new Date(response.data.deadline).toISOString().split('T')[0]);
      }
      
      // Check if review exists
      if (response.data.status === 'completed' && user.id === response.data.customer_id) {
        try {
          const reviewResp = await api.get(`/reviews/order/${id}`);
          setHasReview(reviewResp.data.review !== null);
        } catch (error) {
          setHasReview(false);
        }
      }
    } catch (error) {
      toast.error('Ошибка загрузки заказа');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const updateData = { status: newStatus };
      if (agreedPrice) updateData.agreed_price = parseFloat(agreedPrice);
      if (deadline) updateData.deadline = new Date(deadline).toISOString();
      
      await api.patch(`/orders/${id}/status`, updateData);
      toast.success('Статус заказа обновлен');
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка обновления статуса');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Ожидание',
      'accepted': 'Принят',
      'rejected': 'Отклонен',
      'in_progress': 'В работе',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) return null;

  const isMaster = user.id === order.master_id;
  const isCustomer = user.id === order.customer_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          to="/orders"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Назад к заказам
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {order.service?.title || 'Заказ'}
                </h1>
                <p className="text-indigo-100">
                  Создан: {formatDate(order.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">
                  {(order.agreed_price || order.service?.price || 0).toLocaleString()} ₽
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Статус</h3>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-indigo-600">
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание задачи</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {order.description}
              </p>
            </div>

            {/* Customer Notes */}
            {order.customer_notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Дополнительные пожелания</h3>
                <p className="text-gray-700 leading-relaxed">
                  {order.customer_notes}
                </p>
              </div>
            )}

            {/* Participants */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer */}
              {order.customer && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <User size={20} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-900">Заказчик</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {order.customer.avatar ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${order.customer.avatar}`}
                          alt={order.customer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {order.customer.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900">{order.customer.name}</p>
                  </div>
                </div>
              )}

              {/* Master */}
              {order.master && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Package size={20} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-900">Мастер</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {order.master.avatar ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${order.master.avatar}`}
                          alt={order.master.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {order.master.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/masters/${order.master.id}`}
                        className="text-lg font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        {order.master.name}
                      </Link>
                      {order.master.rating > 0 && (
                        <p className="text-sm text-gray-600">
                          ⭐ {order.master.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deadline */}
            {order.deadline && (
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <span className="font-semibold">Срок выполнения:</span> {formatDate(order.deadline)}
                </div>
              </div>
            )}

            {/* Master Controls */}
            {isMaster && order.status !== 'completed' && order.status !== 'rejected' && order.status !== 'cancelled' && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Управление заказом</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="pending">Ожидание</option>
                      <option value="accepted">Принять</option>
                      <option value="rejected">Отклонить</option>
                      <option value="in_progress">В работе</option>
                      <option value="completed">Завершить</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Согласованная цена (₽)
                      </label>
                      <input
                        type="number"
                        value={agreedPrice}
                        onChange={(e) => setAgreedPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={order.service?.price}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Срок выполнения
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {updating ? 'Обновление...' : 'Обновить заказ'}
                  </button>
                </div>
              </div>
            )}

            {/* Completed info */}
            {order.status === 'completed' && order.completed_at && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">
                  ✅ Заказ завершен: {formatDate(order.completed_at)}
                </p>
              </div>
            )}

            {/* Review Section - только для клиента после завершения заказа */}
            {isCustomer && order.status === 'completed' && (
              <div className="pt-6 border-t border-gray-200">
                {hasReview ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      ✅ Вы уже оставили отзыв на этот заказ
                    </p>
                  </div>
                ) : showReviewForm ? (
                  <ReviewForm 
                    order={order}
                    onReviewSubmitted={() => {
                      setHasReview(true);
                      setShowReviewForm(false);
                      toast.success('Спасибо за отзыв!');
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
                  >
                    ⭐ Оставить отзыв мастеру
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;