import React, { useRef } from 'react';
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryScrollProps } from '../../utils/interfaces/interfaces';

const CategoryScroll: React.FC<CategoryScrollProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null); // Explicitly define the ref type

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <Button
        isIconOnly
        variant="flat"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-md hover:shadow-lg transition-all duration-200 
                 hidden sm:flex items-center justify-center
                 w-8 h-8 sm:w-10 sm:h-10"
        onPress={() => scroll('left')}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      <div
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto scrollbar-hide scroll-smooth px-4 py-2 
                   sm:px-12 md:px-16 max-w-full"
      >
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "solid" : "light"}
            onPress={() => onCategorySelect(category)}
            className="whitespace-nowrap transition-all duration-200
                     text-xs sm:text-sm md:text-base
                     px-3 py-1 sm:px-4 sm:py-2 md:px-5
                     min-w-[80px] sm:min-w-[100px]
                     hover:scale-105"
          >
            {category}
          </Button>
        ))}
      </div>

      <Button
        isIconOnly
        variant="flat"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-md hover:shadow-lg transition-all duration-200
                 hidden sm:flex items-center justify-center
                 w-8 h-8 sm:w-10 sm:h-10"
        onPress={() => scroll('right')}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
};

export default CategoryScroll;
