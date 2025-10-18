import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar'; 
import CategoryFilter from './CategoryFilter'; 
import FavoriteButton from './FavoriteButton'; 

const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('news_articles')
        .select(`
          *,
          news_categories (name)
        `)
        .order('published_at', { ascending: false })
        .limit(20);

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('获取新闻错误:', error);
      } else {
        setArticles(data || []);
      }
    } catch (error) {
      console.error('错误:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleArticleClick = async (articleId) => {
    if (user && user.email !== 'guest@inews.com') {
      try {
        await supabase
          .from('user_read_history')
          .upsert({
            user_id: user.id,
            article_id: articleId,
            read_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('记录阅读历史错误:', error);
      }
    }
    navigate(`/article/${articleId}`);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // 清除所有筛选条件
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // 检查是否有活跃的筛选条件
  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== 'all');

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px', margin: '0 auto 1rem' }}></div>
          <p>加载新闻中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📰 最新新闻</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          发现最新、最热门的新闻资讯
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr auto',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'start'
      }}>
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* 筛选状态和清除按钮 */}
      {hasActiveFilters && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px 16px',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span>当前筛选:</span>
            {searchTerm && (
              <span style={{
                padding: '4px 8px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                搜索: "{searchTerm}"
              </span>
            )}
            {selectedCategory && selectedCategory !== 'all' && (
              <span style={{
                padding: '4px 8px',
                backgroundColor: 'var(--secondary-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                分类: {selectedCategory}
              </span>
            )}
            <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              找到 {articles.length} 条结果
            </span>
          </div>
          
          <button
            onClick={clearAllFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--primary-color)',
              border: '1px solid var(--primary-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-color)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--primary-color)';
            }}
          >
            返回首页
          </button>
        </div>
      )}

      {/* 新闻列表 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {articles.map(article => (
          <div 
            key={article.id} 
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-light)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => handleArticleClick(article.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-medium)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-light)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* 新闻图片 */}
            <div style={{ position: 'relative' }}>
              <img 
                src={article.image_url || 'https://via.placeholder.com/300x200'} 
                alt={article.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />
              {/* 收藏按钮 - 放在右上角 */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px'
              }}>
                <FavoriteButton articleId={article.id} />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'var(--primary-color)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {article.news_categories?.name || '未分类'}
              </div>
            </div>

            {/* 新闻内容 */}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ 
                margin: '0 0 1rem 0',
                fontSize: '1.2rem',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {article.title}
              </h3>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.5',
                marginBottom: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {article.summary}
              </p>

              {/* 文章信息 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span>👤 {article.source_name}</span>
                  <span>📅 {new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {articles.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-light)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {hasActiveFilters ? '🔍' : '📰'}
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {hasActiveFilters ? '没有找到相关新闻' : '暂无新闻数据'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {hasActiveFilters ? `没有找到符合筛选条件的新闻` : '请稍后再来查看'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '10px 20px',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-medium)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              📰 查看所有新闻
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsList;