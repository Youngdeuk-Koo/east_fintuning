import React from 'react';
import { Form, Select } from 'antd';

const { Option } = Select;

interface MetricsSettingsProps {
    metrics: string[];
    setMetrics: (metrics: string[]) => void;
}

const MetricsSettings: React.FC<MetricsSettingsProps> = ({ metrics, setMetrics }) => {
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
    };

    return (
        <Form layout="vertical">
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
            </Form.Item>
        </Form>
    );
};

export default MetricsSettings;