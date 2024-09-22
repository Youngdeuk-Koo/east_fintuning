import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

interface TrainingArgsModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    settings: any;
    onChange: (key: string, value: any) => void;
    metrics: string[];
    setMetrics: (metrics: string[]) => void;
    useWandB: boolean;
    useQuantization: boolean; // 추가된 부분
}

const TrainingArgsModal: React.FC<TrainingArgsModalProps> = ({
    visible,
    onCancel,
    onOk,
    settings,
    onChange,
    metrics,
    setMetrics,
    useWandB,
    useQuantization // 추가된 부분
}) => {
    const availableMetrics = [
        'eval_loss',
        'eval_mse',
        'eval_accuracy',
        'BLEU',
        'ROUGE',
        'METEOR',
        'CIDEr',
        'SPICE',
        'Perplexity',
        'F1 Score'
    ];

    const handleMetricChange = (value: string[]) => {
        setMetrics(value);
        // Reset metric_for_best_model if it's not in the selected metrics
        if (!value.includes(settings.metric_for_best_model)) {
            onChange('metric_for_best_model', '');
        }
    };

    return (
        <Modal
            title="Training Args"
            visible={visible}
            onCancel={onCancel}
            onOk={onOk}
            okText="Run Train"
        >
            <Form layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Output Directory">
                            <Input value={settings.output_dir} onChange={(e) => onChange('output_dir', e.target.value)} />
                            <Tooltip title="Output Directory: 출력 디렉토리 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Number of Epochs">
                            <InputNumber min={1} value={settings.num_train_epochs} onChange={(value) => onChange('num_train_epochs', value)} />
                            <Tooltip title="Number of Epochs: 에포크 수 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Train Batch Size">
                            <InputNumber min={1} value={settings.per_device_train_batch_size} onChange={(value) => onChange('per_device_train_batch_size', value)} />
                            <Tooltip title="Train Batch Size: 훈련 배치 크기 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Eval Batch Size">
                            <InputNumber min={1} value={settings.per_device_eval_batch_size} onChange={(value) => onChange('per_device_eval_batch_size', value)} />
                            <Tooltip title="Eval Batch Size: 평가 배치 크기 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Gradient Accumulation Steps">
                            <InputNumber 
                                min={1} 
                                value={settings.gradient_accumulation_steps} 
                                onChange={(value) => onChange('gradient_accumulation_steps', value)} 
                                disabled={useQuantization} // 수정된 부분
                            />
                            <Tooltip title="Gradient Accumulation Steps: 그래디언트 누적 단계 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Eval Accumulation Steps">
                            <InputNumber min={1} value={settings.eval_accumulation_steps} onChange={(value) => onChange('eval_accumulation_steps', value)} />
                            <Tooltip title="Eval Accumulation Steps: 평가 누적 단계 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Save Steps">
                            <InputNumber min={1} value={settings.save_steps} onChange={(value) => onChange('save_steps', value)} />
                            <Tooltip title="Save Steps: 저장 단계 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Save Total Limit">
                            <InputNumber min={1} value={settings.save_total_limit} onChange={(value) => onChange('save_total_limit', value)} />
                            <Tooltip title="Save Total Limit: 총 저장 제한 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Eval Strategy">
                            <Select value={settings.eval_strategy} onChange={(value) => onChange('eval_strategy', value)}>
                                <Option value="steps">Steps</Option>
                                <Option value="epoch">Epoch</Option>
                            </Select>
                            <Tooltip title="Eval Strategy: 평가 전략 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Eval Steps">
                            <InputNumber min={1} value={settings.eval_steps} onChange={(value) => onChange('eval_steps', value)} />
                            <Tooltip title="Eval Steps: 평가 단계 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Logging Strategy">
                            <Select value={settings.logging_strategy} onChange={(value) => onChange('logging_strategy', value)}>
                                <Option value="steps">Steps</Option>
                                <Option value="epoch">Epoch</Option>
                            </Select>
                            <Tooltip title="Logging Strategy: 로깅 전략 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Logging Steps">
                            <InputNumber min={1} value={settings.logging_steps} onChange={(value) => onChange('logging_steps', value)} />
                            <Tooltip title="Logging Steps: 로깅 단계 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Load Best Model at End">
                            <Switch checked={settings.load_best_model_at_end} onChange={(checked) => onChange('load_best_model_at_end', checked)} />
                            <Tooltip title="Load Best Model at End: 최종 모델 로드 여부 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Select Metrics">
                            <Select
                                mode="multiple"
                                placeholder="Select metrics"
                                value={metrics}
                                onChange={handleMetricChange}
                                style={{ width: '100%' }}
                            >
                                {availableMetrics.map(metric => (
                                    <Option key={metric} value={metric}>
                                        {metric}
                                    </Option>
                                ))}
                            </Select>                            
                            <Tooltip title="측정할 메트릭 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Greater is Better">
                            <Switch checked={settings.greater_is_better} onChange={(checked) => onChange('greater_is_better', checked)} />
                            <Tooltip title="Greater is Better: 더 큰 값이 더 나은지 여부 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Metric for Best Model">
                            <Select
                                value={settings.metric_for_best_model}
                                onChange={(value) => onChange('metric_for_best_model', value)}
                                disabled={metrics.length === 0} // Disable if no metrics are selected
                            >
                                {metrics.map(metric => (
                                    <Option key={metric} value={metric}>
                                        {metric}
                                    </Option>
                                ))}
                            </Select>
                            <Tooltip title="Metric for Best Model: 최적 모델을 위한 메트릭 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="FP16">
                            <Switch 
                                checked={settings.fp16} 
                                onChange={(checked) => onChange('fp16', checked)} 
                                disabled={useQuantization} // 수정된 부분
                            />
                            <Tooltip title="FP16: FP16 사용 여부 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Learning Rate">
                            <InputNumber min={1e-6} step={1e-6} value={settings.learning_rate} onChange={(value) => onChange('learning_rate', value)} />
                            <Tooltip title="Learning Rate: 학습률 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Warmup Steps">
                            <InputNumber min={0} value={settings.warmup_steps} onChange={(value) => onChange('warmup_steps', value)} />
                            <Tooltip title="Warmup Steps: 워밍업 단계 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Weight Decay">
                            <InputNumber min={0} step={0.01} value={settings.weight_decay} onChange={(value) => onChange('weight_decay', value)} />
                            <Tooltip title="Weight Decay: 가중치 감쇠 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Max Grad Norm">
                            <InputNumber min={0} step={0.1} value={settings.max_grad_norm} onChange={(value) => onChange('max_grad_norm', value)} />
                            <Tooltip title="Max Grad Norm: 최대 그래디언트 노름 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Gradient Checkpointing">
                            <Switch 
                                checked={settings.gradient_checkpointing} 
                                onChange={(checked) => onChange('gradient_checkpointing', checked)} 
                                disabled={useQuantization} // 수정된 부분
                            />
                            <Tooltip title="Gradient Checkpointing: 그래디언트 체크포인팅 사용 여부 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                <Col span={24}>
                        <Form.Item label="Report to">
                            <Input
                                value={settings.report_to}
                                onChange={(e) => onChange('report_to', e.target.value)}
                                disabled={useWandB} // useWandB가 true일 때 비활성화
                            />
                            <Tooltip title="Report to: 보고할 대상 설정">
                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default TrainingArgsModal;