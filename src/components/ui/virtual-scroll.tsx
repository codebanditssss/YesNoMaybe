import { useState, useRef, useCallback, useMemo } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  bufferSize?: number;
  className?: string;
}

export function VirtualScroll<T>({ 
  items, 
  renderItem, 
  itemHeight, 
  containerHeight, 
  bufferSize = 5,
  className = ""
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItems + bufferSize * 2);
  
  const visibleData = useMemo(() => 
    items.slice(startIndex, endIndex + 1), 
    [items, startIndex, endIndex]
  );
  
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className={`relative ${className}`}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleData.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
} 