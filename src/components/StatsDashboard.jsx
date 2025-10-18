import { useState, useEffect } from 'react';
import { StatsService } from '../services/statsService';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      
      // 并行加载所有数据
      const [basicStats, categories, trend, popular, activity] = await Promise.all([
        StatsService.getBasicStats(),
        StatsService.getCategoryDistribution(),
        StatsService.getDailyArticleTrend(),
        StatsService.getPopularArticles(),
        StatsService.getUserActivity()
      ]);

      setStats(basicStats);
      setCategoryData(categories);
      setTrendData(trend);
      setPopularArticles(popular);
      setUserActivity(activity);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadStatsData();
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666'
      }}>
        <div>加载统计数据中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 控制栏 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#333', margin: 0 }}>数据统计</h3>
        <button
          onClick={refreshData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          刷新数据
        </button>
      </div>

      {/* 标签页 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '10px'
      }}>
        {['overview', 'articles', 'users', 'trends'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab ? '#007bff' : '#f8f9fa',
              color: activeTab === tab ? 'white' : '#333',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {{
              overview: '概览',
              articles: '文章分析',
              users: '用户行为',
              trends: '趋势分析'
            }[tab]}
          </button>
        ))}
      </div>

      {/* 数据概览卡片 */}
      {activeTab === 'overview' && (
        <OverviewTab 
          stats={stats} 
          categoryData={categoryData}
          trendData={trendData} // 现在这个参数被使用了
        />
      )}

      {activeTab === 'articles' && (
        <ArticlesTab 
          popularArticles={popularArticles}
          categoryData={categoryData} // 现在这个参数被使用了
        />
      )}

      {activeTab === 'users' && (
        <UsersTab 
          userActivity={userActivity}
          stats={stats}
        />
      )}

      {activeTab === 'trends' && (
        <TrendsTab 
          trendData={trendData}
        />
      )}

      {/* 最后更新时间 */}
      {stats && (
        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center'
        }}>
          最后更新: {stats.updatedAt}
        </div>
      )}
    </div>
  );
};

// 概览标签页组件 - 修复：使用 trendData 参数
const OverviewTab = ({ stats, categoryData, trendData }) => {
  // 计算最近7天的总发布量
  const totalLast7Days = trendData.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div>
      {/* 数据卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <StatCard 
          title="总文章数" 
          value={stats?.articles} 
          color="#007bff"
          icon="📰"
        />
        <StatCard 
          title="分类数量" 
          value={stats?.categories} 
          color="#28a745"
          icon="📂"
        />
        <StatCard 
          title="用户数量" 
          value={stats?.users} 
          color="#ffc107"
          icon="👥"
        />
        <StatCard 
          title="收藏总数" 
          value={stats?.favorites} 
          color="#e83e8c"
          icon="❤️"
        />
        <StatCard 
          title="阅读记录" 
          value={stats?.readHistory} 
          color="#17a2b8"
          icon="📖"
        />
        <StatCard 
          title="今日新增" 
          value={stats?.todayArticles} 
          color="#6f42c1"
          icon="🆕"
        />
        <StatCard 
          title="近7天发布" 
          value={totalLast7Days} 
          color="#20c997"
          icon="📈"
        />
      </div>

      {/* 分类分布 */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>文章分类分布</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoryData.map(category => (
            <div key={category.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ minWidth: '100px', fontSize: '14px' }}>{category.name}</span>
              <div style={{ 
                flex: 1, 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: '#007bff',
                    height: '20px',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', color: '#666', minWidth: '60px' }}>
                {category.count}篇 ({category.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 文章分析标签页 - 修复：使用 categoryData 参数
const ArticlesTab = ({ popularArticles, categoryData }) => {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 热门文章 */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>热门文章（按收藏数）</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {popularArticles.map((item, index) => (
            <div key={item.article.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  {index + 1}. {item.article.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  来源: {item.article.source_name} • 
                  发布时间: {new Date(item.article.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                backgroundColor: '#e83e8c',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {item.favorites} 收藏
              </div>
            </div>
          ))}
          {popularArticles.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              暂无热门文章数据
            </div>
          )}
        </div>
      </div>

      {/* 分类统计 */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>分类文章数量统计</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          {categoryData.map(category => (
            <div key={category.name} style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                {category.count}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {category.name}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                {category.percentage}%
              </div>
            </div>
          ))}
        </div>
        {categoryData.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            暂无分类数据
          </div>
        )}
      </div>
    </div>
  );
};

// 用户行为标签页
const UsersTab = ({ userActivity, stats }) => {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 用户活跃度 */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>用户活跃度排名</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {userActivity.map((user, index) => (
            <div key={user.userId} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: index < 3 ? '#fff3cd' : '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: index < 3 ? '#ffc107' : '#6c757d',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <span style={{ fontSize: '14px' }}>用户 {user.userId.substring(0, 8)}...</span>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
                <span>📖 {user.reads} 阅读</span>
                <span>❤️ {user.favorites} 收藏</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  总计: {user.totalActivity}
                </span>
              </div>
            </div>
          ))}
          {userActivity.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              暂无用户活跃度数据
            </div>
          )}
        </div>
      </div>

      {/* 用户行为统计 */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>用户行为统计</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats?.users || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>注册用户</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats?.favorites || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>总收藏数</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {stats?.readHistory || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>总阅读数</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e83e8c' }}>
              {stats?.users ? Math.round((stats.favorites + stats.readHistory) / stats.users) : 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>人均互动</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 趋势分析标签页
const TrendsTab = ({ trendData }) => {
  const maxCount = Math.max(...trendData.map(item => item.count), 1);
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px'
    }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>最近7天文章发布趋势</h4>
      <div style={{ display: 'flex', alignItems: 'end', gap: '10px', height: '200px', padding: '20px 0' }}>
        {trendData.map((item, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{
                width: '30px',
                height: `${(item.count / maxCount) * 150}px`,
                backgroundColor: '#007bff',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease'
              }}
              title={`${item.date}: ${item.count}篇`}
            />
            <div style={{ 
              fontSize: '11px', 
              color: '#666', 
              marginTop: '8px',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              textAlign: 'center'
            }}>
              {item.date.split('/').slice(1).join('/')}
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 'bold',
              marginTop: '5px'
            }}>
              {item.count}
            </div>
          </div>
        ))}
      </div>
      {trendData.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          暂无趋势数据
        </div>
      )}
    </div>
  );
};

// 数据卡片组件
const StatCard = ({ title, value, color, icon }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: `1px solid ${color}20`,
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: color,
        marginBottom: '8px'
      }}>
        {value || 0}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>{title}</div>
    </div>
  );
};

export default StatsDashboard;