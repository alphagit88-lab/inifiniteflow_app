import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    image: string;
    kcal: number;
    rating: number;
    category: string;
  };
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <Link href={`/meals/${meal.id}`}>
      <Card className="p-0 hover:shadow-lg transition overflow-hidden cursor-pointer">
        <img src={meal.image} alt={meal.name} className="w-full h-40 object-cover" />
        <div className="p-4">
          <div className="font-semibold text-base text-gray-800 mb-1">{meal.name}</div>
          <div className="flex gap-1 text-xs text-gray-500 items-center">
            <span>🍽️ {meal.category}</span>
            <span>•</span>
            <span>🔥 {meal.kcal} kcal</span>
            <span>•</span>
            <span>⭐ {meal.rating}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

