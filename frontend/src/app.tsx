import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Link, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import InitialModelTest from './pages/InitialModelTest';
import DataProcessing from './pages/DataProcessing';
import ModelTraining from './pages/ModelTraining';
import OnnxConversion from './pages/OnnxConversion';
import VLLM from './pages/VLLM';
import { GlobalStateProvider } from './context/GlobalStateContext';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>('1');

  useEffect(() => {
    const pathToKey: { [key: string]: string } = {
      '/initial-model-test': '1',
      '/data-processing': '2',
      '/model-training': '3',
      '/onnx-conversion': '4',
      '/vllm': '5',
      '/test-word-cloud': '6',
    };
    setSelectedKey(pathToKey[location.pathname] || '1');
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#001529',
        padding: '0 24px',
        height: '90px',
      }}>
        <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 'bold', fontSize: '32px' }}>
          AI 모델 파인튜닝 플랫폼
        </Title>
      </Header>
      <Layout>
        <Sider width={300} style={{ background: '#001529' }}>
          <Menu 
            mode="inline" 
            selectedKeys={[selectedKey]} 
            style={{ height: '100%', borderRight: 0 }}
            theme="dark"
          >
            <Menu.Item key="1" style={{ fontSize: '18px', height: '70px', lineHeight: '70px' }}>
              <Link to="/initial-model-test">초기 모델 테스트</Link>
            </Menu.Item>
            <Menu.Item key="2" style={{ fontSize: '18px', height: '70px', lineHeight: '70px' }}>
              <Link to="/data-processing">데이터 구분</Link>
            </Menu.Item>
            <Menu.Item key="3" style={{ fontSize: '18px', height: '70px', lineHeight: '70px' }}>
              <Link to="/model-training">모델 학습 설정</Link>
            </Menu.Item>
            <Menu.Item key="4" style={{ fontSize: '18px', height: '70px', lineHeight: '70px' }}>
              <Link to="/onnx-conversion">ONNX 변환</Link>
            </Menu.Item>
            <Menu.Item key="5" style={{ fontSize: '18px', height: '70px', lineHeight: '70px' }}>
              <Link to="/vllm">모델 서빙</Link>
            </Menu.Item>
            <Menu.Item key="6" style={{ fontSize: '18px', height: '70px', lineHeight: '70px' }}>
              <Link to="/test-word-cloud">워드 클라우드 테스트</Link> {/* New menu item */}
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '24px', background: '#f0f2f5' }}>
          <Content style={{ 
            background: '#fff', 
            padding: 24, 
            margin: 0,
            minHeight: 280,
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
          }}>
            <Routes>
              <Route path="/initial-model-test" element={<InitialModelTest />} />
              <Route path="/data-processing" element={<DataProcessing />} />
              <Route path="/model-training" element={<ModelTraining />} />
              <Route path="/onnx-conversion" element={<OnnxConversion />} />
              <Route path="/vllm" element={<VLLM />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </Router>
);

export default AppWrapper;