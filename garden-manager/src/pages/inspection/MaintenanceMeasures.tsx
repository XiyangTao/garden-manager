import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Row, 
  Col,
  Form,
  Select,
  Tooltip,
  Popconfirm,
  message,
  Typography,
  Modal
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
import './MaintenanceMeasures.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 定义养护措施数据类型
interface MaintenanceMeasureData {
  key: string;
  id: number;
  month: number;
  content: string;
}

// 生成模拟数据
const generateMockData = (): MaintenanceMeasureData[] => {
  const mockData: MaintenanceMeasureData[] = [];
  
  const seasonalContents = {
    spring: [
      "加强草坪修剪，保持3-5厘米高度，并补种修复受损区域。",
      "为乔木灌木施加有机肥料，为新的生长季做准备。",
      "修剪花灌木，清除枯死枝和病虫枝，促进新芽萌发。",
      "喷洒防治病虫害的药剂，预防春季常见病虫害。",
      "检查并修复灌溉系统，为春季浇水做准备。"
    ],
    summer: [
      "增加浇水频次，尤其是新栽植的树木和草坪，防止高温干旱造成损伤。",
      "定期修剪草坪，保持适宜高度，并清除杂草。",
      "检查树木支撑系统，必要时进行调整或加固。",
      "加强病虫害监测和防治，尤其是针对夏季多发病虫害。",
      "为树池和花坛覆盖有机物，保持土壤湿润和降低杂草生长。"
    ],
    autumn: [
      "清理落叶，制作堆肥或用作花坛覆盖物。",
      "减少浇水频率，为植物准备进入休眠期。",
      "对灌木进行修剪塑形，清除过密枝条。",
      "施加缓释肥料，帮助植物积累养分过冬。",
      "收集并储存种子，为下一季播种做准备。"
    ],
    winter: [
      "对易受冻害的植物实施防寒措施，如包裹树干或覆盖地面。",
      "减少浇水频率，避免土壤过湿导致植物根系受冻。",
      "修剪落叶乔木，清除病虫枝和交叉枝。",
      "检查和清理排水系统，防止积水。",
      "规划下一年度的植物布局和养护工作。"
    ]
  };
  
  // 为每个月生成养护措施
  for (let month = 1; month <= 12; month++) {
    let seasonContent;
    
    // 根据月份确定季节内容
    if (month >= 3 && month <= 5) {
      seasonContent = seasonalContents.spring;
    } else if (month >= 6 && month <= 8) {
      seasonContent = seasonalContents.summer;
    } else if (month >= 9 && month <= 11) {
      seasonContent = seasonalContents.autumn;
    } else {
      seasonContent = seasonalContents.winter;
    }
    
    // 为每个月选择2-3条养护措施
    const contentCount = Math.floor(Math.random() * 2) + 2; // 2-3条
    let content = "";
    
    const usedIndices = new Set();
    for (let i = 0; i < contentCount; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * seasonContent.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      content += (i+1) + ". " + seasonContent[randomIndex] + "\n";
    }
    
    mockData.push({
      key: month.toString(),
      id: month,
      month: month,
      content: content.trim()
    });
  }
  
  return mockData;
};

const MaintenanceMeasures: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<MaintenanceMeasureData[]>([]);
  const [filteredData, setFilteredData] = useState<MaintenanceMeasureData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentMeasure, setCurrentMeasure] = useState<MaintenanceMeasureData | null>(null);
  
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
    const month = form.getFieldValue('month');
    
    if (month) {
      const filtered = data.filter(item => item.month === month);
      setFilteredData(filtered);
      message.success('查询成功');
    } else {
      setFilteredData(data);
      message.info('请选择月份');
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
    message.info('添加新养护措施功能将在后续版本实现');
  };

  // 处理导出
  const handleExport = () => {
    message.info('导出功能将在后续版本实现');
  };

  // 处理编辑
  const handleEdit = (record: MaintenanceMeasureData) => {
    message.info(`编辑${record.month}月养护措施`);
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
  const handleView = (record: MaintenanceMeasureData) => {
    setCurrentMeasure(record);
    setDetailModalVisible(true);
  };

  // 关闭详情模态框
  const handleCloseDetail = () => {
    setDetailModalVisible(false);
  };

  // 获取月份选项
  const getMonthOptions = () => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      options.push(<Option key={i} value={i}>{i}月</Option>);
    }
    return options;
  };

  // 表格列定义
  const columns: ColumnsType<MaintenanceMeasureData> = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 100,
      render: (month) => `${month}月`,
      sorter: (a, b) => a.month - b.month,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text.split('\n').map((line: string, i: number) => <div key={i}>{line}</div>)}>
          <div style={{ whiteSpace: 'pre-line' }}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
              title="确定删除此养护措施吗?"
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
    <div className="maintenance-measures">
      <Card className="search-card">
        <Form 
          form={form} 
          layout="horizontal" 
          onFinish={handleSearch}
          className="search-form"
        >
          <Row gutter={[16, 16]} align="middle" className="search-row">
            <Col xs={24} sm={12} md={8} lg={6} className="search-col">
              <Form.Item 
                label="月份" 
                name="month" 
                className="search-form-item"
              >
                <Select placeholder="请选择月份" allowClear>
                  {getMonthOptions()}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={16} lg={18} className="search-col">
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
        title={<Title level={4}>养护措施列表</Title>}
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

      <Modal
        title={currentMeasure ? `${currentMeasure.month}月养护措施详情` : '养护措施详情'}
        open={detailModalVisible}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>关闭</Button>,
          currentMeasure && (
            <Button 
              key="edit" 
              type="primary" 
              onClick={() => {
                handleCloseDetail();
                if (currentMeasure) handleEdit(currentMeasure);
              }}
            >
              编辑
            </Button>
          )
        ]}
        width={600}
      >
        {currentMeasure && (
          <div className="measure-detail">
            <Paragraph style={{ whiteSpace: 'pre-line' }}>
              {currentMeasure.content}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceMeasures; 