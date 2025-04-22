import React, { useState, useEffect } from 'react';
import { Card, Radio, Spin, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { RadioChangeEvent } from 'antd';
import './DeductionStatistics.css';

type TimeRange = 'month' | 'year' | 'all';

interface StatisticsData {
  company: string;
  deduction: number;
  color: string;
}

const DeductionStatistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatisticsData[]>([]);

  // 处理时间范围选择
  const handleTimeRangeChange = (e: RadioChangeEvent) => {
    setTimeRange(e.target.value);
    fetchData(e.target.value);
  };

  // 模拟获取数据
  const fetchData = (selectedTimeRange: TimeRange) => {
    setLoading(true);
    
    // 模拟数据加载延迟
    setTimeout(() => {
      // 根据不同的时间范围生成不同的数据
      const companies = ['东区养护有限公司', '西区园林服务公司', '南区绿化管理公司', '北区景观维护公司', '中央公园管理公司'];
      let generatedData: StatisticsData[] = [];
      
      // 根据选择的时间范围生成不同的数据规模
      const multiplier = selectedTimeRange === 'month' ? 1 : selectedTimeRange === 'year' ? 3 : 5;
      
      // 为每个公司生成固定的0.2扣分数据，只是数量不同
      generatedData = companies.map(company => {
        // 生成一个基于company string的颜色 (简单哈希算法)
        const hash = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        const color = `hsl(${hue}, 70%, 50%)`;
        
        // 根据时间范围，生成不同数量的0.2扣分
        const times = Math.floor(Math.random() * 10 * multiplier) + 1;
        
        return {
          company,
          deduction: parseFloat((0.2 * times).toFixed(1)),
          color
        };
      });
      
      // 按扣分数降序排序
      generatedData.sort((a, b) => b.deduction - a.deduction);
      
      setData(generatedData);
      setLoading(false);
    }, 1000);
  };

  // 首次加载数据
  useEffect(() => {
    fetchData('month');
  }, []);

  // 获取标题
  const getTitle = () => {
    const timeText = timeRange === 'month' ? '本月' : timeRange === 'year' ? '今年' : '全部';
    return `${timeText}外包公司扣分统计`;
  };

  // 渲染图表
  const renderChart = () => {
    if (loading) {
      return <div className="chart-loading"><Spin spinning={true} tip="加载中..." /></div>;
    }
    
    if (data.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    // 定义固定颜色
    const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 150, // 加宽左边的空间以显示长公司名称
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, 'dataMax + 0.5']} 
            tickFormatter={(value) => value.toFixed(1)}
          />
          <YAxis 
            dataKey="company" 
            type="category" 
            width={140} 
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)} 分`, '外包公司扣分情况']} 
            labelFormatter={(label) => `公司: ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            content={(props) => {
              const { payload } = props;
              return (
                <div className="custom-legend">
                  {payload && payload.length > 0 && (
                    <div className="legend-item">
                      <span className="legend-text">外包公司扣分情况</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Bar 
            dataKey="deduction" 
            name="外包公司扣分情况" 
            barSize={30}
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              formatter: (props: any) => {
                if (typeof props === 'number') return props.toFixed(1);
                if (props && typeof props.value === 'number') return props.value.toFixed(1);
                return '';
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="deduction-statistics">
      <Card title={getTitle()} className="statistics-card">
        <div className="filter-container">
          <Radio.Group 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            buttonStyle="solid"
          >
            <Radio.Button value="month">本月</Radio.Button>
            <Radio.Button value="year">今年</Radio.Button>
            <Radio.Button value="all">全部</Radio.Button>
          </Radio.Group>
        </div>
        
        <div className="chart-container">
          {renderChart()}
        </div>
      </Card>
    </div>
  );
};

export default DeductionStatistics; 