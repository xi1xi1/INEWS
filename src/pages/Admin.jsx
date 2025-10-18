import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import NewsSync from '../components/NewsSync';
import StatsDashboard from '../components/StatsDashboard';
import { StatsService } from '../services/statsService';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    activeUsers: 0,
    todayViews: 0
  });
  const [loading, setLoading] = useState(true);

  // 检查是否是管理员
  const isAdmin = user && (user.email === 'admin@inews.com' || user.role === 'admin');

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [user, isAdmin]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // 使用 StatsService 获取统计数据
      const basicStats = await StatsService.getBasicStats();
      
      // 确保用户数量一致性：直接调用 getUsersCount()
      const actualUsersCount = await StatsService.getUsersCount();
      
      setAdminStats({
        totalUsers: actualUsersCount, // 使用实际的用户数量
        totalArticles: basicStats.articles || 0,
        activeUsers: basicStats.todayActiveUsers || 0,
        todayViews: basicStats.todayViews || 0
      });

      console.log('📊 管理后台统计数据:', {
        usersFromBasicStats: basicStats.users,
        actualUsersCount: actualUsersCount,
        articles: basicStats.articles,
        todayActiveUsers: basicStats.todayActiveUsers,
        todayViews: basicStats.todayViews
      });

    } catch (error) {
      console.error('获取管理统计数据错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 如果不是管理员，显示无权限
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ marginBottom: '1rem' }}>无权限访问</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            您没有权限访问管理后台
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>⚙️ 管理后台</h1>
      
      {/* 统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: '总用户数', value: adminStats.totalUsers, icon: '👥', color: '#ff4444' },
          { label: '总文章数', value: adminStats.totalArticles, icon: '📰', color: '#ff9500' },
          { label: '活跃用户', value: adminStats.activeUsers, icon: '🔥', color: '#2ed573' },
          { label: '今日浏览量', value: adminStats.todayViews, icon: '👀', color: '#1e90ff' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-light)',
            textAlign: 'center',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              color: 'var(--text-primary)',
              fontSize: loading ? '16px' : '24px'
            }}>
              {loading ? '加载中...' : stat.value.toLocaleString()}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 刷新按钮 */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button
          onClick={fetchAdminStats}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '刷新中...' : '🔄 刷新数据'}
        </button>
      </div>

      {/* 管理功能标签页 */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-light)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px'
        }}>
          <button 
            onClick={() => setActiveTab('stats')}
            style={{ 
              padding: '10px 20px',
              backgroundColor: activeTab === 'stats' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'stats' ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📊 数据统计
          </button>
          
          <button 
            onClick={() => setActiveTab('sync')}
            style={{ 
              padding: '10px 20px',
              backgroundColor: activeTab === 'sync' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'sync' ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 数据同步
          </button>
        </div>

        {activeTab === 'stats' && <StatsDashboard />}
        {activeTab === 'sync' && <NewsSync />}
      </div>
    </div>
  );
};

export default Admin;