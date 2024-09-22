import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';  // App 컴포넌트를 가져옵니다.
import 'antd/dist/reset.css';  // Ant Design CSS 스타일 가져오기

ReactDOM.render(
  <React.StrictMode>
    <App />  // App 컴포넌트를 root DOM 요소에 렌더링합니다.
  </React.StrictMode>,
  document.getElementById('root')  // public/index.html의 <div id="root"></div>에서 렌더링됩니다.
);