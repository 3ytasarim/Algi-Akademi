import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardList,
  Calendar,
  Download,
  Filter,
  Search
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ExamResults() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
      {/* Coming Soon Animation */}
      <div className="text-center">
        <div className="inline-block relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-700/20 rounded-2xl blur-xl animate-pulse"></div>
          
          {/* Main Content */}
          <div className="relative bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-red-500/30 rounded-2xl p-12 shadow-2xl">
            {/* Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <ClipboardList className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-4 animate-pulse">
              Sınav Sonuçları
            </h1>
            
            {/* Coming Soon Text */}
            <div className="mb-6">
              <span className="text-6xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-pulse">
                ÇOK YAKINDA
              </span>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Gelişmiş sınav sonuçları modülü hazırlanıyor. Detaylı raporlar ve analitik veriler çok yakında burada olacak.
            </p>
            
            {/* Loading Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce delay-150"></div>
              <div className="w-3 h-3 bg-red-700 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
