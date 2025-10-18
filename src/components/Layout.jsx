import { useAuth } from '../hooks/useAuth';

const Layout = ({ children, title, description }) => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          marginBottom: '0.5rem',
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--text-primary)'
        }}>
          {title}
        </h1>
        {description && (
          <p style={{ 
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        )}
      </div>

      {/* 内容区域 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-light)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {children}
      </div>

      {/* 用户信息提示 */}
      {user && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--background-secondary)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          当前用户: <strong>{user.email}</strong>
          {user.email === 'guest@inews.com' && ' (游客模式)'}
        </div>
      )}
    </div>
  );
};

export default Layout;