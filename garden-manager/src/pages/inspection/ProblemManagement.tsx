import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Radio, Button, Space, Tag, Input, Select, Row, Col } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './ProblemManagement.css';

const { Option } = Select;

interface DataType {
  key: string;
  id: number;
  problemType: string;
  source: string;
  urgency: string;
  taskName: string;
  location: string;
  reporter: string;
  reportTime: string;
  status: string;
}

// Mock data generator
const generateMockData = (count: number): DataType[] => {
  const statusOptions = ['未处理', '处理中', '已完结'];
  const typeOptions = ['设施损坏', '植物疾病', '环境卫生', '安全隐患', '其他问题'];
  const sourceOptions = ['巡查上报', '市民投诉', '系统监测', '上级交办'];
  const urgencyOptions = ['一般', '紧急', '特急'];
  const locations = ['东湖公园', '西山花园', '南门广场', '北区植物园', '中央绿地'];
  const reporters = ['李明', '王红', '张强', '刘静', '赵月'];

  return Array.from({ length: count }, (_, i) => {
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      key: i.toString(),
      id: i + 1,
      problemType: typeOptions[Math.floor(Math.random() * typeOptions.length)],
      source: sourceOptions[Math.floor(Math.random() * sourceOptions.length)],
      urgency: urgencyOptions[Math.floor(Math.random() * urgencyOptions.length)],
      taskName: `问题处置任务 #${i + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      reportTime: date.toISOString().split('T')[0],
      status: status,
    };
  });
};

const ProblemManagement: React.FC = () => {
  const [status, setStatus] = useState<string>('all');
  const [data, setData] = useState<DataType[]>([]);
  const [filteredData, setFilteredData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedProblemType, setSelectedProblemType] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // 使用useCallback包装filterData，避免useEffect依赖问题
  const filterData = useCallback(() => {
    let filtered = [...data];
    
    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        item => 
          item.taskName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.location.toLowerCase().includes(searchText.toLowerCase()) ||
          item.reporter.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filter by problem type
    if (selectedProblemType) {
      filtered = filtered.filter(item => item.problemType === selectedProblemType);
    }
    
    // Filter by source
    if (selectedSource) {
      filtered = filtered.filter(item => item.source === selectedSource);
    }
    
    setFilteredData(filtered);
  }, [status, data, searchText, selectedProblemType, selectedSource]);

  useEffect(() => {
    // Simulating API call to fetch data
    setTimeout(() => {
      const mockData = generateMockData(50);
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const handleStatusChange = (e: RadioChangeEvent) => {
    setStatus(e.target.value);
  };

  const handleReset = () => {
    setStatus('all');
    setSearchText('');
    setSelectedProblemType(null);
    setSelectedSource(null);
    setFilteredData(data);
  };
  
  const getStatusTag = (status: string) => {
    switch (status) {
      case '未处理':
        return <Tag color="red">{status}</Tag>;
      case '处理中':
        return <Tag color="orange">{status}</Tag>;
      case '已完结':
        return <Tag color="green">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getUrgencyTag = (urgency: string) => {
    switch (urgency) {
      case '特急':
        return <Tag color="red">{urgency}</Tag>;
      case '紧急':
        return <Tag color="orange">{urgency}</Tag>;
      case '一般':
        return <Tag color="blue">{urgency}</Tag>;
      default:
        return <Tag>{urgency}</Tag>;
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '问题类别',
      dataIndex: 'problemType',
      key: 'problemType',
      width: 120,
      filters: [
        { text: '设施损坏', value: '设施损坏' },
        { text: '植物疾病', value: '植物疾病' },
        { text: '环境卫生', value: '环境卫生' },
        { text: '安全隐患', value: '安全隐患' },
        { text: '其他问题', value: '其他问题' },
      ],
      onFilter: (value, record) => record.problemType === value,
    },
    {
      title: '问题来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (text) => getUrgencyTag(text),
    },
    {
      title: '事项名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 200,
    },
    {
      title: '巡查地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100,
    },
    {
      title: '上报时间',
      dataIndex: 'reportTime',
      key: 'reportTime',
      width: 120,
      sorter: (a, b) => a.reportTime.localeCompare(b.reportTime),
    },
    {
      title: '办理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => getStatusTag(text),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">查看</Button>
          {record.status !== '已完结' && (
            <Button type="link" size="small">处理</Button>
          )}
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="problem-management">
      <Card title="问题处置管理" className="filter-card">
        <div className="card-toolbar">
          <Radio.Group value={status} onChange={handleStatusChange} buttonStyle="solid">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="未处理">未处理</Radio.Button>
            <Radio.Button value="处理中">处理中</Radio.Button>
            <Radio.Button value="已完结">已完结</Radio.Button>
          </Radio.Group>
        </div>

        <div className="advanced-search">
          <Row gutter={16}>
            <Col span={12}>
              <Input
                placeholder="搜索事项名称、地点或上报人"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="问题类别"
                style={{ width: '100%' }}
                allowClear
                value={selectedProblemType}
                onChange={(value) => setSelectedProblemType(value)}
              >
                <Option value="设施损坏">设施损坏</Option>
                <Option value="植物疾病">植物疾病</Option>
                <Option value="环境卫生">环境卫生</Option>
                <Option value="安全隐患">安全隐患</Option>
                <Option value="其他问题">其他问题</Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select
                placeholder="问题来源"
                style={{ width: '100%' }}
                allowClear
                value={selectedSource}
                onChange={(value) => setSelectedSource(value)}
              >
                <Option value="巡查上报">巡查上报</Option>
                <Option value="市民投诉">市民投诉</Option>
                <Option value="系统监测">系统监测</Option>
                <Option value="上级交办">上级交办</Option>
              </Select>
            </Col>
            <Col span={2}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
                style={{ width: '100%' }}
              >
                重置
              </Button>
            </Col>
          </Row>
        </div>
      </Card>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>
    </div>
  );
};

export default ProblemManagement; 