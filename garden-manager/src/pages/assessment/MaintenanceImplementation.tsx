import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Row, 
  Col, 
  Form,
  Select,
  DatePicker,
  Tooltip,
  Popconfirm,
  message,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  FileExcelOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './MaintenanceImplementation.css';

const { Option } = Select;

// 定义数据类型
interface MaintenanceData {
  key: string;
  id: number;
  planName: string;
  unit: string;
  date: string;
  responsible: string;
  watering: boolean;
  fertilizing: boolean;
  pruning: boolean;
  mowing: boolean;
  planting: boolean;
  plantProtection: boolean;
  treeShaping: boolean;
  weedRemoval: boolean;
  cleaning: boolean;
  status: string;
}

// 模拟数据生成函数
const generateMockData = (count: number): MaintenanceData[] => {
  const plans = ['春季绿化养护计划', '夏季绿化养护计划', '秋季绿化养护计划', '冬季绿化养护计划', '特殊区域养护计划'];
  const units = ['东区养护所', '西区养护所', '南区养护所', '北区养护所', '中央养护所'];
  const responsibles = ['李主管', '王主管', '张主管', '赵主管', '钱主管'];
  const statuses = ['已审核', '未审核'];

  return Array.from({ length: count }, (_, i) => {
    // 生成过去60天内的随机日期
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const formattedDate = date.toISOString().split('T')[0];
    
    return {
      key: i.toString(),
      id: i + 1,
      planName: `${plans[Math.floor(Math.random() * plans.length)]}-${i + 1}`,
      unit: units[Math.floor(Math.random() * units.length)],
      date: formattedDate,
      responsible: responsibles[Math.floor(Math.random() * responsibles.length)],
      watering: Math.random() > 0.5,
      fertilizing: Math.random() > 0.5,
      pruning: Math.random() > 0.5,
      mowing: Math.random() > 0.5,
      planting: Math.random() > 0.5,
      plantProtection: Math.random() > 0.5,
      treeShaping: Math.random() > 0.5,
      weedRemoval: Math.random() > 0.5,
      cleaning: Math.random() > 0.5,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

const MaintenanceImplementation: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<MaintenanceData[]>([]);
  const [filteredData, setFilteredData] = useState<MaintenanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 初始加载数据
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockData(30);
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // 处理查询
  const handleSearch = useCallback(() => {
    const formValues = form.getFieldsValue();
    const { unit, status } = formValues;
    
    let filtered = [...data];
    
    if (unit) {
      filtered = filtered.filter(item => item.unit === unit);
    }
    
    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }
    
    setFilteredData(filtered);
  }, [form, data]);

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setFilteredData(data);
  };

  // 处理新增
  const handleAdd = () => {
    message.info('点击了新增按钮');
    // 实际应用中这里会打开新增表单
  };

  // 处理导出
  const handleExport = () => {
    message.info('点击了导出按钮');
    // 实际应用中这里会处理导出数据的逻辑
  };

  // 处理编辑
  const handleEdit = (record: MaintenanceData) => {
    message.info(`编辑养护记录：${record.planName}`);
    // 实际应用中这里会打开编辑表单
  };

  // 处理删除
  const handleDelete = (key: string) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
    setFilteredData(filteredData.filter(item => item.key !== key));
    message.success('删除成功');
  };

  // 处理查看详情
  const handleView = (record: MaintenanceData) => {
    message.info(`查看养护详情：${record.planName}`);
    // 实际应用中这里会打开详情页面
  };

  // 处理审核
  const handleReview = (record: MaintenanceData) => {
    message.info(`审核养护记录：${record.planName}`);
    // 实际应用中这里会打开审核表单
  };

  // 获取唯一的养护单位选项
  const getUniqueUnits = () => {
    const uniqueUnits = Array.from(new Set(data.map(item => item.unit)));
    return uniqueUnits.map(unit => ({ text: unit, value: unit }));
  };

  // 渲染检查项
  const renderCheckItem = (checked: boolean) => {
    return checked ? 
      <Tag color="success"><CheckCircleOutlined /> 已完成</Tag> : 
      <Tag color="default">未完成</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<MaintenanceData> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: '养护计划',
      dataIndex: 'planName',
      key: 'planName',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '养护单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
    },
    {
      title: '养护日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: '责任人',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 100,
    },
    {
      title: '淋水',
      dataIndex: 'watering',
      key: 'watering',
      width: 80,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '施肥',
      dataIndex: 'fertilizing',
      key: 'fertilizing',
      width: 80,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '修剪',
      dataIndex: 'pruning',
      key: 'pruning',
      width: 80,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '打草',
      dataIndex: 'mowing',
      key: 'mowing',
      width: 80,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '新种补种',
      dataIndex: 'planting',
      key: 'planting',
      width: 100,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '植保',
      dataIndex: 'plantProtection',
      key: 'plantProtection',
      width: 80,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '树木整形',
      dataIndex: 'treeShaping',
      key: 'treeShaping',
      width: 100,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '除杂草',
      dataIndex: 'weedRemoval',
      key: 'weedRemoval',
      width: 100,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '保洁',
      dataIndex: 'cleaning',
      key: 'cleaning',
      width: 80,
      align: 'center',
      render: renderCheckItem,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        let color = status === '已审核' ? 'success' : 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small" split={<Divider type="vertical" style={{ margin: '0 2px' }} />}>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            style={{ padding: '0 2px' }}
          />
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ padding: '0 2px' }}
          />
          {record.status === '未审核' && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleReview(record)}
              style={{ padding: '0 2px' }}
            />
          )}
          <Popconfirm
            title="确定要删除此记录吗？"
            onConfirm={() => handleDelete(record.key)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              style={{ padding: '0 2px' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="maintenance-implementation">
      <Card title="养护实施管理" className="filter-card">
        <Form 
          form={form} 
          layout="horizontal" 
          className="filter-form"
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="unit" label="养护单位">
                <Select placeholder="请选择养护单位" allowClear>
                  {getUniqueUnits().map(option => (
                    <Option key={option.value as string} value={option.value as string}>
                      {option.text as string}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="是否审核">
                <Select placeholder="请选择审核状态" allowClear>
                  <Option value="已审核">已审核</Option>
                  <Option value="未审核">未审核</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item className="action-buttons">
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                  >
                    查询
                  </Button>
                  <Button 
                    icon={<ClearOutlined />} 
                    onClick={handleReset}
                  >
                    清空
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAdd}
                >
                  新增
                </Button>
                <Button 
                  icon={<FileExcelOutlined />} 
                  onClick={handleExport}
                >
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          loading={loading}
          scroll={{ x: 1800 }}
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

export default MaintenanceImplementation; 