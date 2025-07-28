
import React from 'react';
import { Member } from '@/context/CollageContext';
import { cn } from '@/lib/utils';

interface SquareGridProps {
  memberCount: number;
  members: Member[];
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

export const SquareGrid: React.FC<SquareGridProps> = ({ 
  memberCount, 
  members, 
  size 
}) => {
  const sizeConfig = {
    small: { container: 'w-32 h-32', regular: 20, center: 40, gap: 2 },
    medium: { container: 'w-48 h-48', regular: 28, center: 56, gap: 3 },
    large: { container: 'w-64 h-64', regular: 36, center: 72, gap: 4 },
    xlarge: { container: 'w-96 h-96', regular: 48, center: 96, gap: 6 }
  };

  const config = sizeConfig[size];
  const centerIndex = Math.floor(memberCount / 2);

  // Calculate grid dimensions
  const gridSize = Math.ceil(Math.sqrt(memberCount));
  const centerRow = Math.floor(gridSize / 2);
  const centerCol = Math.floor(gridSize / 2);

  // Generate grid positions
  const generateGridPositions = () => {
    const positions = [];
    let memberIndex = 0;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (memberIndex >= memberCount) break;
        
        const isCenter = row === centerRow && col === centerCol;
        const actualIndex = isCenter ? centerIndex : (memberIndex >= centerIndex ? memberIndex : memberIndex);
        
        if (isCenter || actualIndex !== centerIndex) {
          positions.push({
            index: actualIndex,
            member: members[actualIndex],
            isCenter,
            row,
            col,
            x: col * (config.regular + config.gap),
            y: row * (config.regular + config.gap)
          });
        }
        
        memberIndex++;
      }
    }

    return positions;
  };

  const positions = generateGridPositions();

  return (
    <div className={cn("relative flex items-center justify-center p-4", config.container)}>
      <div className="relative" style={{ 
        width: gridSize * (config.regular + config.gap) - config.gap,
        height: gridSize * (config.regular + config.gap) - config.gap
      }}>
        {positions.map((pos, index) => (
          <div
            key={index}
            className={cn(
              "absolute border-2 border-dashed flex items-center justify-center overflow-hidden",
              pos.member ? "border-purple-400 bg-purple-50" : "border-gray-300 bg-gray-50"
            )}
            style={{
              left: pos.x,
              top: pos.y,
              width: pos.isCenter ? config.center : config.regular,
              height: pos.isCenter ? config.center : config.regular,
              borderRadius: '8px'
            }}
          >
            {pos.member ? (
              <img
                src={pos.member.photo}
                alt={pos.member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={cn(
                "text-gray-400 font-medium",
                pos.isCenter ? "text-sm" : "text-xs"
              )}>
                {pos.index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
