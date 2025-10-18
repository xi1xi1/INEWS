import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError() {  // 移除未使用的 error 参数
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,  // 使用属性简写
      errorInfo  // 使用属性简写
    });
    
    console.error('组件错误:', error);
    console.error('错误堆栈:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)',
          textAlign: 'center',
          margin: '2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            组件加载失败
          </h2>
          <p style={{ 
            marginBottom: '2rem', 
            color: 'var(--text-secondary)',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            抱歉，这个组件遇到了问题。请刷新页面或联系技术支持。
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 刷新页面
            </button>
            
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--primary-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 重试加载
            </button>
          </div>

          {/* 开发模式显示错误详情 */}
          {import.meta.env.DEV && this.state.error && (  // 修复 process.env 问题
            <details style={{ 
              marginTop: '2rem',
              textAlign: 'left',
              background: 'var(--background-secondary)',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                错误详情 (开发模式)
              </summary>
              <div style={{ marginTop: '1rem' }}>
                <div><strong>错误信息:</strong></div>
                <pre style={{ 
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '0.5rem',
                  fontSize: '11px'
                }}>
                  {this.state.error.toString()}
                </pre>
                
                {this.state.errorInfo && (
                  <>
                    <div style={{ marginTop: '1rem' }}><strong>组件堆栈:</strong></div>
                    <pre style={{ 
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                      marginTop: '0.5rem',
                      fontSize: '11px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;