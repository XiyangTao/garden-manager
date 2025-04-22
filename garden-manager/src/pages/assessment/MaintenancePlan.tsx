import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Form,
  Select,
  DatePicker,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Typography,
  Modal,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  FileAddOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './MaintenancePlan.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 定义养护计划数据类型
interface MaintenancePlanType {
  key: string;
  planId: string;
  planName: string;
  planType: string;
  area: string;
  startDate: string;
  endDate: string;
  status: string;
  maintenanceUnit: string;
  responsiblePerson: string;
  frequency: string;
  priority: string;
  description: string;
  isReviewed: string; // 新增是否审核字段
  reviewer: string;   // 新增审核人字段
  month: number;      // 新增月份字段
}

// 养护计划状态枚举
const PLAN_STATUS = {
  PENDING: '未开始',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  OVERDUE: '已逾期',
  CANCELLED: '已取消'
};

// 养护计划类型枚举
const PLAN_TYPES = {
  DAILY: '日常养护',
  WEEKLY: '周期养护',
  MONTHLY: '月度养护',
  QUARTERLY: '季度养护',
  ANNUAL: '年度养护',
  SPECIAL: '专项养护'
};

// 优先级枚举
const PRIORITIES = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

// 频率枚举
const FREQUENCIES = {
  DAILY: '每日',
  WEEKLY: '每周',
  BIWEEKLY: '两周一次',
  MONTHLY: '每月',
  QUARTERLY: '每季度',
  HALFYEAR: '半年一次',
  YEARLY: '每年'
};

// 审核状态枚举
const REVIEW_STATUS = {
  REVIEWED: '已审核',
  NOT_REVIEWED: '未审核'
};

