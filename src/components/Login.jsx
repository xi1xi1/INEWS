import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { signIn, signUp, guestSignIn, authError, clearAuthError } = useAuth();

  // 管理员凭据
  const ADMIN_CREDENTIALS = {
    email: 'admin@inews.com',
    password: 'admin123'
  };

  // 密码强度检查
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ['非常弱', '弱', '一般', '强', '非常强'];
    const colors = ['#ff4757', '#ff6348', '#ffa502', '#2ed573', '#1e90ff'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '#ff4757',
      percentage: (strength / 5) * 100
    };
  };

  // 表单验证
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = '请输入邮箱地址';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!password) {
      errors.password = '请输入密码';
    } else if (password.length < 6) {
      errors.password = '密码至少6位字符';
    }
    
    if (isSignUp) {
      if (!confirmPassword) {
        errors.confirmPassword = '请确认密码';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    clearAuthError();
    setFormErrors({});
    setConfirmPassword('');
  }, [isSignUp, clearAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    clearAuthError();
    
    try {
      let result;
      
      // 检查是否是管理员登录
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // 管理员登录 - 创建模拟管理员用户
        const adminUser = {
          id: 'admin-' + Date.now(),
          email: ADMIN_CREDENTIALS.email,
          user_metadata: { name: '系统管理员', role: 'admin' },
          role: 'admin'
        };
        
        // 模拟登录过程
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 这里需要更新 AuthProvider 来设置用户
        // 暂时使用 localStorage 来标记管理员状态
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        window.dispatchEvent(new Event('adminLogin'));
        
        return;
      }
      
      // 普通用户登录
      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }
      
      if (result?.error) throw result.error;
    } catch (error) {
      console.error('认证错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    clearAuthError();
    
    try {
      const result = await guestSignIn();
      if (result?.error) throw result.error;
    } catch (error) {
      console.error('游客登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '60px auto', 
      padding: '40px 35px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* 背景装饰元素 */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        left: '-80px',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Logo/标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '20px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            📰
          </div>
          <h2 style={{ 
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '800'
          }}>
            {isSignUp ? '加入 iNews' : '欢迎回来'}
          </h2>
          <p style={{ 
            margin: 0,
            opacity: 0.9,
            fontSize: '16px'
          }}>
            {isSignUp ? '开启您的个性化新闻之旅' : '登录您的账户继续阅读'}
          </p>
        </div>
        
        {/* 错误提示 */}
        {authError && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            color: '#ff6b6b',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: '14px',
            marginBottom: '25px',
            fontSize: '14px',
            backdropFilter: 'blur(15px)',
            textAlign: 'center'
          }}>
            <span>⚠️</span> {authError}
          </div>
        )}
        
        {/* 登录表单 */}
        <form onSubmit={handleSubmit}>
          {/* 邮箱输入 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>📧 邮箱地址</span>
              {formErrors.email && (
                <span style={{ fontSize: '12px', color: '#ff6b6b', marginLeft: 'auto' }}>
                  {formErrors.email}
                </span>
              )}
            </div>
            <input
              type="email"
              placeholder="请输入您的邮箱地址"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
              }}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '18px 20px', 
                fontSize: '15px',
                background: 'rgba(255,255,255,0.12)',
                border: formErrors.email ? '2px solid #ff6b6b' : '1px solid rgba(255,255,255,0.3)',
                borderRadius: '14px',
                color: 'white',
                backdropFilter: 'blur(15px)'
              }}
            />
          </div>

          {/* 密码输入 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>🔒 密码</span>
              {formErrors.password && (
                <span style={{ fontSize: '12px', color: '#ff6b6b', marginLeft: 'auto' }}>
                  {formErrors.password}
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={isSignUp ? "设置您的密码（至少6位）" : "请输入您的密码"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
              }}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '18px 20px', 
                fontSize: '15px',
                background: 'rgba(255,255,255,0.12)',
                border: formErrors.password ? '2px solid #ff6b6b' : '1px solid rgba(255,255,255,0.3)',
                borderRadius: '14px',
                color: 'white',
                backdropFilter: 'blur(15px)'
              }}
            />
            
            {/* 密码强度指示器 */}
            {isSignUp && password && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>密码强度:</span>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
                  <div style={{
                    width: `${passwordStrength.percentage}%`,
                    height: '100%',
                    background: passwordStrength.color,
                    borderRadius: '3px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
            )}
          </div>

          {/* 确认密码 */}
          {isSignUp && (
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>✅ 确认密码</span>
                {formErrors.confirmPassword && (
                  <span style={{ fontSize: '12px', color: '#ff6b6b', marginLeft: 'auto' }}>
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '18px 20px', 
                  fontSize: '15px',
                  background: 'rgba(255,255,255,0.12)',
                  border: formErrors.confirmPassword ? '2px solid #ff6b6b' : '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  backdropFilter: 'blur(15px)'
                }}
              />
            </div>
          )}

          {/* 主操作按钮 */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading ? 'rgba(255,255,255,0.3)' : 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? (
              <span>⏳ {isSignUp ? '正在创建账户...' : '正在登录...'}</span>
            ) : (
              <span>{isSignUp ? '🚀 立即注册' : '🔑 立即登录'}</span>
            )}
          </button>
        </form>

        {/* 游客登录 */}
        <button 
          onClick={handleGuestLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(255,255,255,0.12)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '25px'
          }}
        >
          👤 游客体验 <span style={{ fontSize: '12px', opacity: 0.7 }}>(无需注册)</span>
        </button>
        
        {/* 管理员提示
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'center',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          💡 管理员请使用: admin@inews.com / admin123
        </div> */}
        
        {/* 切换登录/注册 */}
        <p style={{ textAlign: 'center', margin: 0, color: 'rgba(255,255,255,0.8)' }}>
          {isSignUp ? '已有账户？' : '还没有账户？'}
          <button 
            onClick={() => {
              clearAuthError();
              setIsSignUp(!isSignUp);
            }}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffd93d',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginLeft: '10px',
              fontSize: '15px',
              fontWeight: '700'
            }}
          >
            {isSignUp ? '立即登录' : '立即注册'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;