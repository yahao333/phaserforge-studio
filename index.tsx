import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[系统] 正在初始化应用...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[系统错误] 找不到 root 元素！');
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode 有时会导致双重渲染，影响游戏实例的创建销毁，但在开发环境中是有益的。
  // 我们在业务逻辑中处理好 cleanup。
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('[系统] 应用挂载完成。');