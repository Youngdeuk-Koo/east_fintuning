import React, { useEffect, useState } from 'react';
import { List, Typography, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const RecentFineTuningRecords: React.FC = () => {
    const [records, setRecords] = useState<any[]>([]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/recent-fine-tuning-records');
                setRecords(response.data);
            } catch (error) {
                message.error('Error fetching recent fine-tuning records.');
            }
        };

        fetchRecords();
    }, []);

    return (
        <List
            itemLayout="horizontal"
            dataSource={records}
            renderItem={record => (
                <List.Item>
                    <List.Item.Meta
                        title={record.modelName}
                        description={`상태: ${record.status} | 날짜: ${record.date}`}
                    />
                </List.Item>
            )}
        />
    );
};

export default RecentFineTuningRecords;