// pages/api/search.js - 配置真实API的版本
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { keyword } = req.body;
  console.log(`🔍 搜索真实新闻: ${keyword}`);

  try {
    const results = await searchMultipleAPIs(keyword);
    
    return res.status(200).json({
      results: results.slice(0, 20),
      source: '真实新闻API聚合',
      apis: ['NewsAPI', 'GNews', 'Currents API'],
      total: results.length,
      note: '来自多个真实新闻源的聚合数据'
    });
    
  } catch (error) {
    console.error('搜索失败:', error);
    return res.status(200).json({ 
      results: [],
      source: 'API错误',
      message: '新闻API暂时不可用，请稍后重试'
    });
  }
}

async function searchMultipleAPIs(keyword) {
  console.log(`🚀 开始多API搜索: ${keyword}`);
  const allResults = [];

  // 1. NewsAPI (你现有的)
  try {
    const newsApiResults = await searchNewsAPI(keyword);
    allResults.push(...newsApiResults);
    console.log(`✅ NewsAPI: ${newsApiResults.length} 条结果`);
  } catch (error) {
    console.log('❌ NewsAPI失败:', error.message);
  }

  // 2. GNews API (你的新密钥)
  try {
    const gnewsResults = await searchGNews(keyword);
    allResults.push(...gnewsResults);
    console.log(`✅ GNews: ${gnewsResults.length} 条结果`);
  } catch (error) {
    console.log('❌ GNews失败:', error.message);
  }

  // 3. Currents API (你的新密钥)
  try {
    const currentsResults = await searchCurrentsAPI(keyword);
    allResults.push(...currentsResults);
    console.log(`✅ Currents API: ${currentsResults.length} 条结果`);
  } catch (error) {
    console.log('❌ Currents API失败:', error.message);
  }

  if (allResults.length === 0) {
    console.log('⚠️ 所有API都没有返回结果');
    return [];
  }

  // 去重、排序和格式化
  const uniqueResults = deduplicateByUrl(allResults);
  const sortedResults = sortByRelevanceAndTime(uniqueResults, keyword);
  
  console.log(`🎯 最终结果: ${sortedResults.length} 条真实新闻`);
  return formatResults(sortedResults);
}

// 1. NewsAPI (现有的)
async function searchNewsAPI(keyword) {
  const apiKey = process.env.NEWS_API_KEY || '38d7435eba30426c9389f558880205a4';
  
  try {
    // 多种搜索策略
    const searchQueries = [
      `"${keyword}"`, // 精确匹配
      `${keyword} 生物医药`,
      `${keyword} biotech pharmaceutical`,
      keyword // 基础搜索
    ];

    const allArticles = [];

    for (const query of searchQueries) {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=8&apiKey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok' && data.articles) {
          const validArticles = data.articles.filter(article => 
            article.title && 
            article.title !== '[Removed]' && 
            article.url && 
            !article.url.includes('removed.com') &&
            (article.title.toLowerCase().includes(keyword.toLowerCase()) || 
             (article.description && article.description.toLowerCase().includes(keyword.toLowerCase())))
          );
          
          allArticles.push(...validArticles);
        }
        
        // 避免API限制
        await sleep(200);
      } catch (queryError) {
        console.log(`NewsAPI查询失败: ${query}`, queryError.message);
      }
    }

    return allArticles.slice(0, 10);

  } catch (error) {
    console.error('NewsAPI错误:', error);
    return [];
  }
}

// 2. GNews API (你的密钥)
async function searchGNews(keyword) {
  const apiKey = process.env.GNEWS_API_KEY || 'f9b1822416bb333df57ee96df6612298';
  
  try {
    console.log('🔍 GNews搜索开始...');
    
    // GNews支持多种搜索方式
    const searches = [
      {
        url: `https://gnews.io/api/v4/search?q="${keyword}"&lang=zh&country=cn&max=8&apikey=${apiKey}`,
        type: '中文精确搜索'
      },
      {
        url: `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword + ' 生物医药')}&lang=zh&max=6&apikey=${apiKey}`,
        type: '中文领域搜索'
      },
      {
        url: `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword + ' biotech')}&lang=en&max=6&apikey=${apiKey}`,
        type: '英文搜索'
      }
    ];

    const allArticles = [];

    for (const search of searches) {
      try {
        console.log(`GNews ${search.type}...`);
        
        const response = await fetch(search.url);
        const data = await response.json();
        
        if (data.articles && Array.isArray(data.articles)) {
          console.log(`GNews ${search.type} 找到 ${data.articles.length} 条`);
          allArticles.push(...data.articles.map(article => ({
            ...article,
            apiSource: 'GNews'
          })));
        } else {
          console.log(`GNews ${search.type} 无结果:`, data);
        }
        
        await sleep(300);
      } catch (searchError) {
        console.log(`GNews ${search.type} 失败:`, searchError.message);
      }
    }

    console.log(`GNews 总共获得 ${allArticles.length} 条结果`);
    return allArticles.slice(0, 12);

  } catch (error) {
    console.error('GNews API错误:', error);
    return [];
  }
}

