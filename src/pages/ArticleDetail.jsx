import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import FavoriteButton from '../components/FavoriteButton';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);

  // 检查是否是游客
  const isGuest = user && user.email === 'guest@inews.com';

  const fetchArticle = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories (name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('获取文章错误:', error);
        return;
      }

      setArticle(data);

      // 获取相关文章
      if (data) {
        const { data: related } = await supabase
          .from('news_articles')
          .select('id, title, image_url, published_at')
          .eq('category_id', data.category_id)
          .neq('id', id)
          .limit(4)
          .order('published_at', { ascending: false });

        setRelatedArticles(related || []);
      }
    } catch (error) {
      console.error('获取文章异常:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const recordReadHistory = useCallback(async () => {
  // 游客不记录阅读历史
  if (isGuest) return;
  
  if (user && article) {
    try {
      console.log('📝 记录阅读历史:', { user_id: user.id, article_id: article.id });
      
      const { data, error } = await supabase
        .from('user_read_history')
        .upsert({
          user_id: user.id,
          article_id: article.id,
          read_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('记录阅读历史错误:', error);
      } else {
        console.log('✅ 阅读历史记录成功:', data);
      }
    } catch (error) {
      console.error('记录阅读历史异常:', error);
    }
  }
}, [user, article, isGuest]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  useEffect(() => {
    if (article) {
      recordReadHistory();
    }
  }, [article, recordReadHistory]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px', margin: '0 auto 1rem' }}></div>
          <p>加载文章中...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ marginBottom: '1rem' }}>文章未找到</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            抱歉，您查找的文章不存在或已被删除
          </p>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🏠 返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* 返回按钮 */}
      <button 
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '2rem',
          padding: '10px 16px',
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        ← 返回
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* 主文章内容 */}
        <article style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)'
        }}>
          <header style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2rem', 
                lineHeight: '1.3',
                color: 'var(--text-primary)',
                flex: 1,
                marginRight: '1rem'
              }}>
                {article.title}
              </h1>
              <FavoriteButton articleId={article.id} />
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px',
              flexWrap: 'wrap'
            }}>
              <span>📰 {article.source_name}</span>
              <span>🔖 {article.news_categories?.name}</span>
              <span>📅 {new Date(article.published_at).toLocaleDateString()}</span>
              {article.author && <span>👤 {article.author}</span>}
              {isGuest && <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>👀 游客模式</span>}
            </div>
          </header>

          {article.image_url && (
            <div style={{ marginBottom: '2rem' }}>
              <img 
                src={article.image_url} 
                alt={article.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
          )}
          
          <div style={{ 
            lineHeight: '1.8', 
            fontSize: '16px', 
            color: 'var(--text-primary)',
            marginBottom: '2rem'
          }}>
            {article.summary && (
              <div style={{
                background: 'var(--background-secondary)',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                borderLeft: '4px solid var(--primary-color)'
              }}>
                <strong>摘要:</strong> {article.summary}
              </div>
            )}
            
            {article.content ? (
              article.content.split('\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '1.5rem' }}>
                  {paragraph}
                </p>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                color: 'var(--text-muted)'
              }}>
                <p>本文暂无详细内容</p>
                {article.source_url && (
                  <a 
                    href={article.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    查看原文链接
                  </a>
                )}
              </div>
            )}
          </div>

          {article.source_url && (
            <footer style={{ 
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔗 查看原文
              </a>
            </footer>
          )}
        </article>

        {/* 侧边栏 - 相关文章 */}
        <aside>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-light)',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>📚 相关文章</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {relatedArticles.map(related => (
                <div 
                  key={related.id}
                  onClick={() => navigate(`/article/${related.id}`)}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <h4 style={{ 
                    margin: '0 0 0.5rem 0',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {related.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(related.published_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {relatedArticles.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  color: 'var(--text-muted)',
                  fontSize: '14px'
                }}>
                  暂无相关文章
                </div>
              )}
            </div>

            {/* 游客提示 */}
            {isGuest && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--background-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💡 提示</div>
                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  游客模式不记录阅读历史，请登录正式账户以使用完整功能
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticleDetail;