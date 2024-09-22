import React from 'react';
import { Modal, Form, Input } from 'antd';

interface HuggingFaceSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    hfUsername: string;
    setHfUsername: (value: string) => void;
    hfToken: string;
    setHfToken: (value: string) => void;
}

const HuggingFaceSettingsModal: React.FC<HuggingFaceSettingsModalProps> = ({
    visible,
    onCancel,
    onOk,
    hfUsername,
    setHfUsername,
    hfToken,
    setHfToken
}) => {
    return (
        <Modal
            title="Hugging Face Settings"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
        >
            <Form layout="vertical">
                <Form.Item label="Hugging Face Username">
                    <Input value={hfUsername} onChange={(e) => setHfUsername(e.target.value)} />
                </Form.Item>
                <Form.Item label="Hugging Face API Token">
                    <Input.Password value={hfToken} onChange={(e) => setHfToken(e.target.value)} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default HuggingFaceSettingsModal;