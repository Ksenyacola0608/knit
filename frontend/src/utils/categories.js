export const categories = [
  { value: '', label: 'Все категории' },
  { value: 'knitting', label: 'Вязание' },
  { value: 'embroidery', label: 'Вышивка' },
  { value: 'sewing', label: 'Шитьё' },
  { value: 'felting', label: 'Валяние из шерсти' },
  { value: 'jewelry', label: 'Украшения' },
  { value: 'pottery', label: 'Керамика' },
  { value: 'woodworking', label: 'Столярное дело' },
  { value: 'painting', label: 'Живопись' },
  { value: 'soap_making', label: 'Мыловарение' },
  { value: 'other', label: 'Другое' }
];

export const getCategoryLabel = (value) => {
  const cat = categories.find(c => c.value === value);
  return cat ? cat.label : value;
};
