import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
}

export default function StatsCard({ title, value, change, icon: Icon, gradient }: StatsCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${gradient} rounded-lg shadow-md`}>
            <Icon className="text-white text-xl" size={24} />
          </div>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            change.startsWith('+') 
              ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30' 
              : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
          }`}>{change}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-gray-600 dark:text-gray-100">{title}</p>
      </CardContent>
    </Card>
  );
}
