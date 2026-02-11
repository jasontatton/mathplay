import React from 'react';
import { Select, Tag, Space, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSimulationStore } from '../store/simulationStore';
import { presets, getAllCategories } from '../presets/presets';
import { Preset } from '../types/types';

const { Text } = Typography;

const categoryColors: Record<Preset['category'], string> = {
  famous: 'gold',
  stable: 'green',
  periodic: 'blue',
  chaotic: 'red',
  fun: 'purple',
  artistic: 'magenta',
};

const categoryDescriptions: Record<Preset['category'], string> = {
  famous: 'Historically significant discoveries',
  stable: 'Long-lasting stable configurations',
  periodic: 'Repeating choreographies',
  chaotic: 'Unpredictable motion',
  fun: 'Interesting scenarios',
  artistic: 'Beautiful trail patterns',
};

export const PresetSelector: React.FC = () => {
  const { loadPreset, currentPresetId } = useSimulationStore();

  const groupedOptions = getAllCategories().map((category) => ({
    label: (
      <Space>
        <Tag color={categoryColors[category]}>{category}</Tag>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {categoryDescriptions[category]}
        </Text>
      </Space>
    ),
    options: presets
      .filter((p) => p.category === category)
      .map((p) => ({
        value: p.id,
        label: (
          <Space>
            <span>{p.name}</span>
            {p.author && (
              <Tooltip title={`${p.author}${p.year ? ` (${p.year})` : ''}`}>
                <InfoCircleOutlined style={{ color: '#888', fontSize: 11 }} />
              </Tooltip>
            )}
          </Space>
        ),
      })),
  }));

  return (
    <Select
      style={{ width: '100%' }}
      placeholder="Select a preset"
      value={currentPresetId}
      options={groupedOptions}
      onChange={(value) => loadPreset(value)}
      dropdownStyle={{ maxHeight: 400 }}
    />
  );
};
