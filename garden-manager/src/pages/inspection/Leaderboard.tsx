import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Radio, Row, Col, Spin, Empty } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { BarChartOutlined, SearchOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import dayjs from 'dayjs';
import './Leaderboard.css';

const { RangePicker } = DatePicker;

// 定义数据类型
interface ReporterData {
  key: string;
  rank: number;
  name: string;
  department: string;
  reportCount: number;
  color: string; // 为每个条形添加颜色
}

// 模拟数据生成函数
const generateMockData = (): ReporterData[] => {
  const departments = ['东湖公园管理所', '西山花园管理所', '南门广场管理所', '北区植物园管理所', '中央绿地管理所'];
  const names = [
    '李明', '王红', '张强', '刘静', '赵月', '陈刚', '杨华', '周晓', '吴建', '郑小龙',
    '黄海', '孙亮', '马超', '林浩', '谢雨', '高峰', '董兰', '曾伟', '唐丽', '许光'
  ];
  
  // 生成30个报告员的数据
  return Array.from({ length: 30 }, (_, i) => {
    const reportCount = Math.floor(Math.random() * 100) + 1; // 1-100的随机数
    
    // 生成一个基于name string的颜色 (简单哈希算法)
    const hash = names[i % names.length].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 50%)`;
    
    return {
      key: i.toString(),
      rank: 0, // 将在排序后计算
      name: names[i % names.length],
      department: departments[i % departments.length],
      reportCount: reportCount,
      color: color,
    };
  });
};

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<ReporterData[]>([]);
  const [displayData, setDisplayData] = useState<ReporterData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rankType, setRankType] = useState<string>('top10');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'), 
    dayjs()
  ]);

  // 初始加载数据
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockData();
      // 根据报告数量排序
      const sortedData = [...mockData].sort((a, b) => b.reportCount - a.reportCount);
      
      // 添加排名
      sortedData.forEach((item, index) => {
        item.rank = index + 1;
      });
      
      setData(sortedData);
      updateDisplayData(sortedData, rankType);
      setLoading(false);
    }, 1000);
  }, []);

  // 更新显示的数据
  const updateDisplayData = (fullData: ReporterData[], type: string) => {
    if (type === 'top10') {
      setDisplayData(fullData.slice(0, 10));
    } else if (type === 'bottom10') {
      // 反转后的后10名，使最少的在顶部
      setDisplayData([...fullData.slice(-10)].reverse());
    } else {
      setDisplayData(fullData);
    }
  };

  // 处理排名类型变化
  const handleRankTypeChange = (e: RadioChangeEvent) => {
    const newRankType = e.target.value;
    setRankType(newRankType);
    updateDisplayData(data, newRankType);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  // 处理查询按钮点击
  const handleSearch = () => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      // 在实际应用中，这里会基于日期范围从后端获取数据
      const mockData = generateMockData();
      const sortedData = [...mockData].sort((a, b) => b.reportCount - a.reportCount);
      
      sortedData.forEach((item, index) => {
        item.rank = index + 1;
      });
      
      setData(sortedData);
      updateDisplayData(sortedData, rankType);
      setLoading(false);
    }, 1000);
  };

  // 获取标题
  const getTitle = () => {
    return rankType === 'top10' ? '上报数量前十名' : '上报数量后十名';
  };

  // 渲染图表
  const renderChart = () => {
    if (loading) {
      return <div className="chart-loading"><Spin spinning={true} tip="加载中..." /></div>;
    }
    
    if (displayData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    // 定义固定颜色
    const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
    
    // 处理数据以在Y轴上显示名称和排名
    const chartData = displayData.map(item => ({
      ...item,
      // 将显示在Y轴上的名称格式化为"排名 姓名"的形式
      displayName: `${item.rank}. ${item.name}`
    }));
    
    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 80, // 为排名+名字留出空间
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, 'dataMax + 5']} 
          />
          <YAxis 
            dataKey="displayName" 
            type="category" 
            width={120} 
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} 个`, '上报数量']} 
            labelFormatter={(label) => `人员: ${label.split('. ')[1]}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            content={() => (
              <div className="custom-legend">
                <div className="legend-item">
                  <span className="legend-text">{getTitle()}</span>
                </div>
              </div>
            )}
          />
          <Bar 
            dataKey="reportCount" 
            name="上报数量" 
            barSize={30}
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              formatter: (props: any) => {
                if (typeof props === 'number') return props;
                if (props && typeof props.value === 'number') return props.value;
                return '';
              }
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="leaderboard">
      <Card title="上报问题排行榜" className="filter-card">
        <Row gutter={16} className="filter-row">
          <Col span={12}>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={['统计开始日期', '统计结束日期']}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ width: '100%' }}
            >
              查询
            </Button>
          </Col>
        </Row>
        
        <Row className="rank-selector">
          <Radio.Group value={rankType} onChange={handleRankTypeChange} buttonStyle="solid">
            <Radio.Button value="top10">前十名 <BarChartOutlined /></Radio.Button>
            <Radio.Button value="bottom10">后十名 <BarChartOutlined /></Radio.Button>
          </Radio.Group>
        </Row>
      </Card>

      <Card className="chart-card">
        <div className="chart-container">
          {renderChart()}
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard; 