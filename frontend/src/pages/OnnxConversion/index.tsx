import React from 'react';
import { Input, Button, Card } from 'antd';
import { CommonProps } from '../../components/type';
import { useGlobalState } from '../../context/GlobalStateContext';

const OnnxConversion: React.FC = () => {
  const { setModel, setTokenizer, setModelName } = useGlobalState();

  return (
    <div>
      <h2>ONNX 변환</h2>
      <Card title="저장된 모델 리스트" style={{ marginTop: '16px' }}>
        {/* 저장된 모델 리스트 */}
      </Card>
      <Button type="primary" style={{ marginTop: '16px' }}>ONNX 설정 확인</Button>
      <Card title="모델 구조 및 파라미터 정보" style={{ marginTop: '16px' }}>
        {/* 모델 구조 및 파라미터 정보 */}
      </Card>
      <Button type="primary" style={{ marginTop: '16px' }}>자동 ONNX 설정</Button>
      <Card title="ONNX 설정" style={{ marginTop: '16px' }}>
        {/* ONNX 설정 */}
      </Card>
      <Button type="primary" style={{ marginTop: '16px' }}>ONNX 변환</Button>
    </div>
  );
};

export default OnnxConversion;