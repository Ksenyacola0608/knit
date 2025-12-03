import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import AvatarUpload from '../components/AvatarUpload';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    specializations: []
  });
  const [newSpecialization, setNewSpecialization] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      specializations: user.specializations || []
    });
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/users/me', formData);
      updateUser(response.data);
      toast.success('Профиль обновлен');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка обновления профиля');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSpecialization.trim()]
      });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(s => s !== spec)
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="-mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {editing ? (
                  <AvatarUpload 
                    currentAvatar={user.avatar}
                    onUploadSuccess={(avatarUrl) => {
                      updateUser({ ...user, avatar: avatarUrl });
                    }}
                  />
                ) : user.avatar ? (
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${user.avatar}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-6">
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600 mt-1">
                    {user.role === 'master' ? '👨‍🎨 Мастер' : user.role === 'admin' ? '👑 Администратор' : '👤 Клиент'}
                  </p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Edit2 size={18} />
                    Редактировать
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user.name || '',
                          phone: user.phone || '',
                          bio: user.bio || '',
                          specializations: user.specializations || []
                        });
                      }}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                    >
                      <X size={18} />
                      Отмена
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Save size={18} />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              {user.role === 'master' && (
                <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{user.rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-gray-600 mt-1">Рейтинг</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{user.total_reviews || 0}</p>
                    <p className="text-gray-600 mt-1">Отзывов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{user.completed_orders || 0}</p>
                    <p className="text-gray-600 mt-1">Заказов</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Mail size={20} className="mr-3 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                
                {editing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+7 (999) 999-99-99"
                    />
                  </div>
                ) : user.phone ? (
                  <div className="flex items-center text-gray-700">
                    <Phone size={20} className="mr-3 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                ) : null}
              </div>

              {/* Bio */}
              {(editing || user.bio) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">О себе</h3>
                  {editing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Расскажите о себе..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  )}
                </div>
              )}

              {/* Specializations (for masters) */}
              {user.role === 'master' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Специализации</h3>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpecialization}
                          onChange={(e) => setNewSpecialization(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Добавить специализацию"
                        />
                        <button
                          type="button"
                          onClick={addSpecialization}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                        >
                          Добавить
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.specializations.map((spec, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                          >
                            {spec}
                            <button
                              type="button"
                              onClick={() => removeSpecialization(spec)}
                              className="text-indigo-500 hover:text-indigo-700"
                            >
                              <X size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : formData.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Специализации не указаны</p>
                  )}
                </div>
              )}

              {/* Quick Links */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Быстрые ссылки</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Link
                    to="/orders"
                    className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-100 transition"
                  >
                    📦 Мои заказы
                  </Link>
                  {user.role === 'master' && (
                    <Link
                      to="/my-services"
                      className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-100 transition"
                    >
                      🎨 Мои услуги
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-700 px-6 py-3 rounded-lg hover:bg-red-100 transition"
                    >
                      👑 Админ-панель
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;