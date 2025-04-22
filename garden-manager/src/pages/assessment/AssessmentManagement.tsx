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
  FileExcelOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './AssessmentManagement.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 定义数据类型
interface AssessmentData {
  key: string;
  id: number;
  date: string;
  roadSection: string;
  deduction: number;
  maintenanceUnit: string;
  status: string;
}

// 模拟数据生成函数
const generateMockData = (count: number): AssessmentData[] => {
  const roadSections = ['东湖路段', '西山路段', '南门路段', '北区路段', '中央大道'];
  const units = ['东区养护所', '西区养护所', '南区养护所', '北区养护所', '中央养护所'];
  const statuses = ['已处理', '未处理'];

  return Array.from({ length: count }, (_, i) => {
    // 生成过去60天内的随机日期
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const formattedDate = date.toISOString().split('T')[0];
    
    return {
      key: i.toString(),
      id: i + 1,
      date: formattedDate,
      roadSection: roadSections[Math.floor(Math.random() * roadSections.length)],
      deduction: 0.2, // 固定的扣分值0.2
      maintenanceUnit: units[Math.floor(Math.random() * units.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

const AssessmentManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<AssessmentData[]>([]);
  const [filteredData, setFilteredData] = useState<AssessmentData[]>([]);
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
    const { roadSection, maintenanceUnit, dateRange } = formValues;
    
    let filtered = [...data];
    
    if (roadSection) {
      filtered = filtered.filter(item => 
        item.roadSection.toLowerCase().includes(roadSection.toLowerCase())
      );
    }
    
    if (maintenanceUnit) {
      filtered = filtered.filter(item => item.maintenanceUnit === maintenanceUnit);
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      filtered = filtered.filter(item => 
        item.date >= startDate && item.date <= endDate
      );
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
    // 实际应用中这里会打开新增考核表单
  };

  // 处理导出
  const handleExport = () => {
    message.info('点击了导出按钮');
    // 实际应用中这里会处理导出数据的逻辑
  };

  // 处理编辑
  const handleEdit = (record: AssessmentData) => {
    message.info(`编辑考核记录：${record.roadSection}`);
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
  const handleView = (record: AssessmentData) => {
    message.info(`查看考核详情：${record.roadSection}`);
    // 实际应用中这里会打开详情页面
  };

  // 获取唯一的养护单位选项
  const getUniqueUnits = () => {
    const uniqueUnits = Array.from(new Set(data.map(item => item.maintenanceUnit)));
    return uniqueUnits.map(unit => ({ text: unit, value: unit }));
  };

  // 表格列定义
  const columns: ColumnsType<AssessmentData> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '考核日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: '路段',
      dataIndex: 'roadSection',
      key: 'roadSection',
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
      title: '扣分',
      dataIndex: 'deduction',
      key: 'deduction',
      width: 100,
      align: 'center',
      render: (deduction) => {
        return <span>{deduction.toFixed(1)}</span>;
      },
      sorter: (a, b) => a.deduction - b.deduction,
    },
    {
      title: '养护单位',
      dataIndex: 'maintenanceUnit',
      key: 'maintenanceUnit',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small" split={<Divider type="vertical" />}>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          />
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
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
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="assessment-management">
      <Card title="养护考核管理" className="filter-card">
        <Form 
          form={form} 
          layout="horizontal" 
          className="filter-form"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dateRange" label="考核日期">
                <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="roadSection" label="路段">
                <Input placeholder="请输入路段" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maintenanceUnit" label="养护单位">
                <Select placeholder="请选择养护单位" allowClear>
                  {getUniqueUnits().map(option => (
                    <Option key={option.value as string} value={option.value as string}>
                      {option.text as string}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
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
          scroll={{ x: 1100 }}
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

export default AssessmentManagement; 