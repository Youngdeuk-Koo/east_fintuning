import React, { useState, useEffect } from 'react';
import { Upload, message, Modal, Button, Table, Spin, Select, Form, InputNumber, Card, Collapse, Progress, Row, Col, Divider } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import './DataProcessing.css';
import { CommonProps } from '../../components/type';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import WordCloudComponent from '../../components/WordCloudComponent';
import { useGlobalState } from '../../context/GlobalStateContext';

const { Dragger } = Upload;
const { Option } = Select;
const { Panel } = Collapse;

// Chart.js의 차트 타입을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DataRow {
    [key: string]: any;
}

const DataProcessing: React.FC = () => {
    const { setModel, setTokenizer, setModelName } = useGlobalState();
    const [columns, setColumns] = useState<any[]>([]);
    const [data, setData] = useState<DataRow[]>([]);
    const [sentenceLengths, setSentenceLengths] = useState<any[]>([]);
    const [wordFreq, setWordFreq] = useState<{ text: string, value: number }[]>([]);
    const [tfidfScores, setTfidfScores] = useState<{ [key: string]: { text: string, value: number }[] }>({});
    const [columnStats, setColumnStats] = useState<{ [key: string]: { min: number, max: number, avg: number } }>({});
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [dataType, setDataType] = useState<string | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({
        system: 'None',
        user: 'None',
        label: 'None'
    });
    const [tokenizerSettings, setTokenizerSettings] = useState({
        padding: true,
        truncation: true,
        max_length: null,
        return_tensors: 'pt',
        return_attention_mask: true,
        add_special_tokens: true,
        return_token_type_ids: false,
        return_special_tokens_mask: false,
        return_offsets_mapping: false,
        is_split_into_words: false,
    });
    const [testSetRatio, setTestSetRatio] = useState<number>(0.2);
    const [shuffle, setShuffle] = useState<boolean>(true);
    const [randomState, setRandomState] = useState<number | null>(null);
    const [activeKey, setActiveKey] = useState<string[]>([]);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<string | null>(null);
    const [datasetSample, setDatasetSample] = useState<any>(null);
    const [createDatasetError, setCreateDatasetError] = useState<boolean>(false);
    const [trainSize, setTrainSize] = useState<number | null>(null);
    const [testSize, setTestSize] = useState<number | null>(null);
    const [maxSequenceLength, setMaxSequenceLength] = useState<number | null>(null);  // 시퀀스 최대 길이 상태 추가

    // 컴포넌트가 마운트될 때 sessionStorage에서 데이터 복원
    useEffect(() => {
        const savedColumns = sessionStorage.getItem('columns');
        const savedData = sessionStorage.getItem('data');
        const savedError = sessionStorage.getItem('error');
        const savedDataType = sessionStorage.getItem('dataType');
        const savedSentenceLengths = sessionStorage.getItem('sentenceLengths');
        const savedWordFreq = sessionStorage.getItem('wordFreq');
        const savedTfidfScores = sessionStorage.getItem('tfidfScores');
        const savedColumnStats = sessionStorage.getItem('columnStats');

        if (savedColumns) setColumns(JSON.parse(savedColumns));
        if (savedData) setData(JSON.parse(savedData));
        if (savedError) setError(savedError);
        if (savedDataType) setDataType(savedDataType);
        if (savedSentenceLengths) setSentenceLengths(JSON.parse(savedSentenceLengths));
        if (savedWordFreq) setWordFreq(JSON.parse(savedWordFreq));
        if (savedTfidfScores) setTfidfScores(JSON.parse(savedTfidfScores));
        if (savedColumnStats) setColumnStats(JSON.parse(savedColumnStats));
    }, []);

    useEffect(() => {
        // 상태가 변경될 때마다 sessionStorage에 저장
        sessionStorage.setItem('columns', JSON.stringify(columns));
        sessionStorage.setItem('data', JSON.stringify(data));
        if (error) {
            sessionStorage.setItem('error', error);
        } else {
            sessionStorage.removeItem('error');
        }
        if (dataType) {
            sessionStorage.setItem('dataType', dataType);
        } else {
            sessionStorage.removeItem('dataType');
        }
        sessionStorage.setItem('sentenceLengths', JSON.stringify(sentenceLengths));
        sessionStorage.setItem('wordFreq', JSON.stringify(wordFreq));
        sessionStorage.setItem('tfidfScores', JSON.stringify(tfidfScores));
        sessionStorage.setItem('columnStats', JSON.stringify(columnStats));
    }, [columns, data, error, dataType, sentenceLengths, wordFreq, tfidfScores, columnStats]);

    // 새로고침 시 데이터 초기화
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.clear();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // columns가 업데이트될 때 activeKey 설정
    useEffect(() => {
        if (columns.length > 0) {
            setActiveKey(['columns']);
        }
    }, [columns]);

    useEffect(() => {
        if (taskId) {
            const interval = setInterval(async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/v1/dataset-status/${taskId}`);
                    setTaskStatus(response.data.status);
                    if (response.data.status === 'completed') {
                        setDatasetSample(response.data.sample_data); // 첫 번째 데이터 샘플 설정
                        setTrainSize(response.data.train_size);
                        setTestSize(response.data.test_size);
                        setMaxSequenceLength(response.data.max_sequence_length);
                        clearInterval(interval);
                    } else if (response.data.status === 'failed') {
                        setError(response.data.error);
                        clearInterval(interval);
                    }
                } catch (error: any) {
                    setError(error.response?.data?.detail || '작업 상태를 확인하는 중 오류가 발생했습니다.');
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [taskId]);

    const handleUpload = async (file: File) => {
        // 새로운 파일 업로드 시 기존 데이터 초기화
        setColumns([]);
        setData([]);
        setDataType(null);
        setSentenceLengths([]);
        setWordFreq([]);
        setTfidfScores({});
        setColumnStats({});
        setError(null);
        setIsModalVisible(false);
        setTaskId(null);
        setTaskStatus(null);
        setDatasetSample(null);
        setTrainSize(null);
        setTestSize(null);
        setMaxSequenceLength(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/v1/uploadfile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setColumns(response.data.columns.map((col: string, index: number) => ({
                title: col,
                dataIndex: col,
                key: col,
                className: `custom-column-header-${index % 5}` // 5가지 색상 반복
            })));
            setData(response.data.data);
            setSentenceLengths(response.data.sentence_lengths);
            setWordFreq(response.data.word_freq.map(([text, value]: [string, number]) => ({ text, value: Math.round(value) })));
            setTfidfScores(Object.fromEntries(
                Object.entries(response.data.tfidf_scores).map(([key, values]: [string, [string, number][]]) => [
                    key,
                    values.map(([text, value]: [string, number]) => ({ text, value: Math.round(value) }))
                ])
            ));
            setColumnStats(response.data.column_stats);
            setError(null);
            setActiveKey(['columns']);
            message.success(`${file.name} 파일이 성공적으로 업로드되었습니다.`);
        } catch (error: any) {
            setError(error.response?.data?.detail || '파일 업로드 중 오류가 발생했습니다.');
            message.error(`${file.name} 파일 업로드 중 오류가 발생했습니다.`);
        } finally {
            setLoading(false);
        }
    };

    const props = {
        name: 'file',
        multiple: false,
        customRequest: ({ file, onSuccess }: any) => {
            setFileToUpload(file as File);
            handleUpload(file as File);
            onSuccess("ok");
        },
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleColumnMappingChange = (role: string, value: string) => {
        setColumnMapping(prev => ({ ...prev, [role]: value }));
    };

    const handleTokenizerSettingsChange = (key: string, value: any) => {
        setTokenizerSettings(prev => ({ ...prev, [key]: value }));
    };

    const createDataset = async () => {
        setLoading(true);
        setCreateDatasetError(false); // Reset error state

        // Check if return_attention_mask is false and remove it from tokenizerSettings
        const adjustedTokenizerSettings = { ...tokenizerSettings };
        if (!adjustedTokenizerSettings.return_attention_mask) {
            delete adjustedTokenizerSettings.return_attention_mask;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/v1/create-dataset', {
                columnMapping,
                tokenizerSettings: adjustedTokenizerSettings, // Use adjusted settings
                testSetRatio,
                shuffle,
                randomState
            });
            setTaskId(response.data.task_id);
            setTaskStatus('in_progress');
            message.success('데이터셋 생성 작업이 시작되었습니다.');
        } catch (error: any) {
            setError(error.response?.data?.detail || '데이터셋 생성 중 오류가 발생했습니다.');
            setCreateDatasetError(true); // Set error state to true
            message.error(error.response?.data?.detail || '데이터셋 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getColumnStats = (column: string) => {
        return columnStats[column] || { min: 0, max: 0, avg: 0 };
    };

    const getLengthDistribution = (column: string) => {
        const lengths = sentenceLengths.map(row => row[column]);
        const data = {
            labels: Array.from(new Set(lengths)).sort((a, b) => a - b),
            datasets: [{
                label: 'Sentence Length Distribution',
                data: lengths.reduce((acc, length) => {
                    acc[length] = (acc[length] || 0) + 1;
                    return acc;
                }, {}),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        };
        return data;
    };

    const getWordCloudData = (column: string) => {
        return tfidfScores[column] || [];
    };

    return (
        <div>
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
                </p>
            </Dragger>
            {columns.length > 0 && (
                <Collapse style={{ marginTop: 20 }} activeKey={activeKey} onChange={(key) => setActiveKey(key as string[])}>
                    <Panel 
                        header={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Columns</span>
                                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                                    데이터 확인
                                </Button>
                            </div>
                        } 
                        key="columns"
                    >
                        <div className="columns-container">
                            {columns.map(col => {
                                const stats = getColumnStats(col.dataIndex);
                                return (
                                    <div className="column-item" key={col.dataIndex}>
                                        <h3>{col.title}</h3>
                                        <Collapse>
                                            <Panel header="Statistics" key="stats">
                                                <p>Min: {stats.min}</p>
                                                <p>Max: {stats.max}</p>
                                                <p>Avg: {stats.avg}</p>
                                            </Panel>
                                            <Panel header="문장 길이 분포" key="length">
                                                <Bar data={getLengthDistribution(col.dataIndex)} />
                                            </Panel>
                                            <Panel header="단어 빈도" key="wordFreq">
                                                <WordCloudComponent words={getWordCloudData(col.dataIndex)} />
                                            </Panel>
                                        </Collapse>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                </Collapse>
            )}
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={8}>
                    <Card>
                        <Collapse>
                            <Panel header="토크나이저 설정" key="tokenizerSettings">
                                <Form layout="vertical">
                                    <Form.Item label="Padding">
                                        <Select value={tokenizerSettings.padding} onChange={(value) => handleTokenizerSettingsChange('padding', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                            <Option value="longest">Longest</Option>
                                            <Option value="max_length">Max Length</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Truncation">
                                        <Select value={tokenizerSettings.truncation} onChange={(value) => handleTokenizerSettingsChange('truncation', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                            <Option value="longest_first">Longest First</Option>
                                            <Option value="only_first">Only First</Option>
                                            <Option value="only_second">Only Second</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Max Length">
                                        <InputNumber 
                                            min={1} 
                                            value={tokenizerSettings.max_length} 
                                            onChange={(value) => handleTokenizerSettingsChange('max_length', value)}
                                            placeholder="입력 없을 시 가장 긴 데이터로 설정됩니다."
                                            style={{ width: '100%' }}  // 스타일 추가
                                        />
                                    </Form.Item>
                                    <Form.Item label="Return Tensors">
                                        <Select value={tokenizerSettings.return_tensors} onChange={(value) => handleTokenizerSettingsChange('return_tensors', value)}>
                                            <Option value="pt">pt</Option>
                                            <Option value="tf">tf</Option>
                                            <Option value="np">np</Option>
                                            <Option value="jax">jax</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Return Attention Mask">
                                        <Select value={tokenizerSettings.return_attention_mask} onChange={(value) => handleTokenizerSettingsChange('return_attention_mask', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Add Special Tokens">
                                        <Select value={tokenizerSettings.add_special_tokens} onChange={(value) => handleTokenizerSettingsChange('add_special_tokens', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Return Token Type IDs">
                                        <Select value={tokenizerSettings.return_token_type_ids} onChange={(value) => handleTokenizerSettingsChange('return_token_type_ids', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Return Special Tokens Mask">
                                        <Select value={tokenizerSettings.return_special_tokens_mask} onChange={(value) => handleTokenizerSettingsChange('return_special_tokens_mask', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Return Offsets Mapping">
                                        <Select value={tokenizerSettings.return_offsets_mapping} onChange={(value) => handleTokenizerSettingsChange('return_offsets_mapping', value)}>
                                        <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Is Split Into Words">
                                        <Select value={tokenizerSettings.is_split_into_words} onChange={(value) => handleTokenizerSettingsChange('is_split_into_words', value)}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                </Form>
                            </Panel>
                        </Collapse>
                        <Collapse style={{ marginTop: 20 }}>
                            <Panel header="데이터셋 설정" key="columnMapping">
                                <Form layout="vertical">
                                    <Divider orientation="left">컬럼 매핑</Divider>
                                    {['system', 'user', 'label'].map((role) => (
                                        <Form.Item key={role} label={role.charAt(0).toUpperCase() + role.slice(1)}>
                                            <Select defaultValue="None" style={{ width: '100%' }} onChange={(value) => handleColumnMappingChange(role, value)}>
                                                <Option value="None">None</Option>
                                                {columns.map((col) => (
                                                    <Option key={col.dataIndex} value={col.dataIndex}>{col.title}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    ))}
                                    <Divider orientation="left">테스트셋 설정</Divider>
                                    <Form.Item label="테스트셋 비율">
                                        <InputNumber min={0} max={1} step={0.01} value={testSetRatio} onChange={(value) => setTestSetRatio(value)} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item label="셔플">
                                        <Select value={shuffle} onChange={(value) => setShuffle(value)} style={{ width: '100%' }}>
                                            <Option value={true}>True</Option>
                                            <Option value={false}>False</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="랜덤 시드">
                                        <InputNumber min={0} value={randomState} onChange={(value) => setRandomState(value)} style={{ width: '100%' }} placeholder="선택 사항" />
                                    </Form.Item>
                                    <Button type="primary" onClick={createDataset} style={{ marginTop: 20 }} className={createDatasetError ? 'create-dataset-error' : ''}>
                                        데이터셋 만들기
                                    </Button>
                                </Form>
                            </Panel>
                        </Collapse>
                    </Card>
                </Col>
                <Col span={16}>
                    <Card>
                        <h3>데이터셋 생성 상태</h3>
                        {taskStatus === 'in_progress' && (
                            <div style={{ marginTop: 20 }}>
                                <Spin tip="데이터셋 생성 중...">
                                    <Progress percent={50} />
                                </Spin>
                            </div>
                        )}
                        {taskStatus === 'completed' && datasetSample && (
                            <div>
                                <p>Train Size: {trainSize}</p>
                                <p>Test Size: {testSize}</p>
                                <p>최대 시퀀스 길이: {maxSequenceLength}</p>
                                <Collapse>
                                    <Panel header="Input IDs" key="input_ids">
                                        <pre>{JSON.stringify(datasetSample.input_ids, null, 2)}</pre>
                                    </Panel>
                                    {datasetSample.attention_mask && ( // Conditionally render attention_mask
                                        <Panel header="Attention Mask" key="attention_mask">
                                            <pre>{JSON.stringify(datasetSample.attention_mask, null, 2)}</pre>
                                        </Panel>
                                    )}
                                    <Panel header="Labels" key="labels">
                                        <pre>{JSON.stringify(datasetSample.labels, null, 2)}</pre>
                                    </Panel>
                                </Collapse>
                            </div>
)}
                        {taskStatus === 'failed' && error && (
                            <Card>
                                <h3>오류</h3>
                                <p>{error}</p>
                            </Card>
                        )}
                    </Card>
                </Col>
            </Row>
            <Modal
                title="데이터 확인"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width="80%"
                style={{ top: 20 }}
            >
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    rowKey={(record) => record[columns[0].dataIndex]}
                    bordered
                    size="middle"
                    className="custom-table"
                />
            </Modal>
        </div>
    );
};

export default DataProcessing;