// 3. Currents API (你的密钥)
async function searchCurrentsAPI(keyword) {
  const apiKey = process.env.CURRENTS_API_KEY || 'fHo3EjtYNXg9oiN0YtpkGZK6Tp4XHjrmeqYp43a9V1_KraYV';
  
  try {
    console.log('🔍 Currents API搜索开始...');
    
    // Currents API搜索
    const searches = [
      {
        url: `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(keyword)}&language=zh&apiKey=${apiKey}`,
        type: '中文搜索'
      },
      {
        url: `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(keyword + ' biotech')}&language=en&apiKey=${apiKey}`,
        type: '英文搜索'
      }
    ];

    const allArticles = [];

    for (const search of searches) {
      try {
        console.log(`Currents ${search.type}...`);
        
        const response = await fetch(search.url);
        const data = await response.json();
        
        if (data.status === 'ok' && data.news && Array.isArray(data.news)) {
          console.log(`Currents ${search.type} 找到 ${data.news.length} 条`);
          allArticles.push(...data.news.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: { name: article.author || 'Currents' },
            publishedAt: article.published,
            apiSource: 'Currents'
          })));
        } else {
          console.log(`Currents ${search.type} 无结果:`, data);
        }
        
        await sleep(300);
      } catch (searchError) {
        console.log(`Currents ${search.type} 失败:`, searchError.message);
      }
    }

    console.log(`Currents 总共获得 ${allArticles.length} 条结果`);
    return allArticles.slice(0, 10);

  } catch (error) {
    console.error('Currents API错误:', error);
    return [];
  }
}

// URL去重
function deduplicateByUrl(articles) {
  const seen = new Set();
  const unique = [];
  
  for (const article of articles) {
    if (article.url && !seen.has(article.url)) {
      seen.add(article.url);
      unique.push(article);
    }
  }
  
  console.log(`去重后: ${unique.length} 条唯一新闻`);
  return unique;
}

// 按相关性和时间排序
function sortByRelevanceAndTime(articles, keyword) {
  return articles.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, keyword);
    const scoreB = calculateRelevanceScore(b, keyword);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // 相关性优先
    }
    
    // 相关性相同时按时间排序
    const timeA = new Date(a.publishedAt || a.published || 0);
    const timeB = new Date(b.publishedAt || b.published || 0);
    return timeB - timeA;
  });
}

// 计算相关性分数
function calculateRelevanceScore(article, keyword) {
  let score = 0;
  const keywordLower = keyword.toLowerCase();
  
  // 标题匹配 (最重要)
  if (article.title && article.title.toLowerCase().includes(keywordLower)) {
    score += 10;
  }
  
  // 描述匹配
  if (article.description && article.description.toLowerCase().includes(keywordLower)) {
    score += 5;
  }
  
  // 精确匹配加分
  if (article.title && article.title.toLowerCase().includes(`"${keywordLower}"`)) {
    score += 5;
  }
  
  // 生物医药相关词汇加分
  const bioKeywords = ['生物', '医药', '药物', '临床', '治疗', 'biotech', 'pharmaceutical', 'drug', 'clinical'];
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();
  
  bioKeywords.forEach(bioKeyword => {
    if (text.includes(bioKeyword)) {
      score += 2;
    }
  });
  
  // 时间权重 (越新越好)
  if (article.publishedAt || article.published) {
    const publishTime = new Date(article.publishedAt || article.published);
    const hoursAgo = (Date.now() - publishTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 24) score += 3;
    else if (hoursAgo < 72) score += 1;
  }
  
  return score;
}

// 格式化最终结果
function formatResults(articles) {
  return articles.map((article, index) => ({
    id: index + 1,
    title: article.title,
    source: article.source?.name || article.author || '未知来源',
    platform: article.apiSource || '新闻聚合',
    publishTime: formatPublishTime(article.publishedAt || article.published),
    sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
    content: article.description || article.title.substring(0, 200) + '...',
    url: article.url,
    isReal: true,
    apiSource: article.apiSource
  }));
}

// 格式化发布时间
function formatPublishTime(timeString) {
  if (!timeString) return '时间未知';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '时间格式错误';
  }
}

// 情感分析
function analyzeSentiment(text) {
  if (!text) return '中性';
  
  const positiveWords = [
    '增长', '上涨', '成功', '突破', '获得', '批准', '利好', '超预期',
    '强劲', '优异', '领先', '创新', '进展', 'positive', 'growth', 'success'
  ];
  
  const negativeWords = [
    '下跌', '下降', '失败', '风险', '延迟', '拒绝', '担忧', '困难',
    '挫折', '警告', '问题', 'decline', 'risk', 'concern', 'delay'
  ];

  const lowerText = text.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return '正面';
  if (negativeCount > positiveCount) return '负面';
  return '中性';
}

// 辅助函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
