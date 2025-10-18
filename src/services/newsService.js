// 配置
const MEDIASTACK_API_KEY = '035f2199824c98cb22dd8373138a6454';
const MEDIASTACK_BASE_URL = 'http://api.mediastack.com/v1/news';

// 分类映射 - 只保留5个主要分类
const CATEGORY_MAPPING = {
  general: 1,        
  technology: 4,     
  sports: 6,         
  entertainment: 5,  
  business: 7        
};

export class NewsService {
  // 从 Mediastack 获取新闻
  static async fetchFromMediastack(category = null, keywords = null, limit = 20) {
    try {
      console.log('🎯 开始从 Mediastack 获取新闻...', { category, limit });
      
      const params = new URLSearchParams({
        access_key: MEDIASTACK_API_KEY,
        languages: 'zh',
        limit: limit.toString(),
        sort: 'published_desc'
      });

      if (category && category in CATEGORY_MAPPING) {
        params.append('categories', category);
        console.log(`📂 设置分类: ${category}`);
      }

      if (keywords) {
        params.append('keywords', keywords);
      }

      const apiUrl = `${MEDIASTACK_BASE_URL}?${params}`;
      console.log('🔗 API URL:', apiUrl.replace(MEDIASTACK_API_KEY, '***'));

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Mediastack API 错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📨 Mediastack API 响应:', data);
      
      if (data.error) {
        throw new Error(`Mediastack API 返回错误: ${data.error.info}`);
      }

      if (!data.data || data.data.length === 0) {
        console.log('❌ 没有获取到新闻数据');
        return [];
      }

      console.log(`✅ 成功获取 ${data.data.length} 条新闻`);
      const transformedData = this.transformMediastackData(data.data);
      console.log(`🔄 转换后的数据: ${transformedData.length} 条`);
      
      return transformedData;
    } catch (error) {
      console.error('❌ 获取 Mediastack 新闻失败:', error);
      throw error;
    }
  }

  // 转换 Mediastack 数据为我们的格式
  static transformMediastackData(articles) {
    return articles
      .filter(article => {
        // 更严格的过滤
        const isValid = article.title && article.title.trim() && 
                       article.url && article.url.trim() &&
                       article.title !== '[Removed]'; // 过滤被移除的文章
        
        if (!isValid) {
          console.log('🚫 过滤无效文章:', article);
        }
        return isValid;
      })
      .map(article => {
        const transformed = {
          title: article.title.trim(),
          content: (article.description || article.title || '').trim(),
          summary: (article.description || this.generateSummary(article.title) || '').trim(),
          source_url: article.url,
          image_url: article.image || this.getFallbackImage(article.category),
          source_name: article.source || '未知来源',
          author: article.author || article.source || '未知作者',
          published_at: article.published_at || new Date().toISOString(),
          category: article.category
        };
        
        console.log('📝 转换文章:', {
          title: transformed.title.substring(0, 50) + '...',
          source: transformed.source_name,
          category: transformed.category
        });
        
        return transformed;
      });
  }

  // 生成摘要
  static generateSummary(title) {
    if (!title) return '暂无摘要';
    if (title.length > 100) {
      return title.substring(0, 100) + '...';
    }
    return title;
  }

