import {
  Utensils,
  Home,
  Car,
  Zap,
  Repeat,
  Film,
  HeartPulse,
  ShoppingBag,
  Briefcase,
  Laptop,
  Tag,
  Coffee,
  Plane,
  Gift,
  BookOpen,
} from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  className?: string;
}

export const CATEGORY_ICON_OPTIONS = [
  { id: 'utensils', label: 'Dining' },
  { id: 'home', label: 'Home' },
  { id: 'car', label: 'Transport' },
  { id: 'zap', label: 'Utilities' },
  { id: 'repeat', label: 'Subscriptions' },
  { id: 'film', label: 'Entertainment' },
  { id: 'heart-pulse', label: 'Health' },
  { id: 'shopping-bag', label: 'Shopping' },
  { id: 'briefcase', label: 'Work' },
  { id: 'laptop', label: 'Freelance' },
  { id: 'coffee', label: 'Cafe' },
  { id: 'plane', label: 'Travel' },
  { id: 'gift', label: 'Gifts' },
  { id: 'book', label: 'Education' },
  { id: 'tag', label: 'Other' },
];

export function CategoryIcon({ icon, className = 'h-4 w-4' }: CategoryIconProps) {
  switch (icon) {
    case 'utensils':
      return <Utensils className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'repeat':
      return <Repeat className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'heart-pulse':
      return <HeartPulse className={className} />;
    case 'shopping-bag':
      return <ShoppingBag className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'plane':
      return <Plane className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    default:
      return <Tag className={className} />;
  }
}
