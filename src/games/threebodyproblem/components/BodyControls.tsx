import React from 'react';
import {
  Collapse,
  Space,
  Slider,
  InputNumber,
  ColorPicker,
  Typography,
  Divider,
  Input,
} from 'antd';
import { useSimulationStore } from '../store/simulationStore';

const { Text } = Typography;
const { Panel } = Collapse;

export const BodyControls: React.FC = () => {
  const { bodies, updateBody, isRunning } = useSimulationStore();

  return (
    <Collapse ghost>
      {bodies.map((body, index) => (
        <Panel
          header={
            <Space>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: body.color,
                  boxShadow: `0 0 8px ${body.color}`,
                }}
              />
              <Text strong>{body.name || `Body ${index + 1}`}</Text>
            </Space>
          }
          key={body.id}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text type="secondary">Name</Text>
              <Input
                size="small"
                value={body.name}
                onChange={(e) => updateBody(body.id, { name: e.target.value })}
              />
            </div>

            <div>
              <Text type="secondary">Mass: {body.mass.toFixed(2)}</Text>
              <Slider
                min={0.1}
                max={10}
                step={0.1}
                value={body.mass}
                onChange={(value) => updateBody(body.id, { mass: value })}
                disabled={isRunning}
              />
            </div>

            <div>
              <Text type="secondary">Radius: {body.radius.toFixed(3)}</Text>
              <Slider
                min={0.02}
                max={0.3}
                step={0.01}
                value={body.radius}
                onChange={(value) => updateBody(body.id, { radius: value })}
              />
            </div>

            <div>
              <Text type="secondary">Color</Text>
              <ColorPicker
                value={body.color}
                onChange={(color) => {
                  const hex = color.toHexString();
                  updateBody(body.id, { color: hex, trailColor: hex });
                }}
              />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <Text strong>Position</Text>
            <Space wrap>
              <InputNumber
                size="small"
                addonBefore="X"
                value={body.position.x}
                step={0.1}
                style={{ width: 100 }}
                disabled={isRunning}
                onChange={(value) =>
                  updateBody(body.id, {
                    position: { ...body.position, x: value ?? 0 },
                  })
                }
              />
              <InputNumber
                size="small"
                addonBefore="Y"
                value={body.position.y}
                step={0.1}
                style={{ width: 100 }}
                disabled={isRunning}
                onChange={(value) =>
                  updateBody(body.id, {
                    position: { ...body.position, y: value ?? 0 },
                  })
                }
              />
              <InputNumber
                size="small"
                addonBefore="Z"
                value={body.position.z}
                step={0.1}
                style={{ width: 100 }}
                disabled={isRunning}
                onChange={(value) =>
                  updateBody(body.id, {
                    position: { ...body.position, z: value ?? 0 },
                  })
                }
              />
            </Space>

            <Text strong>Velocity</Text>
            <Space wrap>
              <InputNumber
                size="small"
                addonBefore="X"
                value={body.velocity.x}
                step={0.05}
                style={{ width: 100 }}
                disabled={isRunning}
                onChange={(value) =>
                  updateBody(body.id, {
                    velocity: { ...body.velocity, x: value ?? 0 },
                  })
                }
              />
              <InputNumber
                size="small"
                addonBefore="Y"
                value={body.velocity.y}
                step={0.05}
                style={{ width: 100 }}
                disabled={isRunning}
                onChange={(value) =>
                  updateBody(body.id, {
                    velocity: { ...body.velocity, y: value ?? 0 },
                  })
                }
              />
              <InputNumber
                size="small"
                addonBefore="Z"
                value={body.velocity.z}
                step={0.05}
                style={{ width: 100 }}
                disabled={isRunning}
                onChange={(value) =>
                  updateBody(body.id, {
                    velocity: { ...body.velocity, z: value ?? 0 },
                  })
                }
              />
            </Space>
          </Space>
        </Panel>
      ))}
    </Collapse>
  );
};
