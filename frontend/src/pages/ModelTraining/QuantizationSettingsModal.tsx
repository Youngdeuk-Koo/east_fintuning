import React, { useEffect } from 'react';
import { Modal, Form, Select, Tooltip, InputNumber } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

interface QuantizationSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    settings: any;
    onChange: (key: string, value: any) => void;
}

const QuantizationSettingsModal: React.FC<QuantizationSettingsModalProps> = ({ visible, onCancel, onOk, settings, onChange }) => {
    useEffect(() => {
        if (visible && !settings.quantizationType) {
            onChange('quantizationType', '8bit'); // 기본값을 8bit로 설정
        }
    }, [visible, settings.quantizationType, onChange]);

    return (
        <Modal
            title="Quantization Settings"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
        >
            <Form layout="vertical">
                <Form.Item label="Quantization Type">
                    <Select value={settings.quantizationType} onChange={(value) => onChange('quantizationType', value)}>
                        <Option value="4bit">4-bit</Option>
                        <Option value="8bit">8-bit</Option>
                    </Select>
                    <Tooltip title="Quantization Type: 양자화 유형 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
                <Form.Item label="LLM INT8 Threshold">
                    <InputNumber
                        value={settings.llm_int8_threshold}
                        onChange={(value) => onChange('llm_int8_threshold', value)}
                        step={0.1}
                        min={0}
                    />
                    <Tooltip title="LLM INT8 Threshold 설정">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuantizationSettingsModal;