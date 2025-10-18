import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索新闻标题..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-color)';
            e.target.style.boxShadow = '0 0 0 2px rgba(255, 68, 68, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--primary-hover)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--primary-color)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          搜索
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--text-muted)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--text-secondary)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--text-muted)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            清除
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;