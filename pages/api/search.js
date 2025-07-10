// pages/api/search.js - 真实新闻搜索API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { keyword } = req.body;
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.log('No API key found, using mock data');
    return res.status(200).json(getMockResults(keyword));
  }

  try {
    console.log(`Searching for: ${keyword}`);
    
    // 使用NewsAPI搜索
    const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=zh&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MediaMonitoringTool/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    const newsData = await response.json();
    
    if (newsData.status === 'ok' && newsData.articles) {
      const formattedResults = newsData.articles
        .filter(article => article.title && article.title !== '[Removed]')
        .map((article, index) => ({
          id: index + 1,
          title: article.title,
          source: article.source?.name || '未知来源',
          publishTime: new Date(article.publishedAt).toLocaleString('zh-CN'),
          sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
          content: article.description || article.title,
          url: article.url
        }));

      console.log(`Found ${formattedResults.length} real articles for ${keyword}`);
      
      return res.status(200).json({ 
        results: formattedResults,
        source: 'NewsAPI',
        total: newsData.totalResults 
      });
    } else {
      throw new Error('No articles found');
    }
    
  } catch (error) {
    console.error('NewsAPI search failed:', error.message);
    
    // API失败时使用增强的模拟数据
    console.log(`Falling back to enhanced mock data for ${keyword}`);
    return res.status(200).json(getMockResults(keyword));
  }
}

// 情感分析函数
function analyzeSentiment(text) {
  const positiveWords = [
    '增长', '提升', '突破', '成功', '批准', '获得', '积极', '良好',
    '强劲', '超预期', '利好', '上涨', '突破性', '重大', '显著',
    '创新', '领先', '优秀', '卓越', '进展', '里程碑', '认可'
  ];
  
  const negativeWords = [
    '下跌', '失败', '风险', '问题', '延迟', '拒绝', '担忧', '下降',
    '挫折', '困难', '警告', '亏损', '暂停', '撤回', '质疑', '争议'
  ];

  const lowerText = text.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return '正面';
  if (negativeCount > positiveCount) return '负面';
  return '中性';
}

// 增强的模拟数据（当API不可用时使用）
function getMockResults(keyword) {
  const templates = {
    '天境生物': [
      {
        title: "天境生物Q3财报超预期，核心产品销售强劲增长35%",
        source: "医药经济报",
        sentiment: "正面",
        content: "天境生物发布第三季度财务业绩，多个核心产品销售表现超出市场预期，显示出强劲的商业化能力。",
        baseUrl: "https://www.pharmadl.com"
      },
      {
        title: "天境生物与全球制药巨头签署10亿美元战略合作协议",
        source: "生物谷",
        sentiment: "正面", 
        content: "此次合作将加速天境生物产品的全球化布局，预计将在未来5年内带来显著收益。",
        baseUrl: "https://www.bioon.com"
      },
      {
        title: "天境生物创新药获FDA快速通道认定",
        source: "药明康德",
        sentiment: "正面",
        content: "FDA授予天境生物创新药物快速通道认定，有望加速审批进程。",
        baseUrl: "https://www.wuxiapptec.com"
      }
    ],
    'I-Mab': [
      {
        title: "I-Mab announces positive Phase III trial results for lead candidate",
        source: "BioPharma Dive",
        sentiment: "正面",
        content: "I-Mab's lead oncology candidate demonstrates significant efficacy in late-stage clinical trial.",
        baseUrl: "https://www.biopharmadive.com"
      },
      {
        title: "I-Mab expands manufacturing capabilities with new Shanghai facility",
        source: "Fierce Biotech",
        sentiment: "正面",
        content: "The new facility will support I-Mab's growing product pipeline and commercial operations.",
        baseUrl: "https://www.fiercebiotech.com"
      }
    ],
    '菲泽妥单抗': [
      {
        title: "菲泽妥单抗获得国家药监局优先审评资格",
        source: "NMPA官网",
        sentiment: "正面",
        content: "国家药品监督管理局将菲泽妥单抗纳入优先审评品种，预计审评时间将大幅缩短。",
        baseUrl: "https://www.nmpa.gov.cn"
      },
      {
        title: "菲泽妥单抗三期临床试验达到主要终点",
        source: "医药魔方",
        sentiment: "正面",
        content: "临床试验结果显示，菲泽妥单抗在安全性和有效性方面均表现优异。",
        baseUrl: "https://www.pharmcube.com"
      }
    ],
    'felzartamab': [
      {
        title: "Felzartamab receives FDA Breakthrough Therapy designation",
        source: "FDA News",
        sentiment: "正面",
        content: "FDA grants Breakthrough Therapy designation for felzartamab in autoimmune disorders.",
        baseUrl: "https://www.fda.gov"
      }
    ],
    '尤莱利单抗': [
      {
        title: "尤莱利单抗银屑病适应症NDA获正式受理",
        source: "CDE官网",
        sentiment: "正面",
        content: "药品审评中心正式受理尤莱利单抗银屑病适应症的新药上市申请。",
        baseUrl: "https://www.cde.org.cn"
      }
    ],
    '臧敬五': [
      {
        title: "臧敬五博士荣获生物医药创新领袖奖",
        source: "中国生物技术协会",
        sentiment: "正面",
        content: "表彰其在生物医药创新领域的杰出贡献和领导力。",
        baseUrl: "https://www.cnbio.net"
      }
    ]
  };

  const keywordTemplates = templates[keyword] || [
    {
      title: `${keyword}最新研发进展获得重要突破`,
      source: "生物医药网",
      sentiment: "正面",
      content: `${keyword}在临床研究中取得积极进展，显示出良好的发展前景。`,
      baseUrl: "https://www.biopharm.net"
    },
    {
      title: `${keyword}获得行业专家高度认可`,
      source: "医药观察家",
      sentiment: "正面", 
      content: `业内专家对${keyword}的发展潜力给予积极评价。`,
      baseUrl: "https://www.pharmwatch.cn"
    }
  ];

  const results = keywordTemplates.map((template, index) => ({
    id: index + 1,
    title: template.title,
    source: template.source,
    publishTime: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleString('zh-CN'),
    sentiment: template.sentiment,
    content: template.content,
    url: `${template.baseUrl}/news/${keyword.toLowerCase()}-${Date.now()}-${index}`
  }));

  return { 
    results, 
    source: 'Enhanced Mock Data',
    note: '当前使用增强模拟数据，配置API密钥后将显示真实新闻'
  };
}
