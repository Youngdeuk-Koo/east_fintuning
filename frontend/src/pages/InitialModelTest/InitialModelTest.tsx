import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, Space, message, Row, Col, Spin, Collapse, Switch, Tooltip } from 'antd';
import { SendOutlined, InfoCircleOutlined, LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useGlobalState } from '../../context/GlobalStateContext';
import { JsonBox } from './StyledComponents';
import { downloadModel, getModelDownloadStatus, getModelInfo, unloadModel, sendMessage, getGpuMemoryInfo } from './api';
import { ChatContainer, ChatMessage, StyledCard, StopButton, FullScreenLoader, SettingItem, LabelWithTooltip, StyledSyntaxHighlighter } from './StyledComponents';

const { Panel } = Collapse;

const InitialModelTest: React.FC = () => {
  const {
    model, setModel, tokenizer, setTokenizer, modelName, setModelName, messages, setMessages, modelLoaded, setModelLoaded,
    apiToken, setApiToken, showApiTokenInput, setShowApiTokenInput, modelInfo, setModelInfo, tokenizerInfo, setTokenizerInfo,
    systemMessage, setSystemMessage, useGPU, setUseGPU, useFP16, setUseFP16, useAutocast, setUseAutocast, useGradientCheckpointing, setUseGradientCheckpointing,
    maxNewTokens, setMaxNewTokens, temperature, setTemperature, topP, setTopP, topK, setTopK, repetitionPenalty, setRepetitionPenalty, seed, setSeed,
    chatInfo, setChatInfo, gpuMemoryInfo, setGpuMemoryInfo
  } = useGlobalState();

  const [loading, setLoading] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
  const [activePanels, setActivePanels] = useState<string[]>([]);
  const [unloading, setUnloading] = useState<boolean>(false);
  const [showSystemMessageInput, setShowSystemMessageInput] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleModelDownload = async () => {
    if (!modelName) {
      message.error('모델 이름을 입력해주세요.');
      return;
    }
    setLoading(true);
    setDownloadStatus('downloading');

    if (modelLoaded) {
      await handleUnloadModel();
    }

    try {
      await downloadModel(modelName, apiToken);

      const interval = setInterval(async () => {
        try {
          const statusResponse = await getModelDownloadStatus(modelName);
          setDownloadStatus(statusResponse.data.message);
          if (statusResponse.data.message === "completed") {
            const modelInfoResponse = await getModelInfo();
            setModelInfo(JSON.stringify(modelInfoResponse.data.model_info, null, 2));
            setTokenizerInfo(JSON.stringify(modelInfoResponse.data.tokenizer_info, null, 2));
            setLoading(false);
            setModelLoaded(true);
            setActivePanels(['1', '2']);
            setModel(modelInfoResponse.data.model_info);
            setTokenizer(modelInfoResponse.data.tokenizer_info);
            clearInterval(interval);
          } else if (statusResponse.data.message === "failed") {
            message.error('모델 다운로드 중 오류가 발생했습니다.');
            setLoading(false);
            clearInterval(interval);
          }
        } catch (error) {
          // 모델 정보가 아직 준비되지 않았을 경우 에러를 무시하고 계속 시도
        }
      }, 1000);
    } catch (error) {
      message.error('모델 다운로드 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleUnloadModel = async () => {
    setUnloading(true);

    try {
      await unloadModel();
      message.success('모델이 성공적으로 중지 되었습니다.');
      setModelInfo('');
      setTokenizerInfo('');
      setMessages([]);
      setChatInfo(null);
      setGpuMemoryInfo(null);
      setModelLoaded(false);
    } catch (error) {
      message.error('모델 언로드 중 오류가 발생했습니다.');
    } finally {
      setUnloading(false);
    }
  };

  const handleTemperatureChange = (value: number) => {
    if (value < 0.01) {
      setTemperature(0.01);
    } else if (value > 1) {
      setTemperature(1);
    } else {
      setTemperature(value);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const startTime = Date.now();
    const newMessages = [...messages, { text: inputMessage, isUser: true }];
    setMessages(newMessages);
    setInputMessage('');
    setWaitingForResponse(true);

    try {
      const response = await sendMessage(inputMessage, systemMessage, maxNewTokens, useGPU, useFP16, useAutocast, useGradientCheckpointing, temperature, topP, topK, repetitionPenalty, seed);
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseText = '';
      let newMessageIndex = newMessages.length;

      setMessages(prev => [...prev, { text: '', isUser: false }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[newMessageIndex] = { text: responseText, isUser: false };
          return updatedMessages;
        });
      }

      const endTime = Date.now();
      setChatInfo({
        inputLength: inputMessage.length,
        outputLength: responseText.length,
        responseTime: endTime - startTime,
        gpuMemory: '2GB'
      });
      const gpuMemoryResponse = await getGpuMemoryInfo();
      setGpuMemoryInfo(gpuMemoryResponse.data);
    } catch (error) {
      message.error('채팅 중 오류가 발생했습니다.');
    } finally {
      setWaitingForResponse(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      {loading && (
        <FullScreenLoader>
          <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p style={{ marginTop: '16px' }}>
            {downloadStatus === 'downloading' && '모델을 다운로드 중입니다...'}
            {downloadStatus === 'registering' && '모델을 등록 중입니다...'}
            {downloadStatus === 'ready_to_chat' && '모델과의 대화를 준비 중입니다...'}
            {downloadStatus === 'completed' && '모델이 준비되었습니다!'}
          </p>
        </FullScreenLoader>
      )}
      <h2>초기 모델 테스트</h2>
      <Space>
        <Input 
          placeholder="모델 이름 입력" 
          style={{ width: '300px' }} 
          value={modelName || ''}
          onChange={(e) => setModelName(e.target.value)}
        />
        <Tooltip title="모델 인증 오류시 승인된 토큰을 입력하세요.">
          <Button onClick={() => setShowApiTokenInput(!showApiTokenInput)}>토큰 추가</Button>
        </Tooltip>
        {showApiTokenInput && (
          <Input 
            placeholder="API 토큰 입력" 
            style={{ width: '300px' }} 
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
        )}
        <Tooltip title="허깅페이스에 등록되어 있는 모델명을 입력후 모델 받기를 눌러주세요">
          <Button type="primary" onClick={handleModelDownload} loading={loading}>모델 받기</Button>
        </Tooltip>
      </Space>
      <hr style={{ margin: '16px 0' }} />
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={5}>
          <StyledCard 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>설정</span>
                <Tooltip title="모델에 대한 모든 메모리가 초기화 됩니다.">
                  <StopButton onClick={handleUnloadModel} loading={unloading}>모델 사용 중지</StopButton>
                </Tooltip>
              </div>
            }
          >
            <SettingItem>
              <LabelWithTooltip>
                <span>GPU 사용</span>
                <Tooltip title="GPU를 사용할지 여부를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Switch checked={useGPU} onChange={setUseGPU} />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>FP16 사용</span>
                <Tooltip title="FP16을 사용할지 여부를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Switch checked={useFP16} onChange={setUseFP16} />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Autocast 사용</span>
                <Tooltip title="Autocast를 사용할지 여부를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Switch checked={useAutocast} onChange={setUseAutocast} />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Gradient Checkpointing</span>
                <Tooltip title="Gradient Checkpointing을 사용할지 여부를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Switch checked={useGradientCheckpointing} onChange={setUseGradientCheckpointing} />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Max New Tokens</span>
                <Tooltip title="생성할 최대 토큰 수를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={maxNewTokens}
                onChange={(e) => setMaxNewTokens(Number(e.target.value) || undefined)}
              />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
              <span>Temperature</span>
                <Tooltip title="샘플링 온도를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={temperature}
                onChange={(e) => handleTemperatureChange(Number(e.target.value))}
              />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Top P</span>
                <Tooltip title="Top P를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={topP}
                onChange={(e) => setTopP(Number(e.target.value) || undefined)}
              />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Top K</span>
                <Tooltip title="Top K를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value) || undefined)}
              />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Repetition Penalty</span>
                <Tooltip title="반복 패널티를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={repetitionPenalty}
                onChange={(e) => setRepetitionPenalty(Number(e.target.value) || undefined)}
              />
            </SettingItem>
            <SettingItem>
              <LabelWithTooltip>
                <span>Seed</span>
                <Tooltip title="시드를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={seed || ''}
                onChange={(e) => setSeed(Number(e.target.value) || null)}
              />
            </SettingItem>
          </StyledCard>
        </Col>
        <Col span={19}>
          <StyledCard title="채팅">
            <ChatContainer ref={chatContainerRef}>
              {messages.map((msg, index) => (
                <ChatMessage key={index} isUser={msg.isUser}>
                  {msg.text}
                </ChatMessage>
              ))}
            </ChatContainer>
            <Input
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              disabled={waitingForResponse}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={waitingForResponse}
              style={{ marginTop: '8px' }}
            >
              전송
            </Button>
          </StyledCard>
        </Col>
      </Row>
      <Collapse activeKey={activePanels} onChange={setActivePanels}>
        <Panel header="모델 정보" key="1">
          <JsonBox>{modelInfo}</JsonBox>
        </Panel>
        <Panel header="토크나이저 정보" key="2">
          <JsonBox>{tokenizerInfo}</JsonBox>
        </Panel>
        <Panel header="채팅 정보" key="3">
          <JsonBox>{JSON.stringify(chatInfo, null, 2)}</JsonBox>
        </Panel>
        <Panel header="GPU 메모리 정보" key="4">
          <JsonBox>{JSON.stringify(gpuMemoryInfo, null, 2)}</JsonBox>
        </Panel>
      </Collapse>
    </div>
  );
};

export default InitialModelTest;