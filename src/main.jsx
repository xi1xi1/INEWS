// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 启动 iNews 应用...')

// 检查根元素
const container = document.getElementById('root')
if (!container) {
  throw new Error('找不到 #root 元素，请检查 index.html')
}

console.log('✅ 找到根元素，开始渲染应用...')

const root = createRoot(container)

try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  console.log('✅ iNews 应用渲染完成')
} catch (error) {
  console.error('❌ 应用渲染失败:', error)
  
  // 显示错误界面
  root.render(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      color: '#333',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
      <h1 style={{ marginBottom: '1rem', color: '#ff4444' }}>应用启动失败</h1>
      <p style={{ marginBottom: '2rem', maxWidth: '500px', lineHeight: '1.6' }}>
        抱歉，iNews 应用启动时遇到问题。请刷新页面重试，或检查控制台获取详细错误信息。
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        刷新页面
      </button>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666',
        maxWidth: '600px'
      }}>
        <strong>错误详情:</strong> {error.message}
      </div>
    </div>
  )
}



// 开发环境热重载支持
if (import.meta.hot) {
  import.meta.hot.accept()
}

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('🚨 全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 未处理的 Promise 拒绝:', event.reason)
})