import React from 'react';
import {
  HeartHandshake,
  Dumbbell,
  ChefHat,
  Cross,
  GraduationCap,
  Baby,
  Activity,
  Sparkles,
  Briefcase,
  Wrench,
  Stethoscope,
  Utensils,
  BookOpen,
  Heart,
  UserCheck,
  Smile,
  Scissors,
  Camera,
  Laptop,
  Paintbrush,
  Truck,
  Home,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  icon?: string | null;
  className?: string;
}

const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartHandshake,
  Dumbbell,
  ChefHat,
  Cross,
  GraduationCap,
  Baby,
  Activity,
  Sparkles,
  Briefcase,
  Wrench,
  Stethoscope,
  Utensils,
  BookOpen,
  Heart,
  UserCheck,
  Smile,
  Scissors,
  Camera,
  Laptop,
  Paintbrush,
  Truck,
  Home,
  HelpCircle,
};

// Check if string is an emoji
const isEmoji = (str: string) => {
  if (!str) return false;
  return /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(str);
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  className = 'w-4 h-4',
}) => {
  if (!icon) {
    return <Briefcase className={className} />;
  }

  const trimmed = icon.trim();

  // If it's an emoji, render as text element
  if (isEmoji(trimmed)) {
    return <span className="inline-flex items-center justify-center leading-none select-none">{trimmed}</span>;
  }

  // Normalize key (case-insensitive lookup or exact match)
  const exactComponent = iconComponentMap[trimmed];
  if (exactComponent) {
    const Component = exactComponent;
    return <Component className={className} />;
  }

  const lowerKey = trimmed.toLowerCase();
  const matchedKey = Object.keys(iconComponentMap).find(
    (k) => k.toLowerCase() === lowerKey
  );

  if (matchedKey) {
    const Component = iconComponentMap[matchedKey];
    return <Component className={className} />;
  }

  // Fallback icon
  return <Briefcase className={className} />;
};

export default CategoryIcon;
