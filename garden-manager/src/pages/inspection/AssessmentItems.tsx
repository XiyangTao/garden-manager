import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Row, 
  Col,
  Form,
  Select,
  Tooltip,
  Popconfirm,
  message,
  Typography
} from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  PlusOutlined, 
  ExportOutlined,
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './AssessmentItems.css';

const { Title } = Typography;
const { Option } = Select;

// 定义考核项目数据类型
interface AssessmentItemData {
  key: string;
  id: number;
  level: string;  // 考核级别
  category: string;  // 考核分类
  name: string;  // 项目名称
}

// 考核级别枚举
const ASSESSMENT_LEVELS = {
  LEVEL_1: '一级',
  LEVEL_2: '二级',
  LEVEL_3: '三级',
  LEVEL_4: '四级'
};

// 考核分类枚举
const ASSESSMENT_CATEGORIES = {
  DAILY: '日常养护',
  SPECIAL: '专项养护',
  EMERGENCY: '应急处置',
  SEASONAL: '季节性工作',
  FACILITY: '设施维护'
};

// 生成模拟数据
const generateMockData = (): AssessmentItemData[] => {
  const mockData: AssessmentItemData[] = [];
  const levels = Object.values(ASSESSMENT_LEVELS);
  const categories = Object.values(ASSESSMENT_CATEGORIES);
  
  const itemNames = [
    "乔木修剪质量",
    "绿地杂草控制",
    "花卉植物维护",
    "病虫害防治",
    "灌溉系统维护",
    "垃圾清理及时性",
    "草坪修剪整齐度",
    "设施设备保养",
    "绿化带边缘整齐度",
    "园路保洁质量",
    "季节性花卉更换",
    "绿地覆盖率",
    "苗木成活率",
    "水体环境维护",
    "防汛排涝措施",
    "园林小品维护",
    "景观照明设备",
    "树木支撑设施",
    "绿地灌溉效果",
    "林下空间管理",
    "植物标识系统",
    "防寒防冻措施",
    "行道树管理",
    "游园设施安全",
    "公共休憩设施"
  ];
  
  // 生成模拟考核项目数据
  for (let i = 0; i < itemNames.length; i++) {
    const levelIndex = Math.floor(Math.random() * levels.length);
    const categoryIndex = Math.floor(Math.random() * categories.length);
    
    mockData.push({
      key: (i + 1).toString(),
      id: i + 1,
      level: levels[levelIndex],
      category: categories[categoryIndex],
      name: itemNames[i]
    });
  }
  
  return mockData;
};

const AssessmentItems: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<AssessmentItemData[]>([]);
  const [filteredData, setFilteredData] = useState<AssessmentItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 初始加载数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const mockData = generateMockData();
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 800);
  }, []);

  // 处理查询
  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    const { name, level, category } = values;
    
    let filtered = [...data];
    
    if (name) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (level) {
      filtered = filtered.filter(item => item.level === level);
    }
    
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    
    setFilteredData(filtered);
    
    if (filtered.length > 0) {
      message.success('查询成功');
    } else {
      message.info('未找到匹配的考核项目');
    }
  }, [form, data]);

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setFilteredData(data);
    message.info('已重置查询条件');
  };

  // 处理添加
  const handleAdd = () => {
    message.info('添加新考核项目功能将在后续版本实现');
  };

  // 处理导出
  const handleExport = () => {
    message.info('导出功能将在后续版本实现');
  };

  // 处理编辑
  const handleEdit = (record: AssessmentItemData) => {
    message.info(`编辑考核项目：${record.name}`);
    // 实际应用中这里会打开编辑表单模态框
  };

  // 处理删除
  const handleDelete = (key: string) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
    setFilteredData(filteredData.filter(item => item.key !== key));
    message.success('删除成功');
  };

  // 处理查看详情
  const handleView = (record: AssessmentItemData) => {
    message.info(`查看考核项目详情：${record.name}`);
    // 实际应用中这里可能会打开一个模态框显示更多信息
  };

  // 获取考核级别选项
  const getLevelOptions = () => {
    return Object.values(ASSESSMENT_LEVELS).map(level => 
      <Option key={level} value={level}>{level}</Option>
    );
  };

  // 获取考核分类选项
  const getCategoryOptions = () => {
    return Object.values(ASSESSMENT_CATEGORIES).map(category => 
      <Option key={category} value={category}>{category}</Option>
    );
  };

  // 表格列定义
  const columns: ColumnsType<AssessmentItemData> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
    },
    {
      title: '考核级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
    },
    {
      title: '考核分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定删除此考核项目吗?"
              onConfirm={() => handleDelete(record.key)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="assessment-items">
      <Card className="search-card">
        <Form 
          form={form} 
          layout="horizontal" 
          onFinish={handleSearch}
          className="search-form"
        >
          <Row gutter={[16, 16]} align="middle" className="search-row">
            <Col xs={24} sm={8} md={7} lg={6} className="search-col">
              <Form.Item 
                label="名称" 
                name="name" 
                className="search-form-item"
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={7} lg={6} className="search-col">
              <Form.Item 
                label="考核级别" 
                name="level" 
                className="search-form-item"
              >
                <Select placeholder="请选择考核级别" allowClear>
                  {getLevelOptions()}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={7} lg={6} className="search-col">
              <Form.Item 
                label="考核分类" 
                name="category" 
                className="search-form-item"
              >
                <Select placeholder="请选择考核分类" allowClear>
                  {getCategoryOptions()}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={3} lg={6} className="search-col">
              <div className="button-wrapper" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Button icon={<ClearOutlined />} onClick={handleReset}>清空</Button>
                  <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
      
      <Card 
        title={<Title level={4}>考核项目列表</Title>}
        className="data-card"
        extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>增加</Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="key"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>
    </div>
  );
};

export default AssessmentItems; 