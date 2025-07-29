
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
  size,
}) => {
  const sizeConfig = {
    small: { container: 'w-32 h-32', regular: 20, center: 40, gap: 2 },
    medium: { container: 'w-48 h-48', regular: 28, center: 56, gap: 3 },
    large: { container: 'w-64 h-64', regular: 36, center: 72, gap: 4 },
    xlarge: { container: 'w-96 h-96', regular: 48, center: 96, gap: 6 },
  };

  const config = sizeConfig[size];

  const generateGridPositions = () => {
    // Calculate grid size to accommodate all members plus center cell
    const gridSize = Math.ceil(Math.sqrt(memberCount + 3)); // +3 for the 2x2 center area
    const centerRow = Math.floor(gridSize / 2);
    const centerCol = Math.floor(gridSize / 2);

    // Track occupied cells
    const occupied = new Set<string>();
    
    // Reserve 2x2 center area
    occupied.add(`${centerRow},${centerCol}`);
    occupied.add(`${centerRow},${centerCol + 1}`);
    occupied.add(`${centerRow + 1},${centerCol}`);
    occupied.add(`${centerRow + 1},${centerCol + 1}`);

    const positions: {
      index: number;
      member: Member | null;
      isCenter: boolean;
      row: number;
      col: number;
    }[] = [];

    let memberIndex = 0;

    // Place center member (spans 2x2)
    positions.push({
      index: 0,
      member: members[memberIndex++] || null,
      isCenter: true,
      row: centerRow,
      col: centerCol,
    });

    // Spiral placement around center
    let currentRow = centerRow - 1;
    let currentCol = centerCol - 1;
    let steps = 1;
    let direction = 0; // 0: right, 1: down, 2: left, 3: up
    const dx = [0, 1, 0, -1]; // right, down, left, up
    const dy = [1, 0, -1, 0];

    while (memberIndex < memberCount) {
      for (let turn = 0; turn < 2 && memberIndex < memberCount; turn++) {
        for (let step = 0; step < steps && memberIndex < memberCount; step++) {
          const cellKey = `${currentRow},${currentCol}`;
          
          // Check if cell is valid and not occupied
          if (
            currentRow >= 0 && 
            currentRow < gridSize && 
            currentCol >= 0 && 
            currentCol < gridSize && 
            !occupied.has(cellKey)
          ) {
            occupied.add(cellKey);
            positions.push({
              index: memberIndex,
              member: members[memberIndex] || null,
              isCenter: false,
              row: currentRow,
              col: currentCol,
            });
            memberIndex++;
          }

          // Move to next position
          currentRow += dx[direction];
          currentCol += dy[direction];
        }
        direction = (direction + 1) % 4;
      }
      steps++;
    }

    return positions;
  };

  const positions = generateGridPositions();

  // Calculate grid bounds
  const maxRow = Math.max(...positions.map(p => p.row));
  const maxCol = Math.max(...positions.map(p => p.col));
  const minRow = Math.min(...positions.map(p => p.row));
  const minCol = Math.min(...positions.map(p => p.col));

  const rowOffset = -minRow;
  const colOffset = -minCol;
  const usedRows = maxRow - minRow + 2; // +1 for the extra row needed for 2x2 center
  const usedCols = maxCol - minCol + 2; // +1 for the extra col needed for 2x2 center

  return (
    <div className={cn('flex items-center justify-center p-4 bg-pink-50', config.container)}>
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${usedCols}, ${config.regular}px)`,
          gridTemplateRows: `repeat(${usedRows}, ${config.regular}px)`,
          gap: `${config.gap}px`,
          position: 'relative',
        }}
      >
        {positions.map((pos, index) => (
          <div
            key={index}
            className={cn(
              'border-2 border-dashed flex items-center justify-center overflow-hidden',
              pos.member ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-gray-50'
            )}
            style={{
              width: pos.isCenter ? config.center : config.regular,
              height: pos.isCenter ? config.center : config.regular,
              borderRadius: '8px',
              gridRow: `${pos.row + rowOffset + 1} / span ${pos.isCenter ? 2 : 1}`,
              gridColumn: `${pos.col + colOffset + 1} / span ${pos.isCenter ? 2 : 1}`,
            }}
          >
            {pos.member ? (
              <img
                src={pos.member.photo}
                alt={pos.member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'text-gray-400 font-medium',
                  pos.isCenter ? 'text-sm' : 'text-xs'
                )}
              >
                {pos.index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
