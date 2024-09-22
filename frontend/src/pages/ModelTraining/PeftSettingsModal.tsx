import React from 'react';
import { Modal, Form, InputNumber, Select, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

interface PeftSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    settings: any;
    onChange: (key: string, value: any) => void;
}

const PeftSettingsModal: React.FC<PeftSettingsModalProps> = ({ visible, onCancel, onOk, settings, onChange }) => {
    return (
        <Modal
            title="PEFT Settings"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
        >
            <Form layout="vertical">
                <Form.Item label="r_value">
                    <InputNumber min={1} value={settings.peft_r_value || 8} onChange={(value) => onChange('peft_r_value', value)} />
                    <Tooltip title="r_value: PEFT의 r 값 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="lora_alpha">
                    <InputNumber min={1} value={settings.lora_alpha || 16} onChange={(value) => onChange('lora_alpha', value)} />
                    <Tooltip title="lora_alpha: LoRA의 알파 값 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="lora_dropout">
                    <InputNumber min={0} max={1} step={0.1} value={settings.lora_dropout || 0.1} onChange={(value) => onChange('lora_dropout', value)} />
                    <Tooltip title="lora_dropout: LoRA의 드롭아웃 비율 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="bias">
                    <Select value={settings.bias || 'none'} onChange={(value) => onChange('bias', value)}>
                        <Option value="none">None</Option>
                        <Option value="all">All</Option>
                        <Option value="lora_only">Lora Only</Option>
                    </Select>
                    <Tooltip title="bias: 바이어스 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                {/* task_type 필드 제거 */}
            </Form>
        </Modal>
    );
};

export default PeftSettingsModal;