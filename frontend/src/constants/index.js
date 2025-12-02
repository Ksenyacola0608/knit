export const CATEGORIES = [
  { value: 'knitting', label: 'Вязание' },
  { value: 'embroidery', label: 'Вышивка' },
  { value: 'sewing', label: 'Шитье' },
  { value: 'crochet', label: 'Вязание крючком' },
  { value: 'jewelry', label: 'Ювелирные изделия' },
  { value: 'pottery', label: 'Керамика' },
  { value: 'woodworking', label: 'Работы по дереву' },
  { value: 'painting', label: 'Роспись' },
  { value: 'soap_making', label: 'Мыловарение' },
  { value: 'other', label: 'Другое' }
];

export const ORDER_STATUSES = {
  pending: 'Ожидает подтверждения',
  accepted: 'Принят',
  rejected: 'Отклонен',
  in_progress: 'В работе',
  completed: 'Выполнен',
  cancelled: 'Отменен'
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
};