const MaintenancePlan: React.FC = () => {
  const [plans, setPlans] = useState<MaintenancePlanType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [yearForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<MaintenancePlanType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('annual');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<dayjs.Dayjs | null>(null);
  const [selectedMonthlyUnit, setSelectedMonthlyUnit] = useState<string | null>(null); // 新增月度计划养护单位选择

  // 生成模拟数据
  const generateMockData = useCallback(() => {
    const mockData: MaintenancePlanType[] = [];
    const statusValues = Object.values(PLAN_STATUS);
    const typeValues = Object.values(PLAN_TYPES);
    const priorityValues = Object.values(PRIORITIES);
    const frequencyValues = Object.values(FREQUENCIES);
    const reviewStatusValues = Object.values(REVIEW_STATUS);
    const areas = ['东区', '西区', '南区', '北区', '中心区'];
    const maintenanceUnits = ['恒通园林公司', '绿洲园林公司', '盛世园林公司', '华美园林公司', '永兴园林公司'];
    const responsiblePersons = ['张三', '李四', '王五', '赵六', '钱七'];
    const reviewers = ['刘一', '陈二', '张三', '李四', '王五'];

    for (let i = 1; i <= 30; i++) {
      const startDate = dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD');
      const endDate = dayjs(startDate).add(Math.floor(Math.random() * 90) + 30, 'day').format('YYYY-MM-DD');
      const status = statusValues[Math.floor(Math.random() * statusValues.length)];
      const planType = typeValues[Math.floor(Math.random() * typeValues.length)];
      const area = areas[Math.floor(Math.random() * areas.length)];
      const maintenanceUnit = maintenanceUnits[Math.floor(Math.random() * maintenanceUnits.length)];
      const responsiblePerson = responsiblePersons[Math.floor(Math.random() * responsiblePersons.length)];
      const priority = priorityValues[Math.floor(Math.random() * priorityValues.length)];
      const frequency = frequencyValues[Math.floor(Math.random() * frequencyValues.length)];
      const isReviewed = reviewStatusValues[Math.floor(Math.random() * reviewStatusValues.length)];
      const reviewer = isReviewed === REVIEW_STATUS.REVIEWED ? 
        reviewers[Math.floor(Math.random() * reviewers.length)] : 
        '—';
      const month = dayjs(startDate).month() + 1; // 月份，1-12

      mockData.push({
        key: i.toString(),
        planId: `YHJI-${2023}-${String(i).padStart(4, '0')}`,
        planName: `${area}${planType}计划`,
        planType,
        area,
        startDate,
        endDate,
        status,
        maintenanceUnit,
        responsiblePerson,
        frequency,
        priority,
        description: `该计划负责${area}的${planType}工作，需要定期对区域内的植物、设施进行维护和养护。`,
        isReviewed,
        reviewer,
        month
      });
    }
    return mockData;
  }, []);

  // 获取所有养护单位的唯一值
  const getUniqueMaintenanceUnits = useCallback(() => {
    const units = generateMockData().map(item => item.maintenanceUnit);
    return Array.from(new Set(units));
  }, [generateMockData]);

  // 过滤年度计划数据
  const filterAnnualData = useCallback(() => {
    let filteredData = [...generateMockData()];
    
    // 根据年度计划标签过滤
    filteredData = filteredData.filter(item => 
      item.planType === PLAN_TYPES.ANNUAL || 
      item.planType === PLAN_TYPES.QUARTERLY || 
      item.planType === PLAN_TYPES.SPECIAL
    );
    
    // 根据养护单位筛选
    if (selectedUnit) {
      filteredData = filteredData.filter(item => item.maintenanceUnit === selectedUnit);
    }
    
    // 根据计划年份筛选
    if (selectedYear) {
      filteredData = filteredData.filter(item => 
        dayjs(item.startDate).year() === selectedYear.year()
      );
    }
    
    return filteredData;
  }, [generateMockData, selectedUnit, selectedYear]);

  // 过滤月度计划数据
  const filterMonthlyData = useCallback(() => {
    let filteredData = [...generateMockData()];
    
    // 根据月度计划标签过滤
    filteredData = filteredData.filter(item => 
      item.planType === PLAN_TYPES.MONTHLY || 
      item.planType === PLAN_TYPES.WEEKLY || 
      item.planType === PLAN_TYPES.DAILY
    );
    
    // 根据养护单位筛选
    if (selectedMonthlyUnit) {
      filteredData = filteredData.filter(item => item.maintenanceUnit === selectedMonthlyUnit);
    }
    
    return filteredData;
  }, [generateMockData, selectedMonthlyUnit]);

  // 处理年度计划查询
  const handleAnnualSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setPlans(filterAnnualData());
      setLoading(false);
      message.success('查询成功');
    }, 500);
  };

  // 处理月度计划查询
  const handleMonthlySearch = () => {
    setLoading(true);
    setTimeout(() => {
      setPlans(filterMonthlyData());
      setLoading(false);
      message.success('查询成功');
    }, 500);
  };

  // 清空年度计划的筛选条件
  const handleAnnualClear = () => {
    yearForm.resetFields();
    setSelectedUnit(null);
    setSelectedYear(null);
    
    setLoading(true);
    setTimeout(() => {
      setPlans(filterAnnualData());
      setLoading(false);
      message.info('已清空搜索条件');
    }, 500);
  };

  // 清空月度计划的筛选条件
  const handleMonthlyClear = () => {
    form.resetFields();
    setSelectedMonthlyUnit(null);
    
    setLoading(true);
    setTimeout(() => {
      setPlans(filterMonthlyData());
      setLoading(false);
      message.info('已清空搜索条件');
    }, 500);
  };

  // 初始化数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      if (activeTab === 'annual') {
        setPlans(filterAnnualData());
      } else {
        setPlans(filterMonthlyData());
      }
      setLoading(false);
    }, 500);
  }, [filterAnnualData, filterMonthlyData, activeTab]);

  // 处理标签页变更
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    form.resetFields();
    yearForm.resetFields();
    setSelectedUnit(null);
    setSelectedYear(null);
    setSelectedMonthlyUnit(null);
  };

  // 添加新计划
  const handleAdd = () => {
    message.info('添加新养护计划功能将在后续版本实现');
  };

  // 导出功能
  const handleExport = () => {
    message.info('导出功能将在后续版本实现');
  };

  // 编辑计划
  const handleEdit = (record: MaintenancePlanType) => {
    message.info('编辑养护计划功能将在后续版本实现');
  };

  // 查看计划详情
  const handleView = (record: MaintenancePlanType) => {
    setCurrentPlan(record);
    setIsModalVisible(true);
  };

  // 删除计划
  const handleDelete = (id: string) => {
    setPlans(plans.filter(item => item.planId !== id));
    message.success('养护计划已删除');
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case PLAN_STATUS.PENDING:
        return 'default';
      case PLAN_STATUS.IN_PROGRESS:
        return 'processing';
      case PLAN_STATUS.COMPLETED:
        return 'success';
      case PLAN_STATUS.OVERDUE:
        return 'error';
      case PLAN_STATUS.CANCELLED:
        return 'warning';
      default:
        return 'default';
    }
  };

  // 获取优先级标签颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case PRIORITIES.HIGH:
        return 'red';
      case PRIORITIES.MEDIUM:
        return 'orange';
      case PRIORITIES.LOW:
        return 'green';
      default:
        return 'blue';
    }
  };

  // 年度计划表格列定义
  const annualColumns: ColumnsType<MaintenancePlanType> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '计划名称',
      dataIndex: 'planName',
      key: 'planName',
      width: 180,
      render: (text) => <span className="plan-name">{text}</span>
    },
    {
      title: '养护计划年份',
      key: 'planYear',
      width: 120,
      render: (_, record) => dayjs(record.startDate).year(),
      sorter: (a, b) => dayjs(a.startDate).year() - dayjs(b.startDate).year(),
    },
    {
      title: '养护单位',
      dataIndex: 'maintenanceUnit',
      key: 'maintenanceUnit',
      width: 140,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
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
              title="确定删除此养护计划吗?"
              onConfirm={() => handleDelete(record.planId)}
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

  // 月度计划表格列定义
  const monthlyColumns: ColumnsType<MaintenancePlanType> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '计划名称',
      dataIndex: 'planName',
      key: 'planName',
      width: 180,
      render: (text) => <span className="plan-name">{text}</span>
    },
    {
      title: '养护月份',
      key: 'month',
      width: 100,
      render: (_, record) => `${record.month}月`,
      sorter: (a, b) => a.month - b.month,
    },
    {
      title: '养护单位',
      dataIndex: 'maintenanceUnit',
      key: 'maintenanceUnit',
      width: 160,
    },
    {
      title: '是否审核',
      dataIndex: 'isReviewed',
      key: 'isReviewed',
      width: 100,
      render: (status) => (
        <Tag color={status === REVIEW_STATUS.REVIEWED ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '审核人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
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
              title="确定删除此养护计划吗?"
              onConfirm={() => handleDelete(record.planId)}
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

  // 年度计划搜索表单
  const renderAnnualSearch = () => (
    <Card className="search-card">
      <Form 
        form={yearForm} 
        layout="horizontal" 
        onFinish={handleAnnualSearch}
        className="search-form"
      >
        <Row gutter={[16, 16]} align="middle" className="search-row">
          <Col xs={24} sm={8} md={6} lg={6} className="search-col">
            <Form.Item label="养护单位" name="maintenanceUnit" className="search-form-item">
              <Select 
                placeholder="请选择养护单位" 
                allowClear
                onChange={(value) => setSelectedUnit(value)}
                style={{ width: '100%' }}
              >
                {getUniqueMaintenanceUnits().map((unit) => (
                  <Option key={unit} value={unit}>{unit}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={6} lg={6} className="search-col">
            <Form.Item label="计划年份" name="planYear" className="search-form-item">
              <DatePicker.YearPicker
                placeholder="请选择年份"
                onChange={(value) => setSelectedYear(value)}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={12} lg={12} className="search-col">
            <div className="button-wrapper" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button icon={<ClearOutlined />} onClick={handleAnnualClear}>清空</Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  // 月度计划搜索表单
  const renderMonthlySearch = () => (
    <Card className="search-card">
      <Form 
        form={form} 
        layout="horizontal" 
        onFinish={handleMonthlySearch}
        className="search-form"
      >
        <Row gutter={[16, 16]} align="middle" className="search-row">
          <Col xs={24} sm={12} md={8} lg={8} className="search-col">
            <Form.Item label="养护单位" name="maintenanceUnit" className="search-form-item">
              <Select 
                placeholder="请选择养护单位" 
                allowClear
                onChange={(value) => setSelectedMonthlyUnit(value)}
                style={{ width: '100%' }}
              >
                {getUniqueMaintenanceUnits().map((unit) => (
                  <Option key={unit} value={unit}>{unit}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={16} lg={16} className="search-col">
            <div className="button-wrapper" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button icon={<ClearOutlined />} onClick={handleMonthlyClear}>清空</Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  // 返回所需的标签页数据
  const getTabItems = () => [
    {
      key: 'annual',
      label: '年度计划',
      children: (
        <>
          {renderAnnualSearch()}
          
          <Card 
            title={<Title level={4}>年度养护计划列表</Title>}
            className="data-card"
            extra={
              <Space>
                <Button icon={<FileAddOutlined />} type="primary" onClick={handleAdd}>增加</Button>
                <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
              </Space>
            }
          >
            <Table
              columns={annualColumns}
              dataSource={plans}
              loading={loading}
              rowKey="planId"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`
              }}
            />
          </Card>
        </>
      ),
    },
    {
      key: 'monthly',
      label: '月度计划',
      children: (
        <>
          {renderMonthlySearch()}
          
          <Card 
            title={<Title level={4}>月度养护计划列表</Title>}
            className="data-card"
            extra={
              <Space>
                <Button icon={<FileAddOutlined />} type="primary" onClick={handleAdd}>增加</Button>
                <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
              </Space>
            }
          >
            <Table
              columns={monthlyColumns}
              dataSource={plans}
              loading={loading}
              rowKey="planId"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`
              }}
            />
          </Card>
        </>
      ),
    }
  ];

  return (
    <div className="maintenance-plan">
      <Tabs activeKey={activeTab} onChange={handleTabChange} className="plan-tabs" items={getTabItems()} />

      {currentPlan && (
        <Modal
          title="养护计划详情"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              关闭
            </Button>,
            <Button key="edit" type="primary" onClick={() => handleEdit(currentPlan)}>
              编辑
            </Button>,
          ]}
          width={720}
        >
          <div className="plan-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>计划编号: </Text>
                <Text>{currentPlan.planId}</Text>
              </Col>
              <Col span={12}>
                <Text strong>计划名称: </Text>
                <Text>{currentPlan.planName}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>计划类型: </Text>
                <Text>{currentPlan.planType}</Text>
              </Col>
              <Col span={12}>
                <Text strong>养护区域: </Text>
                <Text>{currentPlan.area}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>养护单位: </Text>
                <Text>{currentPlan.maintenanceUnit}</Text>
              </Col>
              <Col span={12}>
                <Text strong>负责人: </Text>
                <Text>{currentPlan.responsiblePerson}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>频率: </Text>
                <Text>{currentPlan.frequency}</Text>
              </Col>
              <Col span={12}>
                <Text strong>优先级: </Text>
                <Tag color={getPriorityColor(currentPlan.priority)}>{currentPlan.priority}</Tag>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>开始日期: </Text>
                <Text>{currentPlan.startDate}</Text>
              </Col>
              <Col span={12}>
                <Text strong>结束日期: </Text>
                <Text>{currentPlan.endDate}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>状态: </Text>
                <Badge status={getStatusColor(currentPlan.status) as any} text={currentPlan.status} />
              </Col>
              <Col span={12}>
                <Text strong>是否审核: </Text>
                <Tag color={currentPlan.isReviewed === REVIEW_STATUS.REVIEWED ? 'success' : 'warning'}>
                  {currentPlan.isReviewed}
                </Tag>
              </Col>
            </Row>
            {currentPlan.isReviewed === REVIEW_STATUS.REVIEWED && (
              <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <Text strong>审核人: </Text>
                  <Text>{currentPlan.reviewer}</Text>
                </Col>
              </Row>
            )}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>计划描述: </Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{currentPlan.description}</Text>
                </div>
              </Col>
            </Row>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MaintenancePlan; 