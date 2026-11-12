import { Skin } from '../types/game';

export const SKINS: Skin[] = [
  {
    id: 'classic',
    name: 'Classic Stiphan',
    arabicName: 'ستيفان الكلاسيكي',
    description: 'The legendary yellow pixel hero.',
    price: 0,
    bodyColor: '#ffd700',
    eyeColor: '#111111',
    accessory: 'none',
    unlockedByDefault: true
  },
  {
    id: 'tarboosh',
    name: 'Moroccan Fez',
    arabicName: 'ستيفان بالطربوش المغربي',
    description: 'Authentic red Tarboosh with black tassel.',
    price: 60,
    bodyColor: '#ffd700',
    eyeColor: '#111111',
    accessory: 'tarboosh'
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    arabicName: 'النينجا الغامض',
    description: 'Master of stealth jumps and quick dodges.',
    price: 120,
    bodyColor: '#2b2d42',
    eyeColor: '#ef233c',
    accessory: 'ninja'
  },
  {
    id: 'sunglasses',
    name: 'Cool Troll',
    arabicName: 'الترول الواعر',
    description: 'Too cool to care about spikes.',
    price: 180,
    bodyColor: '#06d6a0',
    eyeColor: '#073b4c',
    accessory: 'sunglasses'
  },
  {
    id: 'crown',
    name: 'King Stiphan',
    arabicName: 'الملك ستيفان',
    description: 'Royalty among troll platformers.',
    price: 250,
    bodyColor: '#f77f00',
    eyeColor: '#003049',
    accessory: 'crown'
  },
  {
    id: 'devil_horns',
    name: 'Evil Troll',
    arabicName: 'الترول الشرير',
    description: 'Became the very monster that set the traps.',
    price: 400,
    bodyColor: '#d90429',
    eyeColor: '#ffffff',
    accessory: 'devil_horns'
  }
];

export function getSkin(id: string): Skin {
  const found = SKINS.find((s) => s.id === id);
  return found || SKINS[0];
}
