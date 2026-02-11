// src/games/threebodyproblem/components/PresetSelector.tsx

import React from 'react';
import {Select, Space, Tag, Tooltip, Typography} from 'antd';
import {HighlightOutlined, SmileOutlined, StarOutlined, SyncOutlined, ThunderboltOutlined,} from '@ant-design/icons';
import {useSimulationStore} from '../store/simulationStore';
import {getAllCategories, getPresetsByCategory, presets} from '../presets/presets';
import {Preset} from '../types/types';

const {Text} = Typography;
const {Option, OptGroup} = Select;

const categoryConfig: Record<
    Preset['category'],
    { color: string; icon: React.ReactNode; label: string }
> = {
    famous: {color: 'gold', icon: <StarOutlined/>, label: 'Famous Historical'},
    stable: {color: 'green', icon: <SyncOutlined/>, label: 'Stable Orbits'},
    periodic: {color: 'blue', icon: <SyncOutlined spin/>, label: 'Periodic Choreographies'},
    chaotic: {color: 'red', icon: <ThunderboltOutlined/>, label: 'Chaotic'},
    fun: {color: 'purple', icon: <SmileOutlined/>, label: 'Fun & Interesting'},
    artistic: {color: 'magenta', icon: <HighlightOutlined/>, label: 'Artistic'},
};

export const PresetSelector: React.FC = () => {
    const {loadPreset, currentPresetId} = useSimulationStore();

    // Get current preset info
    const currentPreset = presets.find((p) => p.id === currentPresetId);

    return (
        <div>
            <Select
                style={{width: '100%'}}
                placeholder="Select a preset"
                value={currentPresetId}
                onChange={(value) => loadPreset(value)}
                showSearch
                filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === 'string') {
                        return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                }}
                dropdownStyle={{maxHeight: 500}}
                listHeight={400}
                virtual={false}
            >
                {getAllCategories().map((category) => {
                    const config = categoryConfig[category];
                    const categoryPresets = getPresetsByCategory(category);

                    return (
                        <OptGroup
                            key={category}
                            label={
                                <Space>
                                    {config.icon}
                                    <Text strong style={{color: '#fff'}}>
                                        {config.label}
                                    </Text>
                                    <Tag color={config.color}>{categoryPresets.length}</Tag>
                                </Space>
                            }
                        >
                            {categoryPresets.map((preset) => (
                                <Option key={preset.id} value={preset.id} label={preset.name}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>{preset.name}</span>
                                        {preset.author && (
                                            <Tooltip
                                                title={`${preset.author}${preset.year ? ` (${preset.year})` : ''}`}>
                                                <Text type="secondary" style={{fontSize: 11}}>
                                                    {preset.year || '•'}
                                                </Text>
                                            </Tooltip>
                                        )}
                                    </div>
                                </Option>
                            ))}
                        </OptGroup>
                    );
                })}
            </Select>

            {/* Show current preset description */}
            {currentPreset && (
                <div
                    style={{
                        marginTop: 8,
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        fontSize: 12,
                    }}
                >
                    <div style={{marginBottom: 4}}>
                        <Tag color={categoryConfig[currentPreset.category].color}>
                            {currentPreset.category}
                        </Tag>
                        {currentPreset.author && (
                            <Text type="secondary" style={{fontSize: 11}}>
                                by {currentPreset.author} {currentPreset.year && `(${currentPreset.year})`}
                            </Text>
                        )}
                    </div>
                    <Text type="secondary">{currentPreset.description}</Text>
                </div>
            )}

            {/* Preset count */}
            <div style={{marginTop: 8, textAlign: 'center'}}>
                <Text type="secondary" style={{fontSize: 11}}>
                    {presets.length} presets available
                </Text>
            </div>
        </div>
    );
};