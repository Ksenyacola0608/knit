import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, filter, roleFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status_filter = filter;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const response = await api.get('/orders', { params });
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Ошибка загрузки заказов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} /> },
      'accepted': { label: 'Принят', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={16} /> },
      'rejected': { label: 'Отклонен', color: 'bg-red-100 text-red-800', icon: <XCircle size={16} /> },
      'in_progress': { label: 'В работе', color: 'bg-indigo-100 text-indigo-800', icon: <AlertCircle size={16} /> },
      'completed': { label: 'Завершен', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} /> },
      'cancelled': { label: 'Отменен', color: 'bg-gray-100 text-gray-800', icon: <XCircle size={16} /> }
    };
    const badge = badges[status] || badges['pending'];
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Мои заказы</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидание</option>
                <option value="accepted">Принят</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершен</option>
                <option value="rejected">Отклонен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Все заказы</option>
                <option value="customer">Я заказчик</option>
                <option value="master">Я мастер</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Загрузка заказов...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Заказы не найдены</p>
            <p className="text-gray-500 mt-2">Попробуйте изменить фильтры</p>
            <Link
              to="/services"
              className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Просмотреть услуги
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(order.status)}
                        <span className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {order.service?.title || 'Услуга'}
                      </h3>
                    </div>
                    {order.service?.price && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          {order.service.price.toLocaleString()} ₽
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {order.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {order.master && order.customer_id === user.id && (
                        <div>
                          <span className="font-semibold">Мастер:</span> {order.master.name}
                        </div>
                      )}
                      {order.customer && order.master_id === user.id && (
                        <div>
                          <span className="font-semibold">Заказчик:</span> {order.customer.name}
                        </div>
                      )}
                    </div>
                    <span className="text-indigo-600 font-semibold hover:text-indigo-700">
                      Подробнее →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;