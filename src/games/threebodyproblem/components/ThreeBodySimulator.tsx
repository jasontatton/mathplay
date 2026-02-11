import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { SimulationCanvas } from './SimulationCanvas';
import { ControlPanel } from './ControlPanel';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useResponsive } from '../hooks/useResponsive';
import {
  containerStyle,
  canvasContainerStyle,
  controlPanelStyle,
  mobileContainerStyle,
  mobileCanvasStyle,
  mobileControlsStyle,
} from '../styles/styles';

const ThreeBodyContent: React.FC = () => {
  useKeyboardControls();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div style={mobileContainerStyle}>
        <div style={mobileCanvasStyle}>
          <SimulationCanvas />
        </div>
        <div style={mobileControlsStyle}>
          <ControlPanel />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={canvasContainerStyle}>
        <SimulationCanvas />
      </div>
      <div style={controlPanelStyle}>
        <ControlPanel />
      </div>
    </div>
  );
};

export const ThreeBodySimulator: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#4ecdc4',
          borderRadius: 6,
        },
        components: {
          Slider: {
            trackBg: '#4ecdc4',
            trackHoverBg: '#45b7aa',
            handleColor: '#4ecdc4',
            handleActiveColor: '#45b7aa',
          },
        },
      }}
    >
      <ThreeBodyContent />
    </ConfigProvider>
  );
};

export default ThreeBodySimulator;