  // 获取默认图片
  // 获取默认图片 - 改进版本
static getFallbackImage(category) {
  const fallbackImages = {
    technology: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', // 科技芯片
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400', // 机器人
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400'  // 代码编程
    ],
    sports: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400', // 足球场
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', // 篮球
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',   // 跑步
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'   // 游泳
    ],
    entertainment: [
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400', // 音乐
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', // 明星
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'  // 电视
    ],
    business: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', // 财经图表
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',   // 货币
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',   // 股票
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' // 数据分析
    ],
    general: [
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400', // 新闻报纸
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400', // 世界地图
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400', // 地球仪
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'  // 头条新闻
    ]
  };

  const categoryImages = fallbackImages[category] || fallbackImages.general;
  
  // 随机选择一个图片，避免所有文章都用同一张图
  const randomIndex = Math.floor(Math.random() * categoryImages.length);
  return categoryImages[randomIndex];
}

  // 保存到 Supabase - 修复版本
  static async saveToSupabase(articles) {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      
      console.log('🔍 开始保存到数据库');
      console.log('📋 收到的文章数量:', articles.length);
      
      if (articles.length === 0) {
        console.log('⚠️ 没有文章需要保存');
        return [];
      }

      // 验证分类表数据
      const { data: categories, error: categoriesError } = await supabase
        .from('news_categories')
        .select('id, name, slug')
        .order('id');

      if (categoriesError) {
        console.error('❌ 获取分类数据失败:', categoriesError);
        return [];
      }

      console.log('📊 可用的分类:', categories.map(c => `${c.id}:${c.name}`).join(', '));

      const savedArticles = [];
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const [index, article] of articles.entries()) {
        try {
          console.log(`\n📝 处理第 ${index + 1}/${articles.length} 篇文章:`, article.title.substring(0, 50) + '...');

          // 1. 检查是否已存在 - 使用 source_url 检查
          const { data: existing, error: checkError } = await supabase
            .from('news_articles')
            .select('id')
            .eq('source_url', article.source_url)
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            console.log('🔍 检查存在性时出错:', checkError.message);
          }

          if (existing) {
            console.log(`⏭️ 文章已存在，跳过: ${article.title.substring(0, 50)}...`);
            skipCount++;
            continue;
          }

          // 2. 获取正确的分类ID
          const categoryId = CATEGORY_MAPPING[article.category] || 1; // 默认为头条
          console.log(`📊 分类映射: ${article.category} -> ${categoryId}`);

          // 3. 准备插入数据
          const insertData = {
            title: article.title || '无标题',
            content: article.content || article.title || '暂无内容',
            summary: article.summary || this.generateSummary(article.title),
            source_url: article.source_url,
            image_url: article.image_url || this.getFallbackImage(article.category),
            category_id: categoryId,
            source_name: article.source_name || '未知来源',
            author: article.author || '未知作者',
            published_at: article.published_at || new Date().toISOString()
          };

          console.log('📤 准备插入的数据:', {
            标题: insertData.title.substring(0, 30) + '...',
            分类ID: insertData.category_id,
            来源: insertData.source_name,
            发布时间: insertData.published_at
          });

          // 4. 验证必需字段
          if (!insertData.title || !insertData.source_url) {
            console.log('🚫 缺少必需字段，跳过');
            errorCount++;
            continue;
          }

          // 5. 插入数据
          const { data, error: insertError } = await supabase
            .from('news_articles')
            .insert([insertData])
            .select();

          if (insertError) {
            console.error('❌ 插入失败:', {
              错误代码: insertError.code,
              错误信息: insertError.message,
              错误详情: insertError.details
            });
            
            if (insertError.code === '23505') { // 唯一约束冲突 (source_url)
              console.log('🔑 唯一约束冲突，跳过重复文章');
              skipCount++;
            } else if (insertError.code === '23503') { // 外键约束失败
              console.log('🔑 外键约束失败，分类ID可能不存在');
              // 使用默认分类重试
              insertData.category_id = 1;
              const { data: retryData, error: retryError } = await supabase
                .from('news_articles')
                .insert([insertData])
                .select();
                
              if (retryError) {
                console.error('❌ 重试插入也失败:', retryError);
                errorCount++;
              } else {
                savedArticles.push(retryData[0]);
                successCount++;
                console.log(`✅ 使用默认分类保存成功! ID: ${retryData[0].id}`);
              }
            } else {
              errorCount++;
            }
          } else if (data && data.length > 0) {
            savedArticles.push(data[0]);
            successCount++;
            console.log(`✅ 保存成功! ID: ${data[0].id}`);
          } else {
            console.log('❓ 插入成功但没有返回数据');
            successCount++;
          }

        } catch (error) {
          console.error('💥 处理文章时异常:', error);
          errorCount++;
        }
      }

      console.log(`\n🎉 保存完成!`);
      console.log(`✅ 成功: ${successCount} 条`);
      console.log(`⏭️ 跳过: ${skipCount} 条`);
      console.log(`❌ 错误: ${errorCount} 条`);
      console.log(`📥 总数: ${articles.length} 条`);
      
      return savedArticles;

    } catch (error) {
      console.error('💥 保存到 Supabase 失败:', error);
      return [];
    }
  }

  // 测试保存功能
  static async testSaveFunction() {
    try {
      console.log('🧪 开始测试保存功能...');
      
      const testArticle = {
        title: '测试新闻标题 ' + Date.now(),
        content: '这是测试新闻内容，用于验证数据库保存功能是否正常工作。',
        summary: '测试摘要：验证新闻保存功能',
        source_url: `https://example.com/test-${Date.now()}.html`,
        image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400',
        category: 'technology',
        source_name: '测试来源',
        author: '测试作者',
        published_at: new Date().toISOString()
      };

      console.log('📝 测试文章数据:', testArticle);
      
      const saved = await this.saveToSupabase([testArticle]);
      
      if (saved.length > 0) {
        console.log('🎉 测试保存成功! 文章ID:', saved[0].id);
        return true;
      } else {
        console.log('❌ 测试保存失败，没有保存任何文章');
        return false;
      }
    } catch (error) {
      console.error('💥 测试保存功能失败:', error);
      return false;
    }
  }

  // 测试数据库连接
  static async testDatabaseConnection() {
    try {
      console.log('🧪 测试数据库连接...');
      
      const { supabase } = await import('../lib/supabaseClient');
      
      // 测试查询 - 修复：移除未使用的 data 变量
      const { error } = await supabase
        .from('news_articles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ 数据库连接测试失败:', error);
        return false;
      }
      
      console.log('✅ 数据库连接正常');
      return true;
    } catch (error) {
      console.error('❌ 测试失败:', error);
      return false;
    }
  }

  // 批量同步所有分类
  static async syncAllCategories() {
    const categories = ['general', 'technology', 'sports', 'entertainment', 'business'];
    let totalSaved = 0;
    const results = [];

    for (const category of categories) {
      try {
        console.log(`\n🔄 正在同步分类: ${category}`);
        const articles = await this.fetchFromMediastack(category, null, 10);
        const savedArticles = await this.saveToSupabase(articles);
        totalSaved += savedArticles.length;
        results.push({
          category,
          fetched: articles.length,
          saved: savedArticles.length
        });
        
        console.log(`✅ ${category} 分类同步完成: 获取 ${articles.length} 条, 保存 ${savedArticles.length} 条`);
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ 同步 ${category} 分类失败:`, error);
        results.push({
          category,
          error: error.message
        });
      }
    }

    return {
      totalSaved,
      results
    };
  }

  // 同步单个分类
  static async syncSingleCategory(category, limit = 10) {
    try {
      console.log(`\n🔄 开始同步单个分类: ${category}`);
      const articles = await this.fetchFromMediastack(category, null, limit);
      const savedArticles = await this.saveToSupabase(articles);
      
      console.log(`✅ ${category} 分类同步完成: 获取 ${articles.length} 条, 保存 ${savedArticles.length} 条`);
      
      return {
        category,
        fetched: articles.length,
        saved: savedArticles.length,
        articles: savedArticles
      };
    } catch (error) {
      console.error(`❌ 同步 ${category} 分类失败:`, error);
      throw error;
    }
  }
}