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
    small: { container: 'w-full h-full', regular: 20, center: 40, gap: 2 },
    medium: { container: 'w-full h-full', regular: 28, center: 56, gap: 3 },
    large: { container: 'w-full h-full', regular: 36, center: 72, gap: 4 },
    xlarge: { container: 'w-full h-full', regular: 48, center: 96, gap: 6 },
  };

  const config = sizeConfig[size];

  // Dynamically calculate grid size
  const gridSize = Math.ceil(Math.sqrt(memberCount));

  const cellStyle = (isCenter: boolean) => ({
    width: isCenter ? config.center : config.regular,
    height: isCenter ? config.center : config.regular,
    borderRadius: '8px',
  });

  const generateGridPositions = () => {
    const centerRow = Math.floor(gridSize / 2);
    const centerCol = Math.floor(gridSize / 2);

    const positions: {
      index: number;
      member: Member | null;
      isCenter: boolean;
      row: number;
      col: number;
    }[] = [];

    let memberIndex = 0;

    // Center
    positions.push({
      index: 0,
      member: members[memberIndex++] || null,
      isCenter: true,
      row: centerRow,
      col: centerCol,
    });

    // Predefined spiral positions with gaps around center
    const spiralPositions = [
      // Top row (with gap)
      { row: centerRow - 1, col: centerCol + 0 },
      { row: centerRow - 1, col: centerCol + 1 },
      { row: centerRow - 1, col: centerCol + 2 },
      
      // Right column (with gap)
      { row: centerRow + 0, col: centerCol + 2 },
      { row: centerRow + 1, col: centerCol + 2 },
      { row: centerRow + 2, col: centerCol + 2 },
      
      // Bottom row (with gap)
      { row: centerRow + 2, col: centerCol + 1 },
      { row: centerRow + 2, col: centerCol - 0 },
      { row: centerRow + 2, col: centerCol - 1 },
      
      // Left column (with gap)
      { row: centerRow + 1, col: centerCol - 1 },
      { row: centerRow - 0, col: centerCol - 1 },
      { row: centerRow - 1, col: centerCol - 1 },
    ];

    // Add predefined spiral positions
    for (let i = 0; i < spiralPositions.length && memberIndex < memberCount; i++) {
      positions.push({
        index: memberIndex,
        member: members[memberIndex++] || null,
        isCenter: false,
        row: spiralPositions[i].row,
        col: spiralPositions[i].col,
      });
    }

    // Continue spiral pattern for remaining members
    // Start from the last predefined position and continue the spiral
    let currentRow = centerRow - 1;
    let currentCol = centerCol - 2; // Start from left of the predefined pattern
    let direction = 0; // Start going right
    let steps = 5; // Start with 3 steps for the next ring



    while (memberIndex < memberCount) {
      for (let turn = 0; turn < 4; turn++) {
        for (let i = 0; i < steps && memberIndex < memberCount; i++) {
          // Move in current direction
          switch (direction) {
            case 0: currentCol++; break; // right
            case 1: currentRow++; break; // down
            case 2: currentCol--; break; // left
            case 3: currentRow--; break; // up
          }

          positions.push({
            index: memberIndex,
            member: members[memberIndex++] || null,
            isCenter: false,
            row: currentRow-1,
            col: currentCol,
          });
        }
        direction = (direction + 1) % 4;
      }
      steps++;
    }

    return positions;
  };

  const positions = generateGridPositions();

  const maxRow = Math.max(...positions.map(p => p.row));
  const maxCol = Math.max(...positions.map(p => p.col));
  const minRow = Math.min(...positions.map(p => p.row));
  const minCol = Math.min(...positions.map(p => p.col));

  const rowOffset = -minRow;
  const colOffset = -minCol;

  const usedRows = maxRow - minRow + 1;
  const usedCols = maxCol - minCol + 1;

  return (
    <div className={cn('w-full h-full flex items-center justify-center p-4 bg-pink-50', config.container)}>
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
              ...cellStyle(pos.isCenter),
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
