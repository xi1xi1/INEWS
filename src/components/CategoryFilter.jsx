import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('id');

    if (error) {
      console.error('获取分类错误:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        padding: '12px 16px',
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        minWidth: '140px'
      }}>
        加载分类中...
      </div>
    );
  }

  const allCategories = [
    { id: 'all', name: '全部', icon: '📰' },
    ...categories.map(cat => ({ ...cat, icon: '📂' }))
  ];

  const selectedCategoryObj = allCategories.find(cat => 
    cat.id === selectedCategory || (selectedCategory === 'all' && cat.id === 'all')
  ) || allCategories[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--text-primary)',
          minWidth: '140px',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{selectedCategoryObj.icon}</span>
          {selectedCategoryObj.name}
        </span>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 98
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-medium)',
            zIndex: 99,
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {allCategories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange(category.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: selectedCategory === category.id ? 'var(--background-secondary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: selectedCategory === category.id ? 'var(--primary-color)' : 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.target.style.background = 'var(--background-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{category.icon}</span>
                {category.name}
                {selectedCategory === category.id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--primary-color)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryFilter;