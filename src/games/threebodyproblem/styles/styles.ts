import {CSSProperties} from 'react';

export const containerStyle: CSSProperties = {
    display: 'flex',
    height: '85vh',
    width: '98vw',
    overflow: 'hidden',
};

export const canvasContainerStyle: CSSProperties = {
    flex: 1,
    position: 'relative',
};

export const controlPanelStyle: CSSProperties = {
    width: 380,
    height: '100%',
    overflow: 'auto',
    padding: 16,
    background: '#141414',
    borderLeft: '1px solid #303030',
};

export const mobileContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '85vh',
    width: '98vw',
    overflow: 'hidden',
};

export const mobileCanvasStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
};

export const mobileControlsStyle: CSSProperties = {
    height: '45vh',
    overflow: 'auto',
    padding: 12,
    background: '#141414',
    borderTop: '1px solid #303030',
};

export const statsOverlayStyle: CSSProperties = {
    position: 'absolute',
    top: 16,
    left: 16,
    background: 'rgba(0, 0, 0, 0.85)',
    padding: '12px 16px',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 12,
    pointerEvents: 'none',
    zIndex: 10,
    minWidth: 220,
    backdropFilter: 'blur(4px)',
    border: '1px solid #333',
};

export const helpOverlayStyle: CSSProperties = {
    position: 'absolute',
    bottom: 16,
    left: 16,
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '8px 12px',
    borderRadius: 8,
    color: '#888',
    fontSize: 11,
    pointerEvents: 'none',
    zIndex: 10,
};
