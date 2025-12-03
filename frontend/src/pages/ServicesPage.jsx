import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services?limit=50');
      setServices(response.data.services || []);
    } catch (error) {
      toast.error('Ошибка загрузки услуг');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Каталог услуг</h1>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Услуг пока нет. Станьте первым мастером!</p>
          <Link to="/register" className="inline-block mt-4 text-indigo-600 hover:text-indigo-700">
            Зарегистрироваться как мастер
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              data-testid={`service-card-${service.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {service.images && service.images[0] && (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">
                    {service.price} ₽
                  </span>
                  {service.master_rating > 0 && (
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm">{service.master_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
