import React, { useEffect, useState, useRef } from 'react';
import { List, Typography, message } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

interface GPUInfo {
    name: string;
    total_memory: number;
    memory_allocated: number;
    memory_reserved: number;
    memory_free: number;
    utilization: number;
}

interface GPUInfoProps {
    isTraining: boolean;
}

const GPUInfo: React.FC<GPUInfoProps> = ({ isTraining }) => {
    const [gpuInfo, setGpuInfo] = useState<GPUInfo[]>([]);
    const prevGpuInfo = useRef<GPUInfo[]>(gpuInfo);

    const fetchGPUInfo = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/gpu-info');
            prevGpuInfo.current = gpuInfo;
            setGpuInfo(response.data.gpus);
        } catch (error) {
            console.error('Error fetching GPU information:', error);
            message.error('Error fetching GPU information.');
        }
    };

    useEffect(() => {
        fetchGPUInfo();
        const interval = setInterval(fetchGPUInfo, 10000); // 10초마다 정보 갱신
        return () => clearInterval(interval);
    }, [isTraining]);

    useEffect(() => {
        prevGpuInfo.current = gpuInfo;
    }, [gpuInfo]);

    const getMemoryChangeIcon = (current: number, previous: number) => {
        if (current > previous) {
            return <span style={{ color: 'red', marginLeft: '8px' }}>🔺</span>;
        } else if (current < previous) {
            return <span style={{ color: 'green', marginLeft: '8px' }}>🔻</span>;
        } else {
            return <span style={{ marginLeft: '8px' }}>➖</span>;
        }
    };

    return (
        <List
            itemLayout="horizontal"
            dataSource={gpuInfo}
            renderItem={(gpu, index) => {
                const prevGpu = prevGpuInfo.current[index] || gpu;
                return (
                    <List.Item>
                        <List.Item.Meta
                            description={
                                <div>
                                    <p><Text strong>GPU:</Text> <Text>{gpu.name}</Text></p>
                                    <p><Text strong>총 메모리:</Text> <Text>{(gpu.total_memory / (1024 ** 3)).toFixed(2)} GB</Text></p>
                                    <p>
                                        <Text strong>할당된 메모리:</Text> 
                                        <Text>{(gpu.memory_allocated / (1024 ** 3)).toFixed(2)} GB</Text>
                                        {getMemoryChangeIcon(gpu.memory_allocated, prevGpu.memory_allocated)}
                                    </p>
                                    <p>
                                        <Text strong>예약된 메모리:</Text> 
                                        <Text>{(gpu.memory_reserved / (1024 ** 3)).toFixed(2)} GB</Text>
                                        {getMemoryChangeIcon(gpu.memory_reserved, prevGpu.memory_reserved)}
                                    </p>
                                    <p>
                                        <Text strong>사용 가능한 메모리:</Text> 
                                        <Text>{(gpu.memory_free / (1024 ** 3)).toFixed(2)} GB</Text>
                                        {getMemoryChangeIcon(gpu.memory_free, prevGpu.memory_free)}
                                    </p>
                                    <p>
                                        <Text strong>메모리 사용률:</Text> 
                                        <Text>{((gpu.memory_reserved / gpu.total_memory) * 100).toFixed(2)}%</Text>
                                        {getMemoryChangeIcon(gpu.memory_reserved / gpu.total_memory, prevGpu.memory_reserved / prevGpu.total_memory)}
                                    </p>
                                </div>
                            }
                        />
                    </List.Item>
                );
            }}
        />
    );
};

export default GPUInfo;