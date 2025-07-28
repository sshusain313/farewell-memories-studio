
import { GridTemplate, Member } from "@/context/CollageContext";
import { cn } from "@/lib/utils";

interface GridPreviewProps {
  template: GridTemplate;
  memberCount: number;
  members?: Member[];
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export const GridPreview: React.FC<GridPreviewProps> = ({ 
  template, 
  memberCount, 
  members = [], 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
    xlarge: 'w-96 h-96'
  };

  const cellSizes = {
    small: { regular: 'w-6 h-6', center: 'w-12 h-12' },
    medium: { regular: 'w-8 h-8', center: 'w-16 h-16' },
    large: { regular: 'w-10 h-10', center: 'w-20 h-20' },
    xlarge: { regular: 'w-16 h-16', center: 'w-32 h-32' }
  };

  const renderSquareGrid = () => {
    const gridSize = Math.ceil(Math.sqrt(memberCount));
    const centerIndex = Math.floor(memberCount / 2);

    return (
      <div className={cn("grid gap-1 p-4", sizeClasses[size])} style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {Array.from({ length: memberCount }, (_, index) => {
          const member = members[index];
          const isCenter = index === centerIndex;
          
          return (
            <div
              key={index}
              className={cn(
                "rounded border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden",
                isCenter ? cellSizes[size].center : cellSizes[size].regular,
                member ? "border-purple-400 bg-purple-50" : ""
              )}
            >
              {member ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-gray-400 font-medium">
                  {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHexagonalGrid = () => {
    const rows = Math.ceil(Math.sqrt(memberCount));
    const centerIndex = Math.floor(memberCount / 2);
    
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 p-4", sizeClasses[size])}>
        {Array.from({ length: rows }, (_, rowIndex) => {
          const itemsInRow = rowIndex === Math.floor(rows / 2) ? Math.ceil(memberCount / rows) + 1 : Math.floor(memberCount / rows);
          const startIndex = rowIndex * Math.floor(memberCount / rows);
          
          return (
            <div key={rowIndex} className="flex gap-1" style={{ marginLeft: rowIndex % 2 === 1 ? '1rem' : '0' }}>
              {Array.from({ length: itemsInRow }, (_, colIndex) => {
                const index = startIndex + colIndex;
                if (index >= memberCount) return null;
                
                const member = members[index];
                const isCenter = index === centerIndex;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden",
                      isCenter ? cellSizes[size].center : cellSizes[size].regular,
                      member ? "border-purple-400 bg-purple-50" : ""
                    )}
                  >
                    {member ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400 font-medium">
                        {index + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCircleGrid = () => {
    const centerIndex = Math.floor(memberCount / 2);
    const radius = size === 'xlarge' ? 120 : size === 'large' ? 80 : size === 'medium' ? 60 : 40;
    const centerX = size === 'xlarge' ? 192 : size === 'large' ? 128 : size === 'medium' ? 96 : 64;
    const centerY = size === 'xlarge' ? 192 : size === 'large' ? 128 : size === 'medium' ? 96 : 64;
    
    return (
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 p-4">
          {/* Center photo */}
          <div
            className={cn(
              "absolute rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden transform -translate-x-1/2 -translate-y-1/2",
              cellSizes[size].center,
              members[centerIndex] ? "border-purple-400 bg-purple-50" : ""
            )}
            style={{ left: centerX, top: centerY }}
          >
            {members[centerIndex] ? (
              <img
                src={members[centerIndex].photo}
                alt={members[centerIndex].name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-gray-400 font-medium">C</div>
            )}
          </div>

          {/* Surrounding photos */}
          {Array.from({ length: memberCount - 1 }, (_, index) => {
            const actualIndex = index >= centerIndex ? index + 1 : index;
            const member = members[actualIndex];
            const angle = (index / (memberCount - 1)) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <div
                key={actualIndex}
                className={cn(
                  "absolute rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden transform -translate-x-1/2 -translate-y-1/2",
                  cellSizes[size].regular,
                  member ? "border-purple-400 bg-purple-50" : ""
                )}
                style={{ left: x, top: y }}
              >
                {member ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400 font-medium">
                    {actualIndex + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  switch (template) {
    case 'hexagonal':
      return renderHexagonalGrid();
    case 'circle':
      return renderCircleGrid();
    case 'square':
    default:
      return renderSquareGrid();
  }
};
