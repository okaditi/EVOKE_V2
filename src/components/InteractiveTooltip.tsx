import React from 'react';
import { InteractiveObjectId, DISCOVERY_ITEMS } from '../types';

interface InteractiveTooltipProps {
  activeId: InteractiveObjectId | null;
  isDraggingController: boolean;
  isDraggingChair: boolean;
  isDraggingMouse?: boolean;
  isMonitorPowered: boolean;
  isPCPowered: boolean;
}

export const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  activeId,
  isDraggingController,
  isDraggingChair,
  isDraggingMouse,
  isMonitorPowered,
  isPCPowered,
}) => {
  if (!activeId) return null;

  const item = DISCOVERY_ITEMS[activeId];
  if (!item) return null;

  // Compute clean, minimal status string
  let statusText = '';
  let statusColor = '#A62B5F'; // Burgundy / Mauve
  if (isDraggingMouse) {
    statusText = 'Dragging Voxel Mouse • Crosshair tracking on screen';
    statusColor = '#E66A3A';
  } else if (isDraggingChair) {
    statusText = 'Moving Gaming Chair • 360° Dynamic Swivel';
    statusColor = '#A62B5F';
  } else if (isDraggingController) {
    statusText = 'Holding Controller • Place on Oak Desk';
    statusColor = '#E66A3A';
  } else {
    statusText = 'Click to interact';
  }

  return (
    <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5 px-4 py-2 bg-[#17141C]/95 border-2 border-[#A62B5F] shadow-[0_0_20px_rgba(166,43,95,0.5)] backdrop-blur-md">
        <span className="w-2 h-2" style={{ backgroundColor: statusColor }} />
        <span
          className="font-mono font-bold text-xs tracking-wider uppercase whitespace-nowrap"
          style={{ color: statusColor }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
};
