import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageSquare, User, LogOut, Package } from 'lucide-react';
import api from '../../utils/api';

const Header = () => {
  const { user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
    }
  }, [user]);

  const fetchUnreadCounts = async () => {
    try {
      const notifResp = await api.get('/notifications?unread_only=true&limit=1');
      setUnreadNotifications(notifResp.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">HandyCraft</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="text-gray-700 hover:text-indigo-600 transition">
              Каталог
            </Link>
            {user && (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-indigo-600 transition">
                  Заказы
                </Link>
                {(user.role === 'master' || user.role === 'admin') && (
                  <Link to="/my-services" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
                    <Package size={18} />
                    Мои услуги
                  </Link>
                )}
                <Link to="/notifications" className="relative text-gray-700 hover:text-indigo-600 transition">
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 transition font-semibold">
                    👑 Админ
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  data-testid="profile-link"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <User size={20} />
                  <span className="hidden md:block">{user.name}</span>
                </Link>
                <button
                  data-testid="logout-button"
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  data-testid="login-link"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  data-testid="register-link"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
