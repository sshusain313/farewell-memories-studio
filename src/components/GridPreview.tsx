
import { GridTemplate, Member } from "@/context/CollageContext";
import { HexagonalGrid } from "./grids/HexagonalGrid";
import { SquareGrid } from "./grids/SquareGrid";
import { CircleGrid } from "./grids/CircleGrid";

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
  const commonProps = {
    memberCount,
    members,
    size
  };

  switch (template) {
    case 'hexagonal':
      return <HexagonalGrid {...commonProps} />;
    case 'circle':
      return <CircleGrid {...commonProps} />;
    case 'square':
    default:
      return <SquareGrid {...commonProps} />;
  }
};
