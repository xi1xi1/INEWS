import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const ReadHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 检查是否是游客
  const isGuest = user && user.email === 'guest@inews.com';

  const fetchReadHistory = useCallback(async () => {
    if (!user || isGuest) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_read_history')
        .select(`
          id,
          article_id,
          read_at,
          news_articles (
            id,
            title,
            summary,
            source_name,
            image_url,
            published_at,
            news_categories (name)
          )
        `)
        .eq('user_id', user.id)
        .order('read_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('获取阅读历史错误:', error);
        return;
      }

      // 过滤掉文章已被删除的记录
      const validHistory = (data || []).filter(record => 
        record.news_articles && record.news_articles.id
      );
      
      setHistory(validHistory);
      
    } catch (error) {
      console.error('获取阅读历史异常:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    fetchReadHistory();
  }, [fetchReadHistory]);

  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  const clearHistory = async () => {
    if (!user || isGuest) return;
    
    if (!window.confirm('确定要清空所有阅读历史吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_read_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('清空历史错误:', error);
        alert('清空历史失败');
        return;
      }

      setHistory([]);
    } catch (error) {
      console.error('清空历史异常:', error);
      alert('清空历史时发生错误');
    }
  };

  const formatReadTime = (readAt) => {
    const now = new Date();
    const readDate = new Date(readAt);
    const diffInHours = Math.floor((now - readDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}天前`;
    return readDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px', margin: '0 auto 1rem' }}></div>
          <p>加载阅读历史中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📖 阅读历史</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          查看您最近阅读的新闻文章
        </p>
      </div>

      {!user ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ marginBottom: '1rem' }}>请先登录</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            登录后即可查看您的阅读历史
          </p>
        </div>
      ) : isGuest ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👀</div>
          <h3 style={{ marginBottom: '1rem' }}>游客模式限制</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            游客模式不记录阅读历史，请注册或登录正式账户以使用完整功能
          </p>
        </div>
      ) : history.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ marginBottom: '1rem' }}>暂无阅读历史</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            阅读过的文章会自动记录在这里
          </p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>阅读记录</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                共 {history.length} 条记录
              </p>
            </div>
            <button
              onClick={clearHistory}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--error-color)',
                border: '1px solid var(--error-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--error-color)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--error-color)';
              }}
            >
              🗑️ 清空历史
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map(record => (
              <div 
                key={record.id} 
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'white'
                }}
                onClick={() => handleArticleClick(record.article_id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-light)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {record.news_articles.image_url && (
                  <img 
                    src={record.news_articles.image_url} 
                    alt={record.news_articles.title}
                    style={{
                      width: '120px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      flexShrink: 0
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '16px',
                    lineHeight: '1.4',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {record.news_articles.title}
                  </h4>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: 'var(--text-secondary)', 
                    fontSize: '14px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {record.news_articles.summary}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    fontSize: '12px', 
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap'
                  }}>
                    <span>📰 {record.news_articles.source_name}</span>
                    <span>🔖 {record.news_articles.news_categories?.name}</span>
                    <span>🕒 {formatReadTime(record.read_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadHistory;