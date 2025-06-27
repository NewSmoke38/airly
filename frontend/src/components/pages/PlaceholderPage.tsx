import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientColors: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  icon: Icon,
  gradientColors
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-16">
        <div className={`w-20 h-20 ${gradientColors} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{description}</p>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
          <p className="text-gray-500 mb-4">This feature is coming soon!</p>
          <p className="text-sm text-gray-400">
            We're working hard to bring you this functionality. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
}; 