
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

  const generateSpiralPositions = () => {
    if (memberCount === 0) return [];

    // Calculate grid size needed to accommodate all members
    const gridSize = Math.ceil(Math.sqrt(memberCount * 4)) + 2; // Extra space for center expansion
    const center = Math.floor(gridSize / 2);

    const positions: {
      member: Member | null;
      isCenter: boolean;
      row: number;
      col: number;
      gridRow: number;
      gridCol: number;
    }[] = [];

    // Place center member first (always the first member if available)
    positions.push({
      member: members[0] || null,
      isCenter: true,
      row: center,
      col: center,
      gridRow: center + 1,
      gridCol: center + 1,
    });

    if (memberCount === 1) return positions;

    // Spiral directions: right, down, left, up
    const directions = [
      { row: 0, col: 1 },  // right
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: -1, col: 0 }, // up
    ];

    let currentRow = center;
    let currentCol = center + 1; // Start one cell to the right of center
    let directionIndex = 0;
    let steps = 1;
    let memberIndex = 1;

    while (memberIndex < memberCount) {
      // Move in current direction for 'steps' number of times
      for (let i = 0; i < steps && memberIndex < memberCount; i++) {
        // Skip if this would overlap with center cell (2x2 area)
        if (!(currentRow >= center && currentRow <= center && 
              currentCol >= center && currentCol <= center)) {
          
          positions.push({
            member: members[memberIndex] || null,
            isCenter: false,
            row: currentRow,
            col: currentCol,
            gridRow: currentRow + 1,
            gridCol: currentCol + 1,
          });
          memberIndex++;
        }

        // Move to next position in current direction
        if (memberIndex < memberCount) {
          currentRow += directions[directionIndex].row;
          currentCol += directions[directionIndex].col;
        }
      }

      // Change direction (90-degree turn)
      directionIndex = (directionIndex + 1) % 4;

      // Increase steps every two direction changes (after completing right+down or left+up)
      if (directionIndex % 2 === 0) {
        steps++;
      }
    }

    return positions;
  };

  const positions = generateSpiralPositions();

  if (positions.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-4 bg-pink-50', config.container)}>
        <div className="text-gray-400 text-sm">No members to display</div>
      </div>
    );
  }

  // Calculate grid bounds
  const rows = positions.map(p => p.row);
  const cols = positions.map(p => p.col);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  // Calculate grid dimensions and offsets
  const gridRows = maxRow - minRow + 2; // +1 for center cell expansion
  const gridCols = maxCol - minCol + 2; // +1 for center cell expansion
  const rowOffset = -minRow;
  const colOffset = -minCol;

  return (
    <div className={cn('flex items-center justify-center p-4 bg-pink-50', config.container)}>
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, ${config.regular}px)`,
          gridTemplateRows: `repeat(${gridRows}, ${config.regular}px)`,
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
                {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
