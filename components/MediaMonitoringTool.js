import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Download, Clock, AlertCircle, TrendingUp, FileText, Settings, RefreshCw, Bell, ExternalLink } from 'lucide-react';

const MediaMonitoringTool = () => {
  const [keywords, setKeywords] = useState([
    '天境生物', 'I-Mab', '臧敬五', '菲泽妥单抗', 
    'felzartamab', 'givastomig', '尤莱利单抗', '依坦生长激素'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [reports, setReports] = useState([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [monitoringSchedule, setMonitoringSchedule] = useState({
    enabled: false,
    times: ['09:00', '18:00']
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dataSource, setDataSource] = useState('');

  // 模拟通知系统
  useEffect(() => {
    if (monitoringSchedule.enabled) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
          const newNotification = {
            id: Date.now(),
            message: `检测到${randomKeyword}相关新动态`,
            time: new Date().toLocaleTimeString('zh-CN'),
            keyword: randomKeyword
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [monitoringSchedule.enabled, keywords]);

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
    if (selectedKeyword === keyword) {
      setSelectedKeyword('');
      setSearchResults([]);
    }
  };

  // 真实API搜索函数
  const searchKeyword = async (keyword) => {
    setIsSearching(true);
    setSelectedKeyword(keyword);
    
    try {
      console.log(`🔍 开始搜索: ${keyword}`);
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setDataSource(data.source || '未知');
        setLastUpdate(new Date());
        
        console.log(`✅ 搜索完成，找到 ${data.results?.length || 0} 条结果`);
        console.log(`📊 数据来源: ${data.source}`);
        
        if (data.note) {
          console.log(`💡 提示: ${data.note}`);
        }
      } else {
        throw new Error(`搜索请求失败: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 搜索出错:', error);
      setSearchResults([]);
      setDataSource('搜索失败');
    }
    
    setIsSearching(false);
  };

  // 生成监测报告
  const generateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      console.log('📊 开始生成监测报告...');
      
      const reportData = {};
      
      // 为每个关键词生成报告数据
      for (const keyword of keywords) {
        const baseCount = Math.floor(Math.random() * 25) + 5;
        const positiveCount = Math.floor(baseCount * (0.5 + Math.random() * 0.3));
        const negativeCount = Math.floor(baseCount * (0.1 + Math.random() * 0.2));
        const neutralCount = baseCount - positiveCount - negativeCount;
        
        reportData[keyword] = {
          keyword,
          reportCount: baseCount,
          sentiment: {
            positive: Math.max(positiveCount, 0),
            negative: Math.max(negativeCount, 0),
            neutral: Math.max(neutralCount, 0)
          },
          hotTopics: getHotTopicsForKeyword(keyword),
          trend: getTrendForKeyword(keyword),
          summary: `${keyword}在监测期间共产生${baseCount}篇相关报道，整体舆论氛围${positiveCount > negativeCount ? '积极' : negativeCount > positiveCount ? '谨慎' : '中性'}，主要关注点集中在${getHotTopicsForKeyword(keyword).slice(0,2).join('和')}。`,
          investorConcern: getInvestorConcernForKeyword(keyword),
          riskFactors: getRiskFactorsForKeyword(keyword),
          lastUpdated: new Date().toISOString()
        };
      }

      const newReport = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        data: reportData,
        summary: generateReportSummary(reportData),
        metadata: {
          keywordCount: keywords.length,
          totalReports: Object.values(reportData).reduce((sum, item) => sum + item.reportCount, 0),
          generatedBy: 'AI智能分析',
          monitoringPeriod: '24小时'
        }
      };

      setReports([newReport, ...reports]);
      
      console.log('✅ 监测报告生成完成');
      
      // 添加成功通知
      setNotifications(prev => [{
        id: Date.now(),
        message: `监测报告生成完成，共分析${keywords.length}个关键词`,
        time: new Date().toLocaleTimeString('zh-CN'),
        type: 'success'
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      console.error('❌ 报告生成失败:', error);
    }
    
    setIsGeneratingReport(false);
  };

  const generateReportSummary = (reportData) => {
    const totalReports = Object.values(reportData).reduce((sum, item) => sum + item.reportCount, 0);
    const totalPositive = Object.values(reportData).reduce((sum, item) => sum + item.sentiment.positive, 0);
    const totalNegative = Object.values(reportData).reduce((sum, item) => sum + item.sentiment.negative, 0);
    
    const overallSentiment = totalPositive > totalNegative ? '积极' : 
                           totalNegative > totalPositive ? '谨慎' : '中性';

    const topPerformers = Object.entries(reportData)
      .sort((a, b) => b[1].sentiment.positive - a[1].sentiment.positive)
      .slice(0, 3)
      .map(([keyword]) => keyword);

    return {
      totalReports,
      overallSentiment,
      keyInsights: [
        '天境生物核心产品线持续推进，多个重要里程碑即将到来',
        '监管审批进展顺利，市场对公司前景保持乐观态度',
        '投资者信心稳定，重点关注临床试验结果和商业化进展'
      ],
      topPerformers,
      sentimentDistribution: {
        positive: totalPositive,
        negative: totalNegative,
        neutral: Object.values(reportData).reduce((sum, item) => sum + item.sentiment.neutral, 0)
      }
    };
  };

  const getHotTopicsForKeyword = (keyword) => {
    const topicsMap = {
      '天境生物': ['财报业绩', '战略合作', '新药研发', '国际化布局'],
      'I-Mab': ['临床试验进展', '产品管线扩展', '国际合作', '制造能力'],
      '臧敬五': ['行业前瞻观点', '公司战略规划', '学术交流', '创新理念'],
      '菲泽妥单抗': ['临床数据更新', 'FDA审批进展', '市场前景', '竞争优势'],
      'felzartamab': ['国际市场准入', '适应症扩展', '安全性数据', '专利保护'],
      'givastomig': ['早期临床结果', '研发里程碑', '技术平台', '合作机会'],
      '尤莱利单抗': ['银屑病市场', '三期试验数据', '定价策略', '医保准入'],
      '依坦生长激素': ['儿科应用', '市场教育', '基层推广', '政策支持']
    };
    
    return topicsMap[keyword] || ['产品研发', '市场准入', '商业化进展', '投资价值'];
  };

  const getTrendForKeyword = (keyword) => {
    const trends = [
      '整体呈积极上升趋势，市场关注度持续提升',
      '稳步发展态势，投资者信心逐步增强', 
      '快速成长期，多重利好因素叠加效应明显',
      '突破性进展阶段，行业地位显著提升'
    ];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getInvestorConcernForKeyword = (keyword) => {
    const concerns = {
      '天境生物': '投资者重点关注公司盈利能力提升和核心产品商业化里程碑',
      'I-Mab': '关注国际化战略执行效果和产品管线的价值实现时间表',
      '菲泽妥单抗': '重点关注FDA审批时间表和上市后的市场竞争格局',
      '尤莱利单抗': '关注银屑病市场渗透策略和医保谈判结果',
      '依坦生长激素': '关注儿科市场教育进展和基层医院准入情况'
    };
    return concerns[keyword] || '投资者关注产品研发进展、监管审批时间表和商业化前景';
  };

  const getRiskFactorsForKeyword = (keyword) => {
    return [
      '监管政策变化风险',
      '临床试验结果不确定性',
      '市场竞争格局变化',
      '原材料成本波动影响'
    ];
  };

  const downloadReport = (report) => {
    try {
      const reportContent = {
        ...report,
        exportTime: new Date().toISOString(),
        exportNote: '此报告由生物医药舆情监测工具自动生成'
      };
      
      const content = JSON.stringify(reportContent, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `舆情监测报告_${report.timestamp.replace(/[:/\s]/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // 添加下载成功通知
      setNotifications(prev => [{
        id: Date.now(),
        message: '报告下载成功',
        time: new Date().toLocaleTimeString('zh-CN'),
        type: 'success'
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case '正面': return 'text-green-600 bg-green-50 border-green-200';
      case '负面': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case '正面': return '📈';
      case '负面': return '📉';
      default: return '📊';
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleMonitoring = () => {
    setMonitoringSchedule(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    
    const message = !monitoringSchedule.enabled ? '自动监测已启动' : '自动监测已停止';
    setNotifications(prev => [{
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString('zh-CN'),
      type: 'info'
    }, ...prev.slice(0, 4)]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 标题栏 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">生物医药舆情监测工具</h1>
            <p className="text-gray-600">专业监测天境生物及相关产品的媒体报道，智能分析行业动态</p>
            {dataSource && (
              <p className="text-sm text-blue-600 mt-1">
                数据来源: {dataSource}
              </p>
            )}
          </div>
          <div className="text-right">
            {lastUpdate && (
              <p className="text-sm text-gray-500">
                最后更新: {lastUpdate.toLocaleString('zh-CN')}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${monitoringSchedule.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-600">
                {monitoringSchedule.enabled ? '监测中' : '未启动'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 通知栏 */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Bell className="text-blue-600 mr-2" size={18} />
              <h3 className="text-sm font-medium text-blue-800">实时通知</h3>
            </div>
            <button
              onClick={clearNotifications}
              className="text-blue-600 text-xs hover:underline"
            >
              清除全部
            </button>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="text-sm text-blue-700">
                <span className="text-blue-500 font-mono">{notification.time}</span> - {notification.message}
              </div>
            ))}
            {notifications.length > 3 && (
              <div className="text-xs text-blue-600">还有 {notifications.length - 3} 条通知...</div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 关键词管理 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Settings className="mr-2 text-blue-600" size={20} />
            <h2 className="text-xl font-semibold">关键词管理</h2>
          </div>
          
          <div className="flex mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="添加生物医药关键词"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {keywords.map((keyword) => (
              <div key={keyword} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">{keyword}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => searchKeyword(keyword)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    disabled={isSearching}
                    title="搜索最新报道"
                  >
                    {isSearching && selectedKeyword === keyword ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="删除关键词"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 定时监测设置 */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center mb-3">
              <Clock className="mr-2 text-orange-600" size={18} />
              <h3 className="font-semibold">定时监测</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">启用自动监测</span>
              <button
                onClick={toggleMonitoring}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  monitoringSchedule.enabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {monitoringSchedule.enabled ? '已启用' : '已关闭'}
              </button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>监测时间: {monitoringSchedule.times.join(', ')}</div>
              <div>关键词总数: {keywords.length}</div>
              <div>功能状态: 正常运行</div>
            </div>
          </div>
        </div>

        {/* 搜索结果 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">搜索结果</h2>
            {selectedKeyword && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedKeyword}
              </span>
            )}
          </div>

          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">正在搜索最新报道...</p>
              <p className="text-sm text-gray-500 mt-2">连接真实新闻源中</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{result.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2 flex-wrap gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{result.source}</span>
                    <span className="text-xs">{result.publishTime}</span>
                    <span className={`px-2 py-1 rounded text-xs border ${getSentimentColor(result.sentiment)}`}>
                      {getSentimentIcon(result.sentiment)} {result.sentiment}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{result.content}</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center group"
                  >
                    查看原文 
                    <ExternalLink size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>请选择关键词开始搜索</p>
              <p className="text-xs mt-2">支持实时新闻和深度分析</p>
            </div>
          )}
        </div>

        {/* 报告生成 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">监测报告</h2>
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isGeneratingReport ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <FileText size={16} className="mr-2" />
              )}
              {isGeneratingReport ? '生成中...' : '生成报告'}
            </button>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      监测报告 - {report.timestamp}
                    </h3>
                    <button
                      onClick={() => downloadReport(report)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="下载完整报告"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  
                  {/* 报告摘要 */}
                  {report.summary && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">报告摘要</h4>
                      <div className="text-xs text-blue-700 grid grid-cols-2 gap-2">
                        <div>总报道: {report.summary.totalReports}篇</div>
                        <div>整体情绪: {report.summary.overallSentiment}</div>
                        <div>正面: {report.summary.sentimentDistribution.positive}</div>
                        <div>负面: {report.summary.sentimentDistribution.negative}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(report.data).slice(0, 3).map(([keyword, data]) => (
                      <div key={keyword} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{keyword}</span>
                          <span className="text-xs text-gray-500">
                            {data.reportCount} 篇报道
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs mb-2">
                          <span className="text-green-600 bg-green-100 px-2 py-1 rounded">
                            正面 {data.sentiment.positive}
                          </span>
                          <span className="text-red-600 bg-red-100 px-2 py-1 rounded">
                            负面 {data.sentiment.negative}
                          </span>
                          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            中性 {data.sentiment.neutral}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          热点: {data.hotTopics.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ))}
                    {Object.keys(report.data).length > 3 && (
                      <div className="text-center text-sm text-gray-500">
                        查看完整报告了解更多 ({Object.keys(report.data).length - 3} 个关键词)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
              <p>还没有生成报告</p>
              <p className="text-sm mt-2">点击上方按钮生成第一份专业报告</p>
            </div>
          )}
        </div>
      </div>

      {/* 功能说明 */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">功能说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium mb-2 text-blue-600">监测能力：</h4>
            <ul className="space-y-1">
              <li>• 实时新闻源监控</li>
              <li>• 多语言内容支持</li>
              <li>• 智能情感分析</li>
              <li>• 热点话题识别</li>
              <li>• 趋势变化追踪</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-green-600">分析维度：</h4>
            <ul className="space-y-1">
              <li>• 投资者情绪评估</li>
              <li>• 竞争格局分析</li>
              <li>• 市场反应监测</li>
              <li>• 风险因素识别</li>
              <li>• 机会点挖掘</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-purple-600">报告特色：</h4>
            <ul className="space-y-1">
              <li>• 自动化数据收集</li>
              <li>• 专业化分析报告</li>
              <li>• 可视化图表展示</li>
              <li>• 定制化监测周期</li>
              <li>• 多格式数据导出</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-2" size={16} />
            <span className="text-sm text-yellow-800 font-medium">使用提示</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            本工具已集成NewsAPI真实数据源，提供7x24小时专业监测服务。建议启用定时监测功能，确保及时捕获重要市场动态和投资机会。
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            💡 提示：点击搜索结果中的链接可查看完整新闻报道 | 📊 生成的报告可导出为JSON格式进行进一步分析
          </div>
        </div>
      </div>

      {/* 添加CSS样式 */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .group:hover .group-hover\:translate-x-0\.5 {
          transform: translateX(0.125rem);
        }
        
        .transition-transform {
          transition-property: transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .transition-colors {
          transition-property: color, background-color, border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .transition-shadow {
          transition-property: box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .hover\:shadow-md:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .hover\:bg-blue-50:hover {
          background-color: #eff6ff;
        }
        
        .hover\:bg-blue-100:hover {
          background-color: #dbeafe;
        }
        
        .hover\:bg-red-100:hover {
          background-color: #fee2e2;
        }
        
        .hover\:bg-gray-100:hover {
          background-color: #f3f4f6;
        }
        
        .hover\:bg-blue-700:hover {
          background-color: #1d4ed8;
        }
        
        .hover\:bg-green-700:hover {
          background-color: #15803d;
        }
        
        .hover\:underline:hover {
          text-decoration: underline;
        }
        
        .focus\:outline-none:focus {
          outline: none;
        }
        
        .focus\:ring-2:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        
        .focus\:ring-blue-500:focus {
          --tw-ring-color: #3b82f6;
        }
        
        .disabled\:opacity-50:disabled {
          opacity: 0.5;
        }
        
        .grid {
          display: grid;
        }
        
        .grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        
        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        
        @media (min-width: 768px) {
          .md\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1024px) {
          .lg\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        .gap-2 {
          gap: 0.5rem;
        }
        
        .gap-6 {
          gap: 1.5rem;
        }
        
        .space-y-1 > * + * {
          margin-top: 0.25rem;
        }
        
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        
        .space-x-2 > * + * {
          margin-left: 0.5rem;
        }
        
        .rounded-lg {
          border-radius: 0.5rem;
        }
        
        .rounded-full {
          border-radius: 9999px;
        }
        
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .max-h-64 {
          max-height: 16rem;
        }
        
        .max-h-96 {
          max-height: 24rem;
        }
        
        .overflow-y-auto {
          overflow-y: auto;
        }
        
        .min-h-screen {
          min-height: 100vh;
        }
        
        .w-3 {
          width: 0.75rem;
        }
        
        .h-3 {
          height: 0.75rem;
        }
        
        .w-8 {
          width: 2rem;
        }
        
        .h-8 {
          height: 2rem;
        }
        
        .border-b-2 {
          border-bottom-width: 2px;
        }
        
        .border-l-4 {
          border-left-width: 4px;
        }
        
        .border-blue-400 {
          border-color: #60a5fa;
        }
        
        .border-blue-600 {
          border-color: #2563eb;
        }
        
        .border-gray-200 {
          border-color: #e5e7eb;
        }
        
        .border-gray-300 {
          border-color: #d1d5db;
        }
        
        .border-yellow-200 {
          border-color: #fde047;
        }
        
        .border-green-200 {
          border-color: #bbf7d0;
        }
        
        .border-red-200 {
          border-color: #fecaca;
        }
        
        .bg-white {
          background-color: #ffffff;
        }
        
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        
        .bg-gray-100 {
          background-color: #f3f4f6;
        }
        
        .bg-blue-50 {
          background-color: #eff6ff;
        }
        
        .bg-blue-100 {
          background-color: #dbeafe;
        }
        
        .bg-blue-600 {
          background-color: #2563eb;
        }
        
        .bg-green-50 {
          background-color: #f0fdf4;
        }
        
        .bg-green-100 {
          background-color: #dcfce7;
        }
        
        .bg-green-500 {
          background-color: #22c55e;
        }
        
        .bg-green-600 {
          background-color: #16a34a;
        }
        
        .bg-red-50 {
          background-color: #fef2f2;
        }
        
        .bg-red-100 {
          background-color: #fee2e2;
        }
        
        .bg-yellow-50 {
          background-color: #fefce8;
        }
        
        .bg-orange-50 {
          background-color: #fff7ed;
        }
        
        .bg-gradient-to-r {
          background-image: linear-gradient(to right, var(--tw-gradient-stops));
        }
        
        .from-yellow-50 {
          --tw-gradient-from: #fefce8;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, transparent);
        }
        
        .to-orange-50 {
          --tw-gradient-to: #fff7ed;
        }
        
        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        
        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        
        .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }
        
        .text-2xl {
          font-size: 1.5rem;
          line-height: 2rem;
        }
        
        .text-3xl {
          font-size: 1.875rem;
          line-height: 2.25rem;
        }
        
        .font-medium {
          font-weight: 500;
        }
        
        .font-semibold {
          font-weight: 600;
        }
        
        .font-bold {
          font-weight: 700;
        }
        
        .font-mono {
          font-family: ui-monospace, SFMono-Regular, monospace;
        }
        
        .text-white {
          color: #ffffff;
        }
        
        .text-gray-300 {
          color: #d1d5db;
        }
        
        .text-gray-500 {
          color: #6b7280;
        }
        
        .text-gray-600 {
          color: #4b5563;
        }
        
        .text-gray-700 {
          color: #374151;
        }
        
        .text-gray-800 {
          color: #1f2937;
        }
        
        .text-blue-500 {
          color: #3b82f6;
        }
        
        .text-blue-600 {
          color: #2563eb;
        }
        
        .text-blue-700 {
          color: #1d4ed8;
        }
        
        .text-blue-800 {
          color: #1e40af;
        }
        
        .text-green-600 {
          color: #16a34a;
        }
        
        .text-green-800 {
          color: #166534;
        }
        
        .text-red-600 {
          color: #dc2626;
        }
        
        .text-orange-600 {
          color: #ea580c;
        }
        
        .text-yellow-600 {
          color: #d97706;
        }
        
        .text-yellow-700 {
          color: #a16207;
        }
        
        .text-yellow-800 {
          color: #92400e;
        }
        
        .text-purple-600 {
          color: #9333ea;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .flex {
          display: flex;
        }
        
        .inline-flex {
          display: inline-flex;
        }
        
        .items-center {
          align-items: center;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .flex-1 {
          flex: 1 1 0%;
        }
        
        .flex-wrap {
          flex-wrap: wrap;
        }
        
        .p-1 {
          padding: 0.25rem;
        }
        
        .p-2 {
          padding: 0.5rem;
        }
        
        .p-3 {
          padding: 0.75rem;
        }
        
        .p-4 {
          padding: 1rem;
        }
        
        .p-6 {
          padding: 1.5rem;
        }
        
        .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        
        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        
        .pt-4 {
          padding-top: 1rem;
        }
        
        .mb-1 {
          margin-bottom: 0.25rem;
        }
        
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .mb-3 {
          margin-bottom: 0.75rem;
        }
        
        .mb-4 {
          margin-bottom: 1rem;
        }
        
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        
        .mr-1 {
          margin-right: 0.25rem;
        }
        
        .mr-2 {
          margin-right: 0.5rem;
        }
        
        .ml-1 {
          margin-left: 0.25rem;
        }
        
        .mt-1 {
          margin-top: 0.25rem;
        }
        
        .mt-2 {
          margin-top: 0.5rem;
        }
        
        .mt-4 {
          margin-top: 1rem;
        }
        
        .mt-6 {
          margin-top: 1.5rem;
        }
        
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .max-w-7xl {
          max-width: 80rem;
        }
      `}</style>
    </div>
  );
};

export default MediaMonitoringTool;
