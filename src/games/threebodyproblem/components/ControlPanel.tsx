import React from 'react';
import {
  Card,
  Slider,
  Button,
  Switch,
  Space,
  Typography,
  Collapse,
  Select,
  Divider,
  Tooltip,
  message,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  ClearOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { useSimulationStore } from '../store/simulationStore';
import { PresetSelector } from './PresetSelector';
import { BodyControls } from './BodyControls';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export const ControlPanel: React.FC = () => {
  const {
    isRunning,
    speed,
    gravitationalConstant,
    trailLength,
    showTrails,
    showVectors,
    showGrid,
    is3D,
    bloomIntensity,
    showStats,
    integrationMethod,
    setIsRunning,
    setSpeed,
    setGravitationalConstant,
    setTrailLength,
    setShowTrails,
    setShowVectors,
    setShowGrid,
    setIs3D,
    setBloomIntensity,
    setShowStats,
    setIntegrationMethod,
    clearTrails,
    reset,
    exportConfig,
    importConfig,
  } = useSimulationStore();

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `three-body-config-${Date.now()}.json`);
    message.success('Configuration exported!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const config = JSON.parse(text);
          importConfig(config);
          message.success('Configuration imported!');
        } catch {
          message.error('Invalid configuration file');
        }
      }
    };
    input.click();
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
        🌌 Three Body Simulator
      </Title>

      {/* Playback Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'center' }} wrap>
          <Tooltip title={isRunning ? 'Pause (Space)' : 'Play (Space)'}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsRunning(!isRunning)}
            />
          </Tooltip>
          <Tooltip title="Reset (R)">
            <Button
              shape="circle"
              size="large"
              icon={<ReloadOutlined />}
              onClick={reset}
            />
          </Tooltip>
          <Tooltip title="Clear Trails">
            <Button
              shape="circle"
              icon={<ClearOutlined />}
              onClick={clearTrails}
            />
          </Tooltip>
          <Tooltip title="Export Config">
            <Button
              shape="circle"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            />
          </Tooltip>
          <Tooltip title="Import Config">
            <Button
              shape="circle"
              icon={<UploadOutlined />}
              onClick={handleImport}
            />
          </Tooltip>
        </Space>
      </Card>

      {/* Preset Selector */}
      <Card size="small" title="Presets" style={{ marginBottom: 16 }}>
        <PresetSelector />
      </Card>

      <Collapse defaultActiveKey={['settings']} ghost>
        {/* Simulation Settings */}
        <Panel header="Simulation Settings" key="settings">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Speed: {speed.toFixed(2)}x</Text>
              <Slider
                min={0.1}
                max={5}
                step={0.1}
                value={speed}
                onChange={setSpeed}
              />
            </div>

            <div>
              <Text>Gravitational Constant: {gravitationalConstant.toFixed(2)}</Text>
              <Slider
                min={0.1}
                max={5}
                step={0.1}
                value={gravitationalConstant}
                onChange={setGravitationalConstant}
              />
            </div>

            <div>
              <Text>Integration Method</Text>
              <Select
                style={{ width: '100%' }}
                value={integrationMethod}
                onChange={setIntegrationMethod}
                options={[
                  { value: 'euler', label: 'Euler (Fast, Less Accurate)' },
                  { value: 'verlet', label: 'Verlet (Balanced)' },
                  { value: 'rk4', label: 'Runge-Kutta 4 (Accurate)' },
                ]}
              />
            </div>
          </Space>
        </Panel>

        {/* Visual Settings */}
        <Panel header="Visual Settings" key="visuals">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Trail Length: {trailLength}</Text>
              <Slider
                min={50}
                max={2000}
                step={50}
                value={trailLength}
                onChange={setTrailLength}
              />
            </div>

            <div>
              <Text>Bloom Intensity: {bloomIntensity.toFixed(1)}</Text>
              <Slider
                min={0}
                max={5}
                step={0.1}
                value={bloomIntensity}
                onChange={setBloomIntensity}
              />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <Space direction="vertical">
              <Space>
                <Switch checked={showTrails} onChange={setShowTrails} />
                <Text>Show Trails</Text>
              </Space>

              <Space>
                <Switch checked={showVectors} onChange={setShowVectors} />
                <Text>Show Velocity Vectors</Text>
              </Space>

              <Space>
                <Switch checked={showGrid} onChange={setShowGrid} />
                <Text>Show Grid</Text>
              </Space>

              <Space>
                <Switch checked={showStats} onChange={setShowStats} />
                <Text>Show Statistics</Text>
              </Space>

              <Space>
                <Switch checked={is3D} onChange={setIs3D} />
                <Text>3D Mode (Enable Rotation)</Text>
              </Space>
            </Space>
          </Space>
        </Panel>

        {/* Body Controls */}
        <Panel header="Body Parameters" key="bodies">
          <BodyControls />
        </Panel>
      </Collapse>
    </div>
  );
};
