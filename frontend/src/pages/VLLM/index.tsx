import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Spin, Alert } from 'antd';

const ModelServe = () => {
    const [modelName, setModelName] = useState('');
    const [serverInfo, setServerInfo] = useState<{ ip: string, port: number, memory_used: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleServeModel = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/v1/serve_model', { model_name: modelName });
            setServerInfo(response.data);
        } catch (error) {
            console.error('Error serving model:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Input 
                value={modelName} 
                onChange={(e) => setModelName(e.target.value)} 
                placeholder="Enter model name" 
                style={{ marginBottom: '10px' }}
            />
            <Button type="primary" onClick={handleServeModel} disabled={loading}>
                Serve Model
            </Button>
            {loading && <Spin style={{ marginLeft: '10px' }} />}
            {serverInfo && (
                <div style={{ marginTop: '20px' }}>
                    <Alert 
                        message="Server Information"
                        description={
                            <div>
                                <p>Server IP: {serverInfo.ip}</p>
                                <p>Server Port: {serverInfo.port}</p>
                                <p>Memory Used: {serverInfo.memory_used.toFixed(2)} GB</p>
                            </div>
                        }
                        type="info"
                    />
                </div>
            )}
        </div>
    );
};

export default ModelServe;