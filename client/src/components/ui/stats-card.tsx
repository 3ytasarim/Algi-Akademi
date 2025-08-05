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
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${gradient} rounded-lg`}>
            <Icon className="text-white text-xl" size={24} />
          </div>
          <span className="text-sm text-green-600 font-medium">{change}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600">{title}</p>
      </CardContent>
    </Card>
  );
}
