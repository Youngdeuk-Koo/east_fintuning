import React, { useState, useEffect } from 'react';
import { Progress, Button, Tooltip, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

interface FineTuningStatusProps {
    taskStatus: string | null;
    taskId: string | null;
    handleStopFineTune: () => void;
}

const FineTuningStatus: React.FC<FineTuningStatusProps> = ({ taskStatus, taskId, handleStopFineTune }) => {
    const [progress, setProgress] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
        if (!taskId) return;

        if (!startTime) {
            setStartTime(Date.now());
        }

        const fetchProgress = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/v1/progress/${taskId}`);
                const data = response.data;
                console.log("Received progress:", data);  // 로그 추가
                const totalSteps = data.total_steps || 1;  // 총 스텝 수
                const currentStep = data.step || 0;  // 현재 스텝
                const progressPercentage = (currentStep / totalSteps) * 100;
                setProgress(progressPercentage);
                if (data.status === "completed" || data.status === "failed") {
                    clearInterval(progressInterval);
                    clearInterval(timeInterval);
                }
            } catch (error) {
                console.error("Error fetching progress:", error);
                clearInterval(progressInterval);
                clearInterval(timeInterval);
            }
        };

        const progressInterval = setInterval(fetchProgress, 5000); // 5초마다 요청
        const timeInterval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime!) / 1000)); // 1초마다 경과 시간 업데이트
        }, 1000); // 1초마다 경과 시간 업데이트

        return () => {
            clearInterval(progressInterval);
            clearInterval(timeInterval);
        };
    }, [taskId, startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Progress 
                percent={parseFloat(progress.toFixed(2))} 
                style={{ width: '80%', fontSize: '20px' }} 
                strokeWidth={15} 
            />
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', width: '80%' }}>
                <Text style={{ fontSize: '18px' }}>Elapsed Time: {formatTime(elapsedTime)}</Text>
                <Tooltip title="Early stopping may occur. This means the training process might stop before completion if certain conditions are met.">
                    <ExclamationCircleOutlined style={{ color: 'red', fontSize: '18px' }} />
                </Tooltip>
            </div>
            <Button type="primary" danger onClick={handleStopFineTune} style={{ marginTop: 16, fontSize: '18px' }}>
                Stop Training
            </Button>
        </div>
    );
};

export default FineTuningStatus;