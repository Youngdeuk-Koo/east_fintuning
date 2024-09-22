import React from 'react';
import { Form, Input } from 'antd';

interface ProjectSettingsProps {
    modelAlias: string;
    setModelAlias: (value: string) => void;
    modelSize: string;
    setModelSize: (value: string) => void;
    mainProjectName: string;
    setMainProjectName: (value: string) => void;
    subProjectName: string;
    setSubProjectName: (value: string) => void;
    workerName: string;
    setWorkerName: (value: string) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
    modelAlias,
    setModelAlias,
    modelSize,
    setModelSize,
    mainProjectName,
    setMainProjectName,
    subProjectName,
    setSubProjectName,
    workerName,
    setWorkerName
}) => {
    return (
        <Form layout="vertical">
            <Form.Item label="Model Alias">
                <Input value={modelAlias} onChange={(e) => setModelAlias(e.target.value)} />
            </Form.Item>
            <Form.Item label="Model Size">
                <Input value={modelSize} onChange={(e) => setModelSize(e.target.value)} />
            </Form.Item>
            <Form.Item label="Main Project Name">
                <Input value={mainProjectName} onChange={(e) => setMainProjectName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Sub Project Name">
                <Input value={subProjectName} onChange={(e) => setSubProjectName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Worker Name">
                <Input value={workerName} onChange={(e) => setWorkerName(e.target.value)} />
            </Form.Item>
        </Form>
    );
};

export default ProjectSettings;