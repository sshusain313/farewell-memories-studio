
// import React from 'react';
// import { Member } from '@/context/CollageContext';
// import { cn } from '@/lib/utils';

// interface SquareGridProps {
//   memberCount: number;
//   members: Member[];
//   size: 'small' | 'medium' | 'large' | 'xlarge';
// }

// export const SquareGrid: React.FC<SquareGridProps> = ({ 
//   memberCount, 
//   members, 
//   size 
// }) => {
//   const sizeConfig = {
//     small: { container: 'w-32 h-32', regular: 20, center: 40, gap: 2 },
//     medium: { container: 'w-48 h-48', regular: 28, center: 56, gap: 3 },
//     large: { container: 'w-64 h-64', regular: 36, center: 72, gap: 4 },
//     xlarge: { container: 'w-96 h-96', regular: 48, center: 96, gap: 6 }
//   };

//   const config = sizeConfig[size];
  
//   // Calculate grid size: smallest N where N*N >= memberCount
//   const gridSize = Math.ceil(Math.sqrt(memberCount));
  
//   // Center position in the grid
//   const centerRow = Math.floor(gridSize / 2);
//   const centerCol = Math.floor(gridSize / 2);
//   const centerIndex = centerRow * gridSize + centerCol;

//   const cellStyle = (isCenter: boolean) => ({
//     width: isCenter ? config.center : config.regular,
//     height: isCenter ? config.center : config.regular,
//     borderRadius: '8px',
//   });

//   // Generate grid positions with first member in center
//   const generateGridPositions = () => {
//     const positions = [];
//     let memberIndex = 0;
    
//     for (let row = 0; row < gridSize; row++) {
//       for (let col = 0; col < gridSize; col++) {
//         const gridIndex = row * gridSize + col;
//         const isCenter = row === centerRow && col === centerCol;
        
//         // Skip center position for non-first members
//         if (isCenter) {
//           // Place first member in center
//           positions.push({
//             index: gridIndex,
//             member: memberIndex < memberCount ? members[memberIndex] : null,
//             isCenter: true,
//             row,
//             col
//           });
//           memberIndex++;
//         } else {
//           // Place remaining members in other positions
//           if (memberIndex < memberCount) {
//             positions.push({
//               index: gridIndex,
//               member: members[memberIndex],
//               isCenter: false,
//               row,
//               col
//             });
//             memberIndex++;
//           } else {
//             // Empty position
//             positions.push({
//               index: gridIndex,
//               member: null,
//               isCenter: false,
//               row,
//               col
//             });
//           }
//         }
//       }
//     }
    
//     return positions;
//   };

//   const positions = generateGridPositions();

//   return (
//     <div className={cn("flex items-center justify-center p-4", config.container)}>
//       <div
//         className="grid"
//         style={{
//           display: 'grid',
//           gridTemplateColumns: `repeat(${gridSize}, ${config.regular}px)`,
//           gap: `${config.gap}px`,
//           position: 'relative'
//         }}
//       >
//         {positions.map((pos, index) => (
//           <div
//             key={index}
//             className={cn(
//               "border-2 border-dashed flex items-center justify-center overflow-hidden",
//               pos.member ? "border-purple-400 bg-purple-50" : "border-gray-300 bg-gray-50"
//             )}
//             style={{
//               ...cellStyle(pos.isCenter),
//               gridColumn: pos.isCenter ? `span 2` : undefined,
//               gridRow: pos.isCenter ? `span 2` : undefined,
//             }}
//           >
//             {pos.member ? (
//               <img
//                 src={pos.member.photo}
//                 alt={pos.member.name}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className={cn(
//                 "text-gray-400 font-medium",
//                 pos.isCenter ? "text-sm" : "text-xs"
//               )}>
//                 {pos.index + 1}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


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
    let row = centerRow;
    let col = centerCol;

    const dx = [1, 0, -1, 0]; // right, down, left, up
    const dy = [0, 1, 0, -1];
    let direction = 0;
    let steps = 1;

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
      row,
      col,
    });

    // Spiral placement
    while (memberIndex < memberCount) {
      for (let turn = 0; turn < 2; turn++) {
        for (let i = 0; i < steps; i++) {
          row += dy[direction];
          col += dx[direction];

          if (memberIndex >= memberCount) break;

          positions.push({
            index: memberIndex,
            member: members[memberIndex++] || null,
            isCenter: false,
            row,
            col,
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
    <div className={cn('flex items-center justify-center p-4 bg-pink-500', config.container)}>
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
