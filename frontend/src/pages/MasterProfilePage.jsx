import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Star } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const MasterProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [master, setMaster] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterData();
  }, [id]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const [masterResp, servicesResp] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/services/master/${id}`)
      ]);
      setMaster(masterResp.data);
      setServices(servicesResp.data.services || []);
    } catch (error) {
      toast.error('Ошибка загрузки профиля');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!master) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          to="/services"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Назад к каталогу
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="-mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {master.avatar ? (
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${master.avatar}`}
                    alt={master.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                    {master.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{master.name}</h1>
                <p className="text-gray-600 mt-1">👨‍🎨 Мастер</p>
              </div>

              {/* Stats */}
              {master.role === 'master' && (
                <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{master.rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-gray-600 mt-1">Рейтинг</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{master.total_reviews || 0}</p>
                    <p className="text-gray-600 mt-1">Отзывов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{master.completed_orders || 0}</p>
                    <p className="text-gray-600 mt-1">Заказов</p>
                  </div>
                </div>
              )}

              {/* Bio */}
              {master.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">О мастере</h3>
                  <p className="text-gray-700 leading-relaxed">{master.bio}</p>
                </div>
              )}

              {/* Specializations */}
              {master.specializations && master.specializations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Специализации</h3>
                  <div className="flex flex-wrap gap-2">
                    {master.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Link */}
              {master.total_reviews > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <Link
                    to={`/masters/${id}/reviews`}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                  >
                    ⭐ Посмотреть отзывы ({master.total_reviews})
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Услуги мастера ({services.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {service.images && service.images.length > 0 ? (
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${service.images[0]}`}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-6xl">🎨</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-indigo-600">
                        {service.price.toLocaleString()} ₽
                      </p>
                      {service.duration_days && (
                        <p className="text-sm text-gray-500">
                          {service.duration_days} дн.
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterProfilePage;
