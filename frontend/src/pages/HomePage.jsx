import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Package, Star } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Найдите мастера ручного труда
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100">
            Уникальные изделия от талантливых мастеров
          </p>
          <Link
            to="/services"
            data-testid="browse-services-button"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
          >
            Смотреть каталог услуг
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Найдите услугу</h3>
              <p className="text-gray-600">Просмотрите каталог услуг мастеров ручного труда</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Оформите заказ</h3>
              <p className="text-gray-600">Опишите что вам нужно и отправьте заказ мастеру</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Получите результат</h3>
              <p className="text-gray-600">Получите готовое изделие и оставьте отзыв</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Вы мастер?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Зарегистрируйтесь и начните получать заказы уже сегодня
          </p>
          <Link
            to="/register"
            data-testid="register-as-master-button"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Зарегистрироваться как мастер
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
