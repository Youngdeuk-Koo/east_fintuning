import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, Space, message, Row, Col, Spin, Collapse, Switch, Tooltip, Progress } from 'antd';
import { SendOutlined, InfoCircleOutlined, LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CommonProps } from '../../components/type';
import { useGlobalState } from '../../context/GlobalStateContext';

const { Panel } = Collapse;

const ChatContainer = styled.div`
  height: 400px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
`;

const ChatMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>`
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 18px;
  margin-bottom: 8px;
  background-color: ${props => props.isUser ? '#1890ff' : '#f0f0f0'};
  color: ${props => props.isUser ? 'white' : 'black'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  float: ${props => props.isUser ? 'right' : 'left'};
  clear: both;
`;

const StyledCard = styled(Card)`
  .ant-card-head {
    background-color: #f0f2f5;
  }
`;

const StopButton = styled(Button)`
  background-color: red;
  border-color: red;
  color: white;
  &:hover {
    background-color: darkred;
    border-color: darkred;
  }
`;

const FullScreenLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .loading-icon {
    font-size: 64px; /* Increase the size of the loading icon */
  }

  .loading-text {
    margin-top: 16px;
    font-size: 24px; /* Increase the font size of the loading text */
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px; /* 세로 간격을 넓힘 */
`;

const LabelWithTooltip = styled.div`
  display: flex;
  align-items: center;
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const RotatingImage = styled.img`
  animation: ${rotate} 2s linear infinite;
  width: 50px;
  height: 50px;
`;

const JsonBox = styled.pre`
  background-color: #f0f2f5; /* Same as other boxes */
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  font-size: 14px; /* Adjust font size */
  max-height: 300px; /* Optional: to limit the height */
`;

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)`
  background-color: #f0f2f5 !important; /* Same as other boxes */
  padding: 16px !important;
  border-radius: 4px !important;
  font-size: 14px !important; /* Adjust font size */
  overflow: auto;
`;

const InitialModelTest: React.FC = () => {
  const { model, setModel, tokenizer, setTokenizer, modelName, setModelName, messages, setMessages, modelLoaded, setModelLoaded,
    apiToken, setApiToken, showApiTokenInput, setShowApiTokenInput, modelInfo, setModelInfo, tokenizerInfo, setTokenizerInfo,
    systemMessage, setSystemMessage, useGPU, setUseGPU, useFP16, setUseFP16, useAutocast, setUseAutocast, useGradientCheckpointing, setUseGradientCheckpointing,
    maxNewTokens, setMaxNewTokens, temperature, setTemperature, topP, setTopP, topK, setTopK, repetitionPenalty, setRepetitionPenalty, seed, setSeed,
    chatInfo, setChatInfo, gpuMemoryInfo, setGpuMemoryInfo } = useGlobalState();
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
  const [activePanels, setActivePanels] = useState<string[]>([]);
  const [unloading, setUnloading] = useState<boolean>(false);
  const [showSystemMessageInput, setShowSystemMessageInput] = useState<boolean>(false); // 추가된 부분
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 채팅 메시지가 업데이트될 때 스크롤을 맨 아래로 이동
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

    // 기존 모델 언로드
    if (modelLoaded) {
      await handleUnloadModel();
    }
  
    try {
      await axios.post('http://localhost:8000/api/v1/download', { 
        model_name: modelName,  // 수정된 부분
        api_token: apiToken || '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'
      });
  
      const interval = setInterval(async () => {
        try {
          const statusResponse = await axios.post('http://localhost:8000/api/v1/download_status', { model_name: modelName });  // 수정된 부분
          setDownloadStatus(statusResponse.data.message);
          if (statusResponse.data.message === "completed") {
            const modelInfoResponse = await axios.post('http://localhost:8000/api/v1/model_info');
            setModelInfo(JSON.stringify(modelInfoResponse.data.model_info, null, 2));
            setTokenizerInfo(JSON.stringify(modelInfoResponse.data.tokenizer_info, null, 2));
            setLoading(false);
            setModelLoaded(true);
            setActivePanels(['1', '2']); // Auto-expand panels
            // 모델과 토크나이저를 상위 컴포넌트로 전달
            setModel(modelInfoResponse.data.model_info);
            setTokenizer(modelInfoResponse.data.tokenizer_info);
            clearInterval(interval); // API 요청 중지
          } else if (statusResponse.data.message === "failed") {
            message.error('모델 다운로드 중 오류가 발생했습니다.');
            setLoading(false);
            clearInterval(interval);
          } else if (statusResponse.data.message === "registering" || statusResponse.data.message === "downloading" || statusResponse.data.message === "ready_to_chat") {
            // Keep the loading bar running
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
      await axios.post('http://localhost:8000/api/v1/unload_model');
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
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: inputMessage,
          system_message: systemMessage,
          max_new_tokens: maxNewTokens,
          use_gpu: useGPU,
          use_fp16: useFP16,
          use_autocast: useAutocast,
          use_gradient_checkpointing: useGradientCheckpointing,
          temperature: temperature,
          top_p: topP,
          top_k: topK,
          repetition_penalty: repetitionPenalty,
          seed: seed !== null ? seed : undefined,
        }),
      });
  
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
        gpuMemory: '2GB' // 임시 값
      });
      const gpuMemoryResponse = await axios.get('http://localhost:8000/api/v1/gpu_memory_info');
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
      <hr style={{ margin: '16px 0' }} /> {/* Added separator line */}
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
                <span>Autocast 사용</span> {/* Add this field */}
                <Tooltip title="Autocast를 사용할지 여부를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </LabelWithTooltip>
              <Switch checked={useAutocast} onChange={setUseAutocast} /> {/* Add this field */}
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
                <Tooltip title="샘플링 시 사용할 신뢰도를 설정합니다.">
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
                <Tooltip title="샘플링 시 고려할 누적 확률을 설정합니다.">
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
                <Tooltip title="샘플링 시 고려할 상위 K개의 토큰을 설정합니다.">
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
                <Tooltip title="반복 생성된 텍스트에 대한 패널티를 설정합니다.">
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
                <Tooltip title="텍스트 생성 시 사용할 시드를 설정합니다.">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
              </LabelWithTooltip>
              <Input 
                type="number"
                style={{ width: '100px' }} 
                value={seed ?? ''}
                onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : null)}
              />
            </SettingItem>
          </StyledCard>
        </Col>
        <Col span={10}>
          <StyledCard 
            title="채팅 화면" 
            extra={
              <SettingOutlined 
                title="시스템 메시지 설정" 
                style={{ fontSize: '24px', cursor: 'pointer' }} 
                onClick={() => setShowSystemMessageInput(!showSystemMessageInput)} 
              />
            } // Added gear icon
          >
            {showSystemMessageInput && (
              <div style={{ marginBottom: '16px' }}>
                <Input 
                  placeholder="시스템 메시지를 2000자 이내로 입력하세요" 
                  maxLength={2000} 
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                />
              </div>
            )}
            <ChatContainer ref={chatContainerRef}>
              {messages.map((msg, index) => (
                <ChatMessage key={index} isUser={msg.isUser}>
                  {msg.text}
                </ChatMessage>
              ))}
              {waitingForResponse && (
                <ChatMessage isUser={false} style={{ textAlign: 'center' }}>
                  <Spin size="small" /> 준비 중...
                </ChatMessage>
              )}
            </ChatContainer>
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="메시지 입력" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={handleSendMessage}
                disabled={!modelLoaded}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} disabled={!modelLoaded}>전송</Button>
            </Space.Compact>
          </StyledCard>
        </Col>
        <Col span={9}>
          <StyledCard title="채팅 정보">
            {chatInfo ? (
              <div>
                <p>입력 길이: {chatInfo.inputLength}</p>
                <p>출력 길이: {chatInfo.outputLength}</p>
                <p>응답 시간: {chatInfo.responseTime}ms</p>
                {gpuMemoryInfo && (
                  <div>
                    <p>할당된 메모리: {gpuMemoryInfo.memory_allocated} GB</p>
                    <p>최대 할당된 메모리: {gpuMemoryInfo.max_memory_allocated} GB</p>
                    <p>예약된 메모리: {gpuMemoryInfo.memory_reserved} GB</p>
                    <p>캐시된 메모리: {gpuMemoryInfo.memory_cached} GB</p>
                  </div>
                )}
              </div>
            ) : (
              <p>채팅 정보를 표시하려면 메시지를 보내세요.</p>
            )}
          </StyledCard>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Collapse activeKey={activePanels}>
            <Panel header="모델 정보" key="1">
              <StyledSyntaxHighlighter language="json" style={coy}>
                {modelInfo}
              </StyledSyntaxHighlighter>
            </Panel>
          </Collapse>
        </Col>
        <Col span={12}>
          <Collapse activeKey={activePanels}>
            <Panel header="토큰 정보" key="2">
              <StyledSyntaxHighlighter language="json" style={coy}>
                {tokenizerInfo}
              </StyledSyntaxHighlighter>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  );
};

export default InitialModelTest;
             