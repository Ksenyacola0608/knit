import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

const CreateEditServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'knitting',
    price: '',
    duration_days: '',
  });

  const categories = [
    { value: 'knitting', label: 'Вязание' },
    { value: 'embroidery', label: 'Вышивка' },
    { value: 'sewing', label: 'Шитьё' },
    { value: 'crochet', label: 'Крючок' },
    { value: 'jewelry', label: 'Украшения' },
    { value: 'pottery', label: 'Керамика' },
    { value: 'woodworking', label: 'Столярное дело' },
    { value: 'painting', label: 'Живопись' },
    { value: 'soap_making', label: 'Мыловарение' },
    { value: 'other', label: 'Другое' }
  ];

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

    if (id) {
      fetchService();
    }
  }, [id, user]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      const service = response.data;
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        duration_days: service.duration_days || ''
      });
    } catch (error) {
      toast.error('Ошибка загрузки услуги');
      navigate('/my-services');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null
      };

      if (id) {
        await api.put(`/services/${id}`, data);
        toast.success('Услуга обновлена');
      } else {
        await api.post('/services', data);
        toast.success('Услуга создана');
      }
      navigate('/my-services');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка сохранения услуги');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          to="/my-services"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Назад к услугам
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {id ? 'Редактировать услугу' : 'Создать услугу'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название услуги *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Например: Вязаный шарф ручной работы"
                minLength={5}
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Подробно опишите вашу услугу, материалы, сроки..."
                minLength={20}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Срок выполнения (дней)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="7"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                to="/my-services"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : (id ? 'Сохранить' : 'Создать')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditServicePage;