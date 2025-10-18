import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import FavoriteButton from '../components/FavoriteButton';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 检查是否是游客
  const isGuest = user && user.email === 'guest@inews.com';

  const fetchFavorites = useCallback(async () => {
    if (!user || isGuest) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          article_id,
          created_at,
          news_articles (
            id,
            title,
            summary,
            source_url,
            image_url,
            source_name,
            published_at,
            news_categories (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取收藏错误:', error);
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('获取收藏异常:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    fetchFavorites();
  }, [user, fetchFavorites]);

  const removeFavorite = async (articleId) => {
    if (!user || isGuest) return;
    
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);

    if (!error) {
      setFavorites(favorites.filter(fav => fav.article_id !== articleId));
    } else {
      console.error('移除收藏失败:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="我的收藏">
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: '#666',
          fontSize: '16px'
        }}>
          加载收藏中...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="我的收藏">
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {!user ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#666'
          }}>
            <p style={{ fontSize: '16px', margin: 0 }}>
              请先登录查看收藏内容
            </p>
          </div>
        ) : isGuest ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#666'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
            <h3 style={{ marginBottom: '1rem' }}>游客模式限制</h3>
            <p style={{ fontSize: '16px', margin: 0 }}>
              游客模式无法使用收藏功能
            </p>
            <p style={{ fontSize: '14px', margin: '10px 0 0 0', color: '#999' }}>
              请注册或登录正式账户以使用完整功能
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#666'
          }}>
            <p style={{ fontSize: '16px', margin: 0 }}>
              暂无收藏内容
            </p>
            <p style={{ fontSize: '14px', margin: '10px 0 0 0', color: '#999' }}>
              在新闻列表中点击❤️图标即可收藏文章
            </p>
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              padding: '0 10px'
            }}>
              <h1 style={{ 
                color: '#333', 
                margin: 0, 
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                ❤️ 我的收藏
              </h1>
              <p style={{ 
                color: '#666', 
                margin: 0, 
                fontSize: '14px' 
              }}>
                共 {favorites.length} 篇收藏文章
              </p>
            </div>
            
            {favorites.map(favorite => (
              <div 
                key={favorite.article_id} 
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  {favorite.news_articles?.image_url && (
                    <img 
                      src={favorite.news_articles.image_url} 
                      alt={favorite.news_articles.title}
                      style={{
                        width: '120px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      color: '#333',
                      lineHeight: '1.4'
                    }}>
                      <a 
                        href={favorite.news_articles?.source_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'inherit', 
                          textDecoration: 'none' 
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#333';
                        }}
                      >
                        {favorite.news_articles?.title || '未知标题'}
                      </a>
                    </h3>
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#666', 
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {favorite.news_articles?.summary || '暂无摘要'}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        fontSize: '12px', 
                        color: '#999'
                      }}>
                        <span>{favorite.news_articles?.source_name || '未知来源'}</span>
                        <span>{favorite.news_articles?.news_categories?.name || '未分类'}</span>
                        <span>
                          {favorite.news_articles?.published_at 
                            ? new Date(favorite.news_articles.published_at).toLocaleDateString() 
                            : '未知日期'
                          }
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* <FavoriteButton 
                          articleId={favorite.article_id} 
                          onToggle={() => fetchFavorites()}
                        /> */}
                        <button
                          onClick={() => removeFavorite(favorite.article_id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#c82333';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#dc3545';
                          }}
                          title="取消收藏"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;