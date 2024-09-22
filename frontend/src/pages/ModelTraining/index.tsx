import React, { useState, useEffect } from 'react';
import { Button, message, Card, Row, Col, Modal, Typography, Space } from 'antd';
import { RocketOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import PeftSettingsModal from './PeftSettingsModal';
import DeepSpeedSettingsModal from './DeepSpeedSettingsModal';
import QuantizationSettingsModal from './QuantizationSettingsModal';
import TrainingArgsModal from './TrainingArgsModal';
import HuggingFaceSettingsModal from './HuggingFaceSettingsModal';
import WandBSettingsModal from './WandBSettingsModal';
import FineTuningSettings from './FineTuningSettings';
import ProjectSettings from './ProjectSettings';
import RecentFineTuningRecords from './RecentFineTuningRecords';
import GPUInfo from './GPUInfo';
import FineTuningStatus from './FineTuningStatus';

const { Title, Text } = Typography;

const FineTuning: React.FC = () => {
    const [modelAlias, setModelAlias] = useState<string>('');
    const [modelSize, setModelSize] = useState<string>('');
    const [mainProjectName, setMainProjectName] = useState<string>('');
    const [subProjectName, setSubProjectName] = useState<string>('');
    const [workerName, setWorkerName] = useState<string>('');
    const [usePeft, setUsePeft] = useState<boolean>(false);
    const [useDeepSpeed, setUseDeepSpeed] = useState<boolean>(false);
    const [useQuantization, setUseQuantization] = useState<boolean>(false);
    const [useHF, setUseHF] = useState<boolean>(false);
    const [useWandB, setUseWandB] = useState<boolean>(false);
    const [metrics, setMetrics] = useState<string[]>([]);
    const [taskStatus, setTaskStatus] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [trainResult, setTrainResult] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [peftSettingsVisible, setPeftSettingsVisible] = useState<boolean>(false);
    const [deepspeedSettingsVisible, setDeepspeedSettingsVisible] = useState<boolean>(false);
    const [quantizationSettingsVisible, setQuantizationSettingsVisible] = useState<boolean>(false);
    const [trainingArgsVisible, setTrainingArgsVisible] = useState<boolean>(false);
    const [hfSettingsVisible, setHfSettingsVisible] = useState<boolean>(false);
    const [wandbSettingsVisible, setWandbSettingsVisible] = useState<boolean>(false);
    const [reportTo, setReportTo] = useState<string>('');
    const [hfUsername, setHfUsername] = useState<string>('gravy0106');
    const [hfToken, setHfToken] = useState<string>('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');
    const [wandbToken, setWandbToken] = useState<string>('3691caf9135730de2e793175533d3d8ceb32d610');
    const [advancedSettings, setAdvancedSettings] = useState<any>({
        output_dir: '/data/train',
        num_train_epochs: 10,
        per_device_train_batch_size: 2,
        per_device_eval_batch_size: 2,
        gradient_accumulation_steps: 16,
        eval_accumulation_steps: 10,
        save_steps: 10,
        save_total_limit: 3,
        eval_steps: 10,
        logging_steps: 1,
        learning_rate: 1e-4,
        warmup_steps: 100,
        weight_decay: 0.01,
        max_grad_norm: 0.5,
        fp16: true,
        gradient_checkpointing: true,
        deepspeed_config: null,
        hf_username: 'gravy0106',
        hf_token: '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',
        wandb_token: '3691caf9135730de2e793175533d3d8ceb32d610',
        metric_for_best_model: 'eval_loss',
        greater_is_better: false,
        report_to: ''
    });
    const [trainingModalVisible, setTrainingModalVisible] = useState<boolean>(false);
    const [gpuInfo, setGpuInfo] = useState<any>({ gpu_count: 0, gpus: [] }); // GPU 정보 상태 추가

    useEffect(() => {
        const savedTaskStatus = localStorage.getItem('taskStatus');
        const savedTaskId = localStorage.getItem('taskId');
        if (savedTaskStatus) setTaskStatus(savedTaskStatus);
        if (savedTaskId) setTaskId(savedTaskId);

        if (savedTaskId) {
            const fetchTaskStatus = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/v1/progress/${savedTaskId}`);
                    setTaskStatus(response.data.status);
                    if (response.data.status === 'completed') {
                        // Fetch training result if needed
                    }
                } catch (error) {
                    message.error('Error fetching task status.');
                }
            };
            fetchTaskStatus();
        }

        // GPU 정보 가져오기
        const fetchGpuInfo = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/gpu-info');
                setGpuInfo(response.data);
            } catch (error) {
                message.error('Error fetching GPU information.');
            }
        };
        fetchGpuInfo();
    }, []);

    useEffect(() => {
        if (taskStatus) localStorage.setItem('taskStatus', taskStatus);
        if (taskId) localStorage.setItem('taskId', taskId);
    }, [taskStatus, taskId]);

    const handleFineTune = async () => {
        setTrainingArgsVisible(true);
    };

    const handleStartFineTune = async () => {
        setLoading(true);
        try {
            const requestData = {
                modelAlias,
                modelSize,
                mainProjectName,
                subProjectName,
                workerName,
                usePeft,
                useDeepSpeed,
                quantizationType: useQuantization ? 'some_quantization_type' : '',
                useHF,
                useWandB,
                metrics,
                advancedSettings: {
                    ...advancedSettings,
                    fp16: useQuantization ? false : advancedSettings.fp16,
                    gradient_checkpointing: useQuantization ? false : advancedSettings.gradient_checkpointing,
                    gradient_accumulation_steps: useQuantization ? null : advancedSettings.gradient_accumulation_steps,
                    report_to: useWandB ? '' : reportTo,
                    hf_username: hfUsername,
                    hf_token: hfToken,
                    wandb_token: wandbToken
                }
            };

            console.log("Request Data:", requestData);

            const response = await axios.post('http://localhost:8000/api/v1/fine-tune', requestData);
            setTaskId(response.data.task_id);
            setTaskStatus(response.data.status);
            setTrainingModalVisible(true);
            message.success('Fine-tuning started successfully.');
        } catch (error: any) {
            message.error('Error starting fine-tuning.');
        } finally {
            setLoading(false);
            setTrainingArgsVisible(false);
            if (taskStatus !== 'in_progress') {
                localStorage.removeItem('taskStatus');
                localStorage.removeItem('taskId');
            }
        }
    };

    const handleStopFineTune = async () => {
        if (!taskId) return;
        try {
            const response = await axios.post(`http://localhost:8000/api/v1/stop-fine-tune/${taskId}`);
            setTaskStatus(response.data.status);
            setTrainingModalVisible(false);
            message.success('Fine-tuning stopped successfully.');
        } catch (error: any) {
            message.error('Error stopping fine-tuning.');
        } finally {
            if (taskStatus !== 'in_progress') {
                localStorage.removeItem('taskStatus');
                localStorage.removeItem('taskId');
            }
        }
    };

    useEffect(() => {
        if (taskStatus === 'in_progress') {
            const interval = setInterval(async () => {
                if (taskId) {
                    try {
                        const response = await axios.get(`http://localhost:8000/api/v1/progress/${taskId}`);
                        setTaskStatus(response.data.status);
                        if (response.data.status === 'completed') {
                            // Fetch training result if needed
                            message.success('Training completed successfully.');
                            setTrainingModalVisible(false);
                        } else if (response.data.status === 'failed') {
                            message.error('Training failed. Please check the logs for more details.');
                            setTrainingModalVisible(false);
                        }

                        // Check GPU memory usage
                        const gpuResponse = await axios.get('http://localhost:8000/api/v1/gpu-info');
                        setGpuInfo(gpuResponse.data);
                        if (gpuResponse.data.gpus.some(gpu => gpu.memory_used < 2048)) {
                            message.error('Training stopped due to insufficient GPU memory.');
                            setTaskStatus('failed');
                            setTrainingModalVisible(false);
                        }
                    } catch (error) {
                        message.error('Error fetching task status.');
                    }
                }
            }, 10000);
            return () => clearInterval(interval);
        } else if (taskStatus === 'completed' || taskStatus === 'failed') {
            setTrainingModalVisible(false);
        }
    }, [taskStatus, taskId]);

    const handleSettingsChange = (key: string, value: any) => {
        setAdvancedSettings((prevSettings: any) => ({
            ...prevSettings,
            [key]: value
        }));
    };

    const handleDeepSpeedChange = async (checked: boolean) => {
        if (checked) {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/gpu-info');
                const { gpu_count } = response.data;
                if (gpu_count < 2) {
                    message.warning('단일 GPU는 DeepSpeed를 활성화할 수 없습니다.');
                    setUseDeepSpeed(false);
                    return;
                }
            } catch (error) {
                message.error('GPU 정보를 가져오는 중 오류가 발생했습니다.');
                setUseDeepSpeed(false);
                return;
            }
        }
        setUseDeepSpeed(checked);
    };

    const FineTuningTrigger = ({ onClick, loading }) => (
        <Card 
            hoverable 
            style={{ width: '100%', marginBottom: 16, background: '#f0f5ff', border: '1px solid #1890ff', height: '200px' }} // height 속성 추가
            bodyStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }} // 가운데 정렬
            onClick={onClick} // Card에 onClick 핸들러 추가
        >
            <Space direction="vertical" size="large" align="center">
                <RocketOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                <div style={{ textAlign: 'center' }}>
                    <Title level={3} style={{ marginBottom: 0 }}>Start Fine-tuning</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>Configure and begin your model training</Text>
                </div>
            </Space>
            {loading && <Button type="primary" size="large" loading={loading} />}
        </Card>
    );

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card title="Project Settings" bordered={false} style={{ height: '100%' }}>
                        <ProjectSettings
                            modelAlias={modelAlias}
                            setModelAlias={setModelAlias}
                            modelSize={modelSize}
                            setModelSize={setModelSize}
                            mainProjectName={mainProjectName}
                            setMainProjectName={setMainProjectName}
                            subProjectName={subProjectName}
                            setSubProjectName={setSubProjectName}
                            workerName={workerName}                    
                            setWorkerName={setWorkerName}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Fine-tuning Settings" bordered={false} style={{ height: '100%' }}>
                        <FineTuningSettings
                            usePeft={usePeft}
                            setUsePeft={setUsePeft}
                            setPeftSettingsVisible={setPeftSettingsVisible}
                            useDeepSpeed={useDeepSpeed}
                            setUseDeepSpeed={handleDeepSpeedChange} // handleDeepSpeedChange로 변경
                            setDeepspeedSettingsVisible={setDeepspeedSettingsVisible}
                            useQuantization={useQuantization}
                            setUseQuantization={setUseQuantization}
                            setQuantizationSettingsVisible={setQuantizationSettingsVisible}
                            useHF={useHF}
                            setUseHF={setUseHF}
                            setHfSettingsVisible={setHfSettingsVisible}
                            useWandB={useWandB}
                            setUseWandB={setUseWandB}
                            setWandbSettingsVisible={setWandbSettingsVisible}
                            reportTo={reportTo}
                            setReportTo={setReportTo}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Recent Fine-tuning Records" bordered={false} style={{ height: '100%' }}>
                        <RecentFineTuningRecords />
                    </Card>
                </Col>
            </Row>
            <Row style={{ marginTop: '16px' }}>
                <Col span={24}>
                    <Card bordered={false}> {/* title 속성 제거 */}
                        {taskStatus !== 'in_progress' ? (
                            <FineTuningTrigger onClick={handleFineTune} loading={loading} />
                        ) : (
                            <FineTuningStatus taskStatus={taskStatus} taskId={taskId} handleStopFineTune={handleStopFineTune} />
                        )}
                        {taskStatus === 'completed' && trainResult && (
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Training completed successfully.</div>
                                <pre>{JSON.stringify(trainResult, null, 2)}</pre>
                            </div>
                        )}
                        {taskStatus === 'failed' && (
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'red' }}>Fine-tuning failed. Please check the logs for more details.</div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
            <PeftSettingsModal
                visible={peftSettingsVisible}
                onCancel={() => setPeftSettingsVisible(false)}
                onOk={() => setPeftSettingsVisible(false)}
                settings={advancedSettings}
                onChange={handleSettingsChange}
            />
            <DeepSpeedSettingsModal
                visible={deepspeedSettingsVisible}
                onCancel={() => setDeepspeedSettingsVisible(false)}
                onOk={() => setDeepspeedSettingsVisible(false)}
                settings={advancedSettings}
                onChange={handleSettingsChange}
            />
            <QuantizationSettingsModal
                visible={quantizationSettingsVisible}
                onCancel={() => setQuantizationSettingsVisible(false)}
                onOk={() => setQuantizationSettingsVisible(false)}
                settings={advancedSettings}
                onChange={handleSettingsChange}
            />
            <HuggingFaceSettingsModal
                visible={hfSettingsVisible}
                onCancel={() => setHfSettingsVisible(false)}
                onOk={() => setHfSettingsVisible(false)}
                hfUsername={hfUsername}
                setHfUsername={setHfUsername}
                hfToken={hfToken}
                setHfToken={setHfToken}
            />
            <WandBSettingsModal
                visible={wandbSettingsVisible}
                onCancel={() => setWandbSettingsVisible(false)}
                onOk={() => setWandbSettingsVisible(false)}
                wandbToken={wandbToken}
                setWandbToken={setWandbToken}
            />
            <TrainingArgsModal
                visible={trainingArgsVisible}
                onCancel={() => setTrainingArgsVisible(false)}
                onOk={handleStartFineTune}
                settings={advancedSettings}
                onChange={handleSettingsChange}
                metrics={metrics}
                setMetrics={setMetrics}
                useWandB={useWandB}
                useQuantization={useQuantization}
            />
            <Modal
                visible={trainingModalVisible}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
                width={800}
            >
                <FineTuningStatus taskStatus={taskStatus} taskId={taskId} handleStopFineTune={handleStopFineTune} />
                <GPUInfo isTraining={taskStatus === 'in_progress'} />
                <div style={{ marginTop: 20 }}>
                    <h3>Training Settings</h3>
                    <pre>{JSON.stringify(advancedSettings, null, 2)}</pre>
                </div>
            </Modal>
        </div>
    );
};

export default FineTuning;