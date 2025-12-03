import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      toast.error('Ошибка загрузки уведомлений');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      await fetchNotifications();
      // Trigger event to update header counter
      window.dispatchEvent(new Event('notificationRead'));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('Все уведомления отмечены как прочитанные');
      await fetchNotifications();
      // Trigger event to update header counter
      window.dispatchEvent(new Event('notificationRead'));
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'new_order': '📦',
      'order_accepted': '✅',
      'order_rejected': '❌',
      'order_completed': '🎉',
      'new_message': '💬',
      'new_review': '⭐',
      'review_disputed': '⚠️'
    };
    return icons[type] || '🔔';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Уведомления</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600">
                Непрочитанных: <span className="font-semibold text-indigo-600">{unreadCount}</span>
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <CheckCheck size={18} />
              Отметить все как прочитанные
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Bell size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Уведомлений пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition ${
                  !notification.is_read ? 'border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-3">
                        {notification.link && (
                          <Link
                            to={notification.link}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            <Eye size={16} />
                            Посмотреть
                          </Link>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Отметить как прочитанное
                          </button>
                        )}
                      </div>
                    </div>
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

export default NotificationsPage;
