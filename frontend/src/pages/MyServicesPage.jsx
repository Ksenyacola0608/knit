import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

const MyServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'master' && user.role !== 'admin') {
      toast.error('Доступ запрещен');
      navigate('/');
      return;
    }
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/master/${user.id}`);
      setServices(response.data.services);
    } catch (error) {
      toast.error('Ошибка загрузки услуг');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить услугу "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/services/${serviceId}`);
      toast.success('Услуга удалена');
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка удаления услуги');
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Мои услуги</h1>
            <p className="text-gray-600">Управляйте своими услугами</p>
          </div>
          <Link
            to="/my-services/create"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            <Plus size={20} />
            Создать услугу
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-2">У вас пока нет услуг</p>
            <p className="text-gray-500 mb-6">Создайте свою первую услугу</p>
            <Link
              to="/my-services/create"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              Создать услугу
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-6xl">🎨</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {getCategoryLabel(service.category)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye size={16} />
                      {service.views || 0}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-indigo-600">
                      {service.price.toLocaleString()} ₽
                    </p>
                    {service.duration_days && (
                      <p className="text-sm text-gray-500">
                        Срок: {service.duration_days} дн.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Package size={16} />
                    <span>Заказов: {service.orders_count || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/services/${service.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Eye size={16} />
                      Просмотр
                    </Link>
                    <Link
                      to={`/my-services/edit/${service.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Edit size={16} />
                      Редакт
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id, service.title)}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServicesPage;