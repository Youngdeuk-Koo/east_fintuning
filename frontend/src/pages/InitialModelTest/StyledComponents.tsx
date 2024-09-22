import styled, { keyframes } from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { Card, Button } from 'antd';

export const ChatContainer = styled.div`
  height: 400px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const ChatMessage = styled.div.withConfig({
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

export const StyledCard = styled(Card)`
  .ant-card-head {
    background-color: #f0f2f5;
  }
`;

export const StopButton = styled(Button)`
  background-color: red;
  border-color: red;
  color: white;
  &:hover {
    background-color: darkred;
    border-color: darkred;
  }
`;

export const FullScreenLoader = styled.div`
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
    font-size: 64px;
  }

  .loading-text {
    margin-top: 16px;
    font-size: 24px;
  }
`;

export const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const LabelWithTooltip = styled.div`
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

export const RotatingImage = styled.img`
  animation: ${rotate} 2s linear infinite;
  width: 50px;
  height: 50px;
`;

export const JsonBox = styled.pre`
  background-color: #f0f2f5;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  font-size: 14px;
  max-height: 300px;
`;

export const StyledSyntaxHighlighter = styled(SyntaxHighlighter)`
  background-color: #f0f2f5 !important;
  padding: 16px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  overflow: auto;
`;