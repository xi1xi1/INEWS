import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const FavoriteButton = ({ articleId }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // 检查是否是游客
  const isGuest = user && user.email === 'guest@inews.com';

  const checkIfFavorite = useCallback(async () => {
    if (!user || isGuest) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('检查收藏状态错误:', error);
        return;
      }
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('检查收藏状态异常:', error);
    }
  }, [user, articleId, isGuest]);

  useEffect(() => {
    if (user && !isGuest) {
      checkIfFavorite();
    }
  }, [user, articleId, checkIfFavorite, isGuest]);

  const toggleFavorite = async (e) => {
    // 阻止事件冒泡，防止触发父元素的点击事件
    e.stopPropagation();
    
    // 游客不允许收藏
    if (isGuest) {
      alert('游客模式无法收藏文章，请注册或登录正式账户以使用完整功能');
      return;
    }

    if (!user) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite) {
        // 取消收藏
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
        
        if (error) {
          console.error('取消收藏错误:', error);
        } else {
          setIsFavorite(false);
        }
      } else {
        // 添加收藏
        const { error } = await supabase
          .from('user_favorites')
          .insert([
            { 
              user_id: user.id, 
              article_id: articleId 
            }
          ])
          .select()
          .single();
        
        if (error) {
          console.error('添加收藏错误:', error);
          if (error.code === '23505') {
            setIsFavorite(true);
          }
        } else {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('收藏操作异常:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        color: isFavorite ? 'var(--primary-color)' : 'var(--text-muted)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '20px',
        padding: '8px',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
      title={isGuest ? '收藏功能（请登录正式账户）' : (isFavorite ? '取消收藏' : '收藏文章')}
    >
      {loading ? '⏳' : (isFavorite ? '❤️' : '🤍')} 
    </button>
  );
};

export default FavoriteButton;