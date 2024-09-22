import React, { useState, useEffect } from 'react';
import { Form, Switch, Button, Tooltip, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

interface FineTuningSettingsProps {
    usePeft: boolean;
    setUsePeft: (value: boolean) => void;
    setPeftSettingsVisible: (visible: boolean) => void;
    useDeepSpeed: boolean;
    setUseDeepSpeed: (value: boolean) => void;
    setDeepspeedSettingsVisible: (visible: boolean) => void;
    useQuantization: boolean;
    setUseQuantization: (value: boolean) => void;
    setQuantizationSettingsVisible: (visible: boolean) => void;
    useHF: boolean;
    setUseHF: (value: boolean) => void;
    setHfSettingsVisible: (visible: boolean) => void;
    useWandB: boolean;
    setUseWandB: (value: boolean) => void;
    setWandbSettingsVisible: (visible: boolean) => void;
    reportTo: string;
    setReportTo: (value: string) => void;
}

const FineTuningSettings: React.FC<FineTuningSettingsProps> = ({
    usePeft,
    setUsePeft,
    setPeftSettingsVisible,
    useDeepSpeed,
    setUseDeepSpeed,
    setDeepspeedSettingsVisible,
    useQuantization,
    setUseQuantization,
    setQuantizationSettingsVisible,
    useHF,
    setUseHF,
    setHfSettingsVisible,
    useWandB,
    setUseWandB,
    setWandbSettingsVisible,
    reportTo,
    setReportTo
}) => {
    const [loading, setLoading] = useState(false);

    const handleDeepSpeedChange = async (checked: boolean) => {
        if (checked) {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8000/api/v1/gpu-info');
                const { gpu_count } = response.data;
                if (gpu_count < 2) {
                    message.error('DeepSpeed는 단일 GPU에서 활성화할 수 없습니다.');
                    setUseDeepSpeed(false);
                } else {
                    setUseDeepSpeed(true);
                }
            } catch (error) {
                message.error('GPU 정보를 확인하는 데 실패했습니다.');
                setUseDeepSpeed(false);
            } finally {
                setLoading(false);
            }
        } else {
            setUseDeepSpeed(false);
        }
    };

    return (
        <Form layout="vertical">
            <Form.Item label="Use PEFT">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={usePeft} onChange={setUsePeft} />
                    {usePeft && (
                        <Tooltip title="PEFT Settings">
                            <Button
                                type="link"
                                icon={<SettingOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => setPeftSettingsVisible(true)}
                                style={{ marginLeft: 8 }}
                            />
                        </Tooltip>
                    )}
                </div>
            </Form.Item>
            <Form.Item label="Use DeepSpeed">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={useDeepSpeed} onChange={handleDeepSpeedChange} loading={loading} />
                    {useDeepSpeed && (
                        <Tooltip title="DeepSpeed Settings">
                            <Button
                                type="link"
                                icon={<SettingOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => setDeepspeedSettingsVisible(true)}
                                style={{ marginLeft: 8 }}
                            />
                        </Tooltip>
                    )}
                </div>
            </Form.Item>
            <Form.Item label="Use Quantization">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={useQuantization} onChange={setUseQuantization} />
                    {useQuantization && (
                        <Tooltip title="Quantization Settings">
                            <Button
                                type="link"
                                icon={<SettingOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => setQuantizationSettingsVisible(true)}
                                style={{ marginLeft: 8 }}
                            />
                        </Tooltip>
                    )}
                </div>
            </Form.Item>
            <Form.Item label="Use Hugging Face">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={useHF} onChange={setUseHF} />
                    {useHF && (
                        <Tooltip title="Hugging Face Settings">
                            <Button
                                type="link"
                                icon={<SettingOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => setHfSettingsVisible(true)}
                                style={{ marginLeft: 8 }}
                            />
                        </Tooltip>
                    )}
                </div>
            </Form.Item>
            <Form.Item label="Use WandB">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={useWandB} onChange={setUseWandB} />
                    {useWandB && (
                        <Tooltip title="WandB Settings">
                            <Button
                                type="link"
                                icon={<SettingOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => setWandbSettingsVisible(true)}
                                style={{ marginLeft: 8 }}
                            />
                        </Tooltip>
                    )}
                </div>
            </Form.Item>
        </Form>
    );
};

export default FineTuningSettings;