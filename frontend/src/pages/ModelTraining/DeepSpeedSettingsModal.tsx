import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface DeepSpeedSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    settings: any;
    onChange: (key: string, value: any) => void;
}

const DeepSpeedSettingsModal: React.FC<DeepSpeedSettingsModalProps> = ({ visible, onCancel, onOk, settings, onChange }) => {
    return (
        <Modal
            title="DeepSpeed Settings"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
        >
            <Form layout="vertical">
                <Form.Item label="Train Micro Batch Size Per GPU">
                    <InputNumber min={1} value={settings.train_micro_batch_size_per_gpu} onChange={(value) => onChange('train_micro_batch_size_per_gpu', value)} />
                    <Tooltip title="Train Micro Batch Size Per GPU: 각 GPU당 마이크로 배치 크기 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="Gradient Accumulation Steps">
                    <InputNumber min={1} value={settings.gradient_accumulation_steps} onChange={(value) => onChange('gradient_accumulation_steps', value)} />
                    <Tooltip title="Gradient Accumulation Steps: 그래디언트 누적 단계 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="Gradient Clipping">
                    <Input value={settings.gradient_clipping} onChange={(e) => onChange('gradient_clipping', e.target.value)} />
                    <Tooltip title="Gradient Clipping: 그래디언트 클리핑 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="Zero Optimization Stage">
                    <InputNumber min={0} max={3} value={settings.zero_optimization_stage} onChange={(value) => onChange('zero_optimization_stage', value)} />
                    <Tooltip title="Zero Optimization Stage: 제로 최적화 단계 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="FP16 Enabled">
                    <Switch checked={settings.fp16_enabled} onChange={(checked) => onChange('fp16_enabled', checked)} />
                    <Tooltip title="FP16 Enabled: FP16 사용 여부 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="Activation Checkpointing">
                    <Switch checked={settings.activation_checkpointing} onChange={(checked) => onChange('activation_checkpointing', checked)} />
                    <Tooltip title="Activation Checkpointing: 활성화 체크포인팅 사용 여부 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="Wall Clock Breakdown">
                    <Switch checked={settings.wall_clock_breakdown} onChange={(checked) => onChange('wall_clock_breakdown', checked)} />
                    <Tooltip title="Wall Clock Breakdown: 벽시계 분해 사용 여부 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DeepSpeedSettingsModal;