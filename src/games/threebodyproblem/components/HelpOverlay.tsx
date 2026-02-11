import React from 'react';
import { helpOverlayStyle } from '../styles/styles';

export const HelpOverlay: React.FC = () => {
  return (
    <div style={helpOverlayStyle}>
      <div>Space: Play/Pause | R: Reset | ↑↓: Speed</div>
      <div>Drag: Rotate | Scroll: Zoom | Shift+Drag: Pan</div>
    </div>
  );
};
