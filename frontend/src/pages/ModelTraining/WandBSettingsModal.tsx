import React from 'react';
import { Modal, Form, Input } from 'antd';

interface WandBSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    wandbToken: string;
    setWandbToken: (value: string) => void;
}

const WandBSettingsModal: React.FC<WandBSettingsModalProps> = ({
    visible,
    onCancel,
    onOk,
    wandbToken,
    setWandbToken
}) => {
    return (
        <Modal
            title="WandB Settings"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
        >
            <Form layout="vertical">
                <Form.Item label="WandB API Token">
                    <Input.Password value={wandbToken} onChange={(e) => setWandbToken(e.target.value)} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WandBSettingsModal;