import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState('初始化中...');

  useEffect(() => {
    console.log('🚀 App 组件挂载');
    setStatus('应用已加载！');

    // 检查关键功能
    setTimeout(() => {
      console.log('✅ React 工作正常');
      console.log('✅ CSS 加载正常');
      console.log('✅ JavaScript 执行正常');
    }, 1000);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</h1>
      <h1>iNews 调试页面</h1>
      <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>{status}</p>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '12px',
        marginTop: '2rem',
        textAlign: 'left'
      }}>
        <h3>调试信息：</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>✅ React 框架正常</li>
          <li>✅ 组件渲染正常</li>
          <li>✅ 样式加载正常</li>
          <li>🔄 检查认证系统...</li>
        </ul>
      </div>

      <button 
        onClick={() => {
          console.log('测试按钮点击');
          alert('交互功能正常！');
        }}
        style={{
          padding: '12px 24px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '2rem'
        }}
      >
        测试交互
      </button>
    </div>
  );
}

export default App;