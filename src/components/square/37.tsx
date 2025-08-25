
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {useGrid} from './context/GridContext';
import { Member } from '@/context/CollageContext';

interface CellImage {
  [key: string]: string;
}

interface GridBoardProps {
  previewMember?: Member;
  existingMembers?: Member[];
}

const GridBoard: React.FC<GridBoardProps> = ({ previewMember, existingMembers = [] }) => {
  const {
    cellImages,
    setCellImages,
    isDownloading,
    getCellStyle,
    startDrag,
    handleCellActivate,
    downloadImage,
  } = useGrid();

  // Responsive breakpoint check for desktop
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    // Treat >=1024px as PC/desktop
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsDesktop(matches);
    };
    // Initialize
    setIsDesktop(mq.matches);
    // Subscribe
    if (mq.addEventListener) {
      mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    } else {
      // Safari fallback
      // @ts-ignore
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
      } else {
        // @ts-ignore
        mq.removeListener(handler);
      }
    };
  }, []);

  // Unique component-scoped ID helpers
  const COMP_ID = 'grid-37';
  const cid = (section: string, row: number, col: number) => `${COMP_ID}:${section}:${row}-${col}`;

  const handleCellClick = (cellKey: string) => handleCellActivate(cellKey);

  // Helper function to get cell style with fallback to existing members
  const getCellStyleWithFallback = (cellKey: string) => {
    // First try to get style from GridContext
    const gridStyle = getCellStyle(cellKey);
    if (gridStyle.backgroundImage) {
      return gridStyle;
    }
    
    // If no image in GridContext, check if we have an existing member for this cell
    // This handles the case where we're in JoinGroup.tsx preview mode
    const cellIndex = getCellIndexFromKey(cellKey);
    if (cellIndex !== -1 && existingMembers[cellIndex]?.photo) {
      return {
        backgroundImage: `url(${existingMembers[cellIndex].photo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } as React.CSSProperties;
    }
    
    return gridStyle;
  };

  // Helper function to get member index from cell key
  const getCellIndexFromKey = (cellKey: string) => {
    // Extract row and column from cell key
    const parts = cellKey.split(':');
    if (parts.length < 3) return -1;
    
    const section = parts[1];
    const position = parts[2];
    const [row, col] = position.split('-').map(Number);
    
    if (section === 'top') {
      // Top row: 0-7
      return col;
    } else if (section === 'left') {
      // Left side: 8-13
      return 8 + (row - 1);
    } else if (section === 'right') {
      // Right side: 14-19
      return 14 + (row - 1);
    } else if (section === 'bottom') {
      // Bottom row: 20-27
      return 20 + col;
    } else if (section === 'bottom-extension') {
      // Bottom extension: 28-35
      return 28 + col;
    }
    
    return -1;
  };

  // Integrate form-uploaded images with GridContext
  useEffect(() => {
    if (previewMember?.photo) {
      // Set the preview member's photo in the center cell
      setCellImages(prev => ({
        ...prev,
        [cid('center', 0, 0)]: previewMember.photo
      }));
    }
  }, [previewMember?.photo, setCellImages, cid]);

  // Canvas helpers and renderer for this 8x10 layout
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const sRatio = img.width / img.height;
    const dRatio = dw / dh;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sRatio > dRatio) {
      sh = img.height;
      sw = sh * dRatio;
      sx = (img.width - sw) / 2;
    } else {
      sw = img.width;
      sh = sw / dRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const buildAndDownload = async () => {
    if (!Object.keys(cellImages).length) {
      toast.error('Please upload at least one image before downloading.');
      return;
    }

    try {
      await downloadImage('template-34.png', {
        cols: 8,
        rows: 11, // Increased to include both top and bottom extension rows
        // Target physical size for print within requested ranges
        targetWidthIn: 8.5,
        targetHeightIn: 12.5,
        dpi: 300,
        desiredGapPx: 4,
        draw: async ({ drawKey, ctx, width, height }) => {
          // Calculate cell dimensions
          const cellWidth = width / 8;
          const cellHeight = height / 8;
     
          // First, draw top extension (8 cells centered)
          const extensionCells = 8;
          const startCol = 0;
          
          // Draw top extension row at row 0
          for (let i = 0; i < extensionCells; i++) {
            await drawKey(
              cid('top-extension', -1, i + 2),
              0,
              i,
              1,
              1
            );
          }
          
          // Then draw main top row at row 1
          for (let c = 0; c < 8; c++) {
            await drawKey(cid('top', 0, c), 1, c);
          }

          // Draw left side (6 cells)
          for (let r = 2; r <= 7; r++) {
            await drawKey(cid('left', r, 0), r, 0);
          }

          // Draw center cell (spans 6x6)
          await drawKey(cid('center', 0, 0), 2, 1, 6, 6);

          // Draw right side (6 cells)
          for (let r = 2; r <= 7; r++) {
            await drawKey(cid('right', r, 7), r, 7);
          }

          // Draw bottom row (8 cells)
          const bottomRow = 8;
          for (let c = 0; c < 8; c++) {
            // Use consistent cell ID format as shown in the grid
            await drawKey(cid('bottom', 9, c), bottomRow, c, 1, 1);
          }
        
          // 6. Draw bottom extension (8 cells centered)
          // Draw the bottom extension cells with equal gaps
          const endCol=3.5;
          await Promise.all(Array.from({ length: extensionCells }, (_, i) => 
            drawKey(
              cid('bottom-extension', -1, i + 2),
              9,  // row 8 for bottom extension
              endCol + i,
              1,
              1
            )
          ));
        },
      });
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template. Please try again.');
    }

  };

  const handleDownload = buildAndDownload;

  // Listen to a global download trigger from the parent preview container
  useEffect(() => {
    const onDownload = async () => {
      try {
        await handleDownload();
      } catch (error) {
        console.error('Download handler error:', error);
        toast.error('Failed to process download request');
      }
    };
    window.addEventListener('grid-template-download', onDownload);
    return () => window.removeEventListener('grid-template-download', onDownload);
  }, [handleDownload]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 md:p-6">

      <div
        className="grid grid-cols-8 bg-white rounded-xl shadow-2xl p-1 md:p-3"
        style={{
          gap: 'var(--gap)',
          // 7 gaps across 8 cols/rows
          // cell = min(fit width, fit height)
          // ratio keeps cells slightly taller than wide
          // pad approximates container padding on mobile
          ['--gap' as any]: '2px',
          ['--pad' as any]: '8px',
          ['--cell' as any]: isDesktop
            ? 'min(calc((35vw - (var(--pad)*2) - (7 * var(--gap))) / 8), calc((100vh - (var(--pad)*2) - (7 * var(--gap))) / 8))'
            : 'min(calc((100vw - (var(--pad)*2) - (7 * var(--gap))) / 8), calc((100vh - (var(--pad)*2) - (7 * var(--gap))) / 8))',
          ['--ratio' as any]: '1.2',
          ['--row' as any]: 'calc(var(--cell) * var(--ratio))',
          gridAutoRows: 'var(--row)',
          gridTemplateColumns: 'repeat(8, var(--cell))'
        } as React.CSSProperties}
      >
        
         {/* Top extension - centered on all sizes, same size as grid cells */}
         <div className="col-span-8">
          <div
            className="grid"
            style={{
              display: 'grid',
              gap: 'var(--gap)',
              gridAutoFlow: 'column',
              gridAutoColumns: 'var(--cell)',
              gridAutoRows: 'var(--row)',
              justifyContent: 'center',
            } as React.CSSProperties}
          >
            {Array.from({ length: 8 }, (_, colIndex) => {
              const key = cid('top-extension', -1, colIndex + 2);
              return (
                <div
                  key={key}
                  className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                  style={getCellStyleWithFallback(key)}
                  onMouseDown={(e) => startDrag(e, key)}
                  onTouchStart={(e) => startDrag(e, key)}
                  onClick={() => handleCellActivate(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCellActivate(key);
                    }
                  }}
                >
                  {!cellImages[key] && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top row - 9 cells */}
        {Array.from({ length: 8 }, (_, colIndex) => {
          const cellKey = cid('top', 0, colIndex);
          return (
            <div
              key={cellKey}
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyleWithFallback(cellKey)}
              onClick={() => handleCellClick(cellKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cellKey);
                }
              }}
            >
              {!cellImages[cellKey] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          );
        })}

        {/* Middle rows with left border, center cell, and right border */}
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <React.Fragment key={`middle-row-${rowIndex}`}>
            {/* Left border cell */}
            <div
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyleWithFallback(cid('left', rowIndex + 1, 0))}
              onClick={() => handleCellClick(cid('left', rowIndex + 1, 0))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cid('left', rowIndex + 1, 0));
                }
              }}
            >
              {!cellImages[cid('left', rowIndex + 1, 0)] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>

            {/* Center cell - only render once and span 5 columns */}
            {rowIndex === 0 && (
              <div
                className="col-span-6 row-span-6 grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
                style={(() => {
                  // First priority: previewMember (for JoinGroup preview)
                  if (previewMember?.photo) {
                    return {
                      backgroundImage: `url(${previewMember.photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    } as React.CSSProperties;
                  }
                  
                  // Second priority: first existing member (for Editor view)
                  if (existingMembers.length > 0 && existingMembers[0]?.photo) {
                    return {
                      backgroundImage: `url(${existingMembers[0].photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    } as React.CSSProperties;
                  }
                  
                  // Fallback: use GridContext styling
                  return getCellStyle(cid('center', 0, 0));
                })()}
                onClick={() => handleCellClick(cid('center', 0, 0))}
                role="button"
                tabIndex={0}
              >
                {!previewMember?.photo && !existingMembers[0]?.photo && !cellImages[cid('center', 0, 0)] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span>CENTER</span>
                  </div>
                )}
              </div>
            )}

            {/* Right border cell */}
            <div
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyleWithFallback(cid('right', rowIndex + 1, 7))}
              onClick={() => handleCellClick(cid('right', rowIndex + 1, 7))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cid('right', rowIndex + 1, 7));
                }
              }}
            >
              {!cellImages[cid('right', rowIndex + 1, 7)] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Bottom row - 8 cells */}
        {Array.from({ length: 8 }, (_, colIndex) => {
          const cellKey = cid('bottom', 9, colIndex); // This matches our download cell ID
          return (
            <div
              key={cellKey}
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyleWithFallback(cellKey)}
              onClick={() => handleCellClick(cellKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cellKey);
                }
              }}
            >
              {!cellImages[cellKey] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom extension - centered on all sizes, same size as grid cells */}
        <div className="col-span-8">
          <div
            className="grid"
            style={{
              display: 'grid',
              gap: 'var(--gap)',
              gridAutoFlow: 'column',
              gridAutoColumns: 'var(--cell)',
              gridAutoRows: 'var(--row)',
              justifyContent: 'center',
            } as React.CSSProperties}
          >
            {Array.from({ length: 1 }, (_, colIndex) => {
              const key = cid('bottom-extension', -1, colIndex + 2);
              return (
                <div
                  key={key}
                  className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                  style={getCellStyleWithFallback(key)}
                  onMouseDown={(e) => startDrag(e, key)}
                  onTouchStart={(e) => startDrag(e, key)}
                  onClick={() => handleCellActivate(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCellActivate(key);
                    }
                  }}
                >
                  {!cellImages[key] && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom extension - 4 cells centered */}
        {/* <div className="col-span-6 flex justify-center gap-1">
          {Array.from({ length: 6 }, (_, colIndex) => {
            const key = cid('bottom-extension', -1, colIndex + 2);
            return (
              <div
                key={key}
                className="grid-cell w-full active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyleWithFallback(key)}
                onMouseDown={(e) => startDrag(e, key)}
                onTouchStart={(e) => startDrag(e, key)}
                onClick={() => handleCellActivate(key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellActivate(key);
                  }
                }}
              >
                {!cellImages[key] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div> */}

      </div>
      
      

      <div className="hidden md:block mt-8 text-center max-w-md">
        <p className="text-sm text-gray-500">
          Click on any cell to upload an image. Images will be automatically clipped to fit each cell perfectly.
        </p>
      </div>
    </div>
  );
};

export default GridBoard;
