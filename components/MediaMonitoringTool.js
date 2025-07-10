import React, { useState } from 'react';
import { Search, Plus, Trash2, Download, FileText, Settings } from 'lucide-react';

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

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const searchKeyword = async (keyword) => {
    setIsSearching(true);
    setSelectedKeyword(keyword);
    
    // 模拟搜索延迟
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: `${keyword}最新研发进展获得突破`,
          source: "生物医药网",
          publishTime: new Date().toLocaleString('zh-CN'),
          sentiment: "正面",
          content: `${keyword}在临床试验中取得积极结果，显示出良好的安全性和有效性...`,
          url: "https://example.com/news1"
        },
        {
          id: 2,
          title: `${keyword}获得监管部门积极反馈`,
          source: "医药经济报",
          publishTime: new Date(Date.now() - 3600000).toLocaleString('zh-CN'),
          sentiment: "正面",
          content: `监管部门对${keyword}的申请材料给出积极评价...`,
          url: "https://example.com/news2"
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  const generateReport = () => {
    const mockReport = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('zh-CN'),
      data: keywords.reduce((acc, keyword) => {
        acc[keyword] = {
          keyword,
          reportCount: Math.floor(Math.random() * 20) + 5,
          sentiment: {
            positive: Math.floor(Math.random() * 15) + 5,
            negative: Math.floor(Math.random() * 3) + 1,
            neutral: Math.floor(Math.random() * 8) + 2
          },
          hotTopics: ['临床试验', '监管审批', '市场前景'],
          summary: `${keyword}相关报道整体积极，主要关注临床进展`
        };
        return acc;
      }, {})
    };
    
    setReports([mockReport, ...reports]);
  };

  const downloadReport = (report) => {
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `舆情报告_${report.timestamp.replace(/[:/\s]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 标题 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
          生物医药舆情监测工具
        </h1>
        <p style={{ color: '#666' }}>专业监测天境生物及相关产品的媒体报道，智能分析行业动态</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* 关键词管理 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Settings style={{ marginRight: '8px', color: '#3b82f6' }} size={20} />
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>关键词管理</h2>
          </div>
          
          <div style={{ display: 'flex', marginBottom: '16px' }}>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="添加生物医药关键词"
              style={{ 
                flex: 1, 
                padding: '8px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '4px 0 0 4px',
                outline: 'none'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <button
              onClick={addKeyword}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {keywords.map((keyword) => (
              <div 
                key={keyword} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontWeight: '500' }}>{keyword}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => searchKeyword(keyword)}
                    disabled={isSearching}
                    style={{ 
                      padding: '4px', 
                      backgroundColor: '#dbeafe', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#3b82f6'
                    }}
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    style={{ 
                      padding: '4px', 
                      backgroundColor: '#fee2e2', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#dc2626'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 搜索结果 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>搜索结果</h2>
            {selectedKeyword && (
              <span style={{ 
                padding: '4px 12px', 
                backgroundColor: '#dbeafe', 
                color: '#1e40af', 
                borderRadius: '20px', 
                fontSize: '14px' 
              }}>
                {selectedKeyword}
              </span>
            )}
          </div>

          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#666' }}>正在搜索最新报道...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {searchResults.map((result) => (
                <div 
                  key={result.id} 
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    padding: '16px', 
                    marginBottom: '12px'
                  }}
                >
                  <h3 style={{ fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    {result.title}
                  </h3>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    <span style={{ marginRight: '16px' }}>{result.source}</span>
                    <span style={{ marginRight: '16px' }}>{result.publishTime}</span>
                    <span style={{ 
                      padding: '2px 8px', 
                      backgroundColor: '#dcfce7', 
                      color: '#166534', 
                      borderRadius: '4px' 
                    }}>
                      {result.sentiment}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    {result.content}
                  </p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', fontSize: '14px', textDecoration: 'none' }}
                  >
                    查看原文 →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>请选择关键词开始搜索</p>
            </div>
          )}
        </div>

        {/* 报告生成 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>监测报告</h2>
            <button
              onClick={generateReport}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px', 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FileText size={16} style={{ marginRight: '8px' }} />
              生成报告
            </button>
          </div>

          {reports.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontWeight: '500', color: '#374151' }}>
                      监测报告 - {report.timestamp}
                    </h3>
                    <button
                      onClick={() => downloadReport(report)}
                      style={{ 
                        padding: '8px', 
                        backgroundColor: '#dbeafe', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#3b82f6'
                      }}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  
                  <div>
                    {Object.entries(report.data).slice(0, 3).map(([keyword, data]) => (
                      <div 
                        key={keyword} 
                        style={{ 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '4px', 
                          padding: '12px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>{keyword}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {data.reportCount} 篇报道
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                          <span style={{ color: '#059669' }}>正面 {data.sentiment.positive}</span>
                          <span style={{ color: '#dc2626' }}>负面 {data.sentiment.negative}</span>
                          <span style={{ color: '#6b7280' }}>中性 {data.sentiment.neutral}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>还没有生成报告</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>点击上方按钮生成第一份报告</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MediaMonitoringTool;
