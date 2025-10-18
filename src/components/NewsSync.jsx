import { useState } from 'react';
import { NewsService } from '../services/newsService';

const NewsSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [syncResults, setSyncResults] = useState(null);

  const syncNews = async (category = null) => {
    setSyncing(true);
    setProgress(`正在同步 ${category ? getCategoryName(category) : '全部'} 新闻...`);
    setSyncResults(null);

    try {
      let result;
      
      if (category) {
        // 同步单个分类
        const articles = await NewsService.fetchFromMediastack(category, null, 10);
        const savedArticles = await NewsService.saveToSupabase(articles);
        result = {
          type: 'single',
          category,
          fetched: articles.length,
          saved: savedArticles.length,
          totalSaved: savedArticles.length
        };
      } else {
        // 同步所有分类
        result = await NewsService.syncAllCategories();
        result.type = 'all';
      }
      
      setSyncResults(result);
      
      // 统一处理显示数量
      const savedCount = result.totalSaved || result.saved || 0;
      setProgress(`同步完成！获取到 ${savedCount} 条新闻`);
      
      setLastSync(new Date().toLocaleString());
    } catch (error) {
      console.error('同步失败:', error);
      setProgress(`同步失败: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getCategoryName = (category) => {
    const categoryNames = {
      general: '头条',
      technology: '科技',
      sports: '体育',
      entertainment: '娱乐',
      business: '财经'
    };
    return categoryNames[category] || category;
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>新闻数据同步</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#666', marginBottom: '10px' }}>按分类同步</h4>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          marginBottom: '15px'
        }}>
          <button 
            onClick={() => syncNews('general')}
            disabled={syncing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.6 : 1
            }}
          >
            同步头条新闻
          </button>
          
          <button 
            onClick={() => syncNews('technology')}
            disabled={syncing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.6 : 1
            }}
          >
            同步科技新闻
          </button>

          <button 
            onClick={() => syncNews('sports')}
            disabled={syncing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.6 : 1
            }}
          >
            同步体育新闻
          </button>

          <button 
            onClick={() => syncNews('entertainment')}
            disabled={syncing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e83e8c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.6 : 1
            }}
          >
            同步娱乐新闻
          </button>

          <button 
            onClick={() => syncNews('business')}
            disabled={syncing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.6 : 1
            }}
          >
            同步财经新闻
          </button>
        </div>

        <div>
          <button 
            onClick={() => syncNews()}
            disabled={syncing}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: syncing ? 0.6 : 1
            }}
          >
            {syncing ? '同步中...' : '一键同步所有分类'}
          </button>
        </div>
      </div>

      {progress && (
        <div style={{
          padding: '12px',
          backgroundColor: syncing ? '#e7f3ff' : '#d4edda',
          border: `1px solid ${syncing ? '#b8daff' : '#c3e6cb'}`,
          borderRadius: '4px',
          fontSize: '14px',
          color: syncing ? '#004085' : '#155724',
          marginBottom: '15px'
        }}>
          {progress}
        </div>
      )}

      {syncResults && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>同步结果:</h5>
          {syncResults.type === 'all' ? (
            // 全部同步结果
            <div>
              <p><strong>总保存数:</strong> {syncResults.totalSaved || 0} 条</p>
              {syncResults.results && syncResults.results.map((result, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '5px 0',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <span>{getCategoryName(result.category)}:</span>
                  <span>
                    {result.error ? 
                      `错误: ${result.error}` : 
                      `获取 ${result.fetched || 0} 条, 保存 ${result.saved || 0} 条`
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // 单个分类同步结果
            <p>
              {getCategoryName(syncResults.category)}: 
              获取 {syncResults.fetched || 0} 条, 保存 {syncResults.saved || 0} 条
            </p>
          )}
        </div>
      )}

      {lastSync && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          最后同步时间: {lastSync}
        </div>
      )}
    </div>
  );
};

export default NewsSync;
