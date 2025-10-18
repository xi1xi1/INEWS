import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './AuthContext';  

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 初始化认证状态...');
        
        // 检查是否有管理员用户
        const adminUser = localStorage.getItem('admin_user');
        if (adminUser) {
          console.log('✅ 发现管理员用户');
          setUser(JSON.parse(adminUser));
          setLoading(false);
          return;
        }
        
        // 获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('获取会话错误:', error);
          setAuthError(error.message);
        } else {
          console.log('✅ 会话获取成功:', session ? `用户: ${session.user?.email}` : '无用户');
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ 认证初始化异常:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 认证状态变化:', event);
      
      switch (event) {
        case 'SIGNED_IN':
          setUser(session.user);
          setAuthError(null);
          break;
        case 'SIGNED_OUT':
          setUser(null);
          // 清除管理员状态
          localStorage.removeItem('admin_user');
          break;
        case 'USER_UPDATED':
          setUser(session?.user ?? null);
          break;
        default:
          break;
      }
      
      setLoading(false);
    });

    // 监听管理员登录事件
    const handleAdminLogin = () => {
      const adminUser = localStorage.getItem('admin_user');
      if (adminUser) {
        setUser(JSON.parse(adminUser));
        setLoading(false);
      }
    };

    window.addEventListener('adminLogin', handleAdminLogin);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('adminLogin', handleAdminLogin);
    };
  }, []);

  const signUp = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ 注册错误:', error);
      setAuthError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ 登录错误:', error);
      setAuthError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const guestSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // 游客登录 - 使用模拟用户
      const guestUser = {
        id: 'guest-' + Date.now(),
        email: 'guest@inews.com',
        user_metadata: { name: '游客用户' }
      };
      
      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUser(guestUser);
      
      return { data: { user: guestUser }, error: null };
    } catch (error) {
      console.error('❌ 游客登录错误:', error);
      setAuthError('游客登录失败');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // 清除管理员状态
      localStorage.removeItem('admin_user');
      
      // 如果是真实用户，调用 Supabase 登出
      if (user && !user.email.includes('guest') && !user.email.includes('admin')) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setAuthError(null);
      return { error: null };
    } catch (error) {
      console.error('❌ 登出错误:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    guestSignIn,
    loading,
    authError,
    clearAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;