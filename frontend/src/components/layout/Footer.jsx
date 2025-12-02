import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HandyCraft</h3>
            <p className="text-gray-400">
              Платформа для заказа услуг ручного труда
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Разделы</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition">
                  Каталог услуг
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white transition">
                  Мои заказы
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <p className="text-gray-400">info@handycraft.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 HandyCraft. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
