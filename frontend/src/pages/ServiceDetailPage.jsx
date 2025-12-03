import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Eye, Package, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDescription, setOrderDescription] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      setService(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки услуги');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Для заказа необходимо войти в систему');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/orders', {
        service_id: service.id,
        description: orderDescription,
        customer_notes: orderNotes
      });
      toast.success('Заказ успешно создан! Мастер скоро свяжется с вами.');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка создания заказа');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (value) => {
    const categories = {
      'knitting': 'Вязание',
      'embroidery': 'Вышивка',
      'sewing': 'Шитьё',
      'crochet': 'Крючок',
      'jewelry': 'Украшения',
      'pottery': 'Керамика',
      'woodworking': 'Столярное дело',
      'painting': 'Живопись',
      'soap_making': 'Мыловарение',
      'other': 'Другое'
    };
    return categories[value] || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/services"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Назад к каталогу
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Service Image */}
              <div className="h-96 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-9xl">🎨</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                    {getCategoryLabel(service.category)}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Eye size={16} className="mr-1" />
                    {service.views} просмотров
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h1>

                <div className="flex items-center gap-6 mb-6 text-gray-600">
                  {service.duration_days && (
                    <div className="flex items-center">
                      <Clock size={20} className="mr-2" />
                      <span>Срок выполнения: {service.duration_days} дней</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Package size={20} className="mr-2" />
                    <span>Заказов: {service.orders_count || 0}</span>
                  </div>
                </div>

                <div className="prose max-w-none mb-8">
                  <h3 className="text-xl font-semibold mb-3">Описание</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Master Info */}
            {service.master && (
              <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                <h3 className="text-2xl font-bold mb-6">О мастере</h3>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {service.master.avatar ? (
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${service.master.avatar}`}
                        alt={service.master.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {service.master.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/masters/${service.master.id}`}
                      className="text-2xl font-bold text-gray-900 hover:text-indigo-600"
                    >
                      {service.master.name}
                    </Link>
                    {service.master.rating > 0 && (
                      <Link
                        to={`/masters/${service.master.id}/reviews`}
                        className="text-lg text-indigo-600 hover:text-indigo-700 mt-1 inline-block"
                      >
                        ⭐ {service.master.rating.toFixed(1)} ({service.master.total_reviews} отзывов)
                      </Link>
                    )}
                    <p className="text-gray-600 mt-1">
                      Выполнено заказов: {service.master.completed_orders}
                    </p>
                    {service.master.bio && (
                      <p className="text-gray-700 mt-4 leading-relaxed">
                        {service.master.bio}
                      </p>
                    )}
                    {service.master.specializations && service.master.specializations.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-gray-700 mb-2">Специализации:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.master.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-4xl font-bold text-indigo-600 mb-6">
                {service.price.toLocaleString()} ₽
              </div>

              {!showOrderForm ? (
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Для заказа необходимо войти');
                      navigate('/login');
                      return;
                    }
                    if (user.role === 'master' && user.id === service.master_id) {
                      toast.error('Вы не можете заказать свою услугу');
                      return;
                    }
                    setShowOrderForm(true);
                  }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg"
                >
                  Заказать услугу
                </button>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание задачи *
                    </label>
                    <textarea
                      required
                      value={orderDescription}
                      onChange={(e) => setOrderDescription(e.target.value)}
                      rows={4}
                      placeholder="Опишите, что вам нужно..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные пожелания
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      placeholder="Укажите детали, пожелания..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock size={18} className="mr-3 text-gray-400" />
                  <span>Ответ в течение 24 часов</span>
                </div>
                <div className="flex items-center">
                  <Package size={18} className="mr-3 text-gray-400" />
                  <span>Гарантия качества работы</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;