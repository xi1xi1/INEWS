import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import NewsList from './components/NewsList';
import Favorites from './pages/Favorites';
import ArticleDetail from './pages/ArticleDetail';
import ReadHistory from './pages/ReadHistory';
import Admin from './pages/Admin';
import StatsDashboard from './components/StatsDashboard';
import NewsSync from './components/NewsSync';
import './App.css';

// 通知组件
const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`notification ${type}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// 导航组件
function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addNotification('已成功退出登录', 'success');
      navigate('/');
    } catch  {
      addNotification('退出登录失败', 'error');
    }
  };

  if (!user) return null;

  // 在 Navigation 组件的 navItems 部分修改：
  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/favorites', label: '我的收藏', icon: '❤️' },
    { path: '/history', label: '阅读历史', icon: '📖' },
  ];

  // 如果是管理员，显示管理相关链接
  if (user && (user.email === 'admin@inews.com' || user.role === 'admin')) {
    navItems.push(
      { path: '/admin', label: '管理后台', icon: '⚙️' }
    );
  }

  return (
    <>
      {/* 通知容器 */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {notifications.map(notif => (
          <Notification
            key={notif.id}
            message={notif.message}
            type={notif.type}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      <header style={{ 
        padding: '12px 20px', 
        backgroundColor: 'var(--background-primary)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-light)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo 和品牌 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div 
              onClick={() => navigate('/')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--primary-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                📰
              </div>
              <h1 style={{ 
                margin: 0, 
                color: 'var(--text-primary)', 
                fontSize: '20px',
                fontWeight: '700'
              }}>
                iNews
              </h1>
            </div>
            
            {/* 主导航 */}
            <nav style={{ display: 'flex', gap: '8px' }}>
              {navItems.map(item => (
                <Link 
                  key={item.path}
                  to={item.path}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    textDecoration: 'none', 
                    color: location.pathname === item.path ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: location.pathname === item.path ? '600' : '400',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.backgroundColor = 'var(--background-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 用户菜单 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--primary-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '14px' }}>
                {user.email?.split('@')[0] || '用户'}
              </span>
              <span style={{ 
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </button>

            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'var(--background-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-medium)',
                minWidth: '200px',
                zIndex: 1000
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.email || '游客用户'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {user.email === 'guest@inews.com' ? '游客模式' : '欢迎回来'}
                  </div>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🚪</span>
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 点击外部关闭菜单 */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}

// 底部组件
function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--background-primary)',
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 1rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>关于我们</a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>联系方式</a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>隐私政策</a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>服务条款</a>
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>
          © 2025 iNews - 专业的新闻聚合平台。
        </p>
      </div>
    </footer>
  );
}

// 主应用组件
function MainApp() {
  const { user, loading } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('🔍 应用状态:', { user: user?.email, loading, appReady });

    // 应用初始化计时器
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, loading,appReady]);

  // 加载状态
  if (loading || !appReady) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--background-secondary)',
        gap: '1rem'
      }}>
        <div className="loading-spinner" style={{ width: '60px', height: '60px' }}></div>
        <div style={{ 
          color: 'var(--text-secondary)',
          fontSize: '1.1rem'
        }}>
          加载 iNews...
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!user) {
    return <Login />;
  }

  // 已登录状态 - 显示完整应用
  return (
    <div className="App" style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background-secondary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navigation />
      <main style={{ flex: 1, padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<NewsList />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/history" element={<ReadHistory />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/stats" element={<StatsDashboard />} />
          <Route path="/sync" element={<NewsSync />} />
          {/* 404 页面 */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                页面未找到
              </h2>
              <p style={{ 
                marginBottom: '2rem', 
                color: 'var(--text-secondary)',
                maxWidth: '400px'
              }}>
                抱歉，您访问的页面不存在。请检查URL是否正确，或返回首页。
              </p>
              <Link 
                to="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                返回首页
              </Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// 根应用组件
function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}

export default App;