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
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './MaintenanceRecord.css';

// 定义数据类型
interface MaintenanceData {
  key: string;
  id: number;
  road: string;
  contractor: string;
  inspector: string;
  location: string;
  plantType: string;
  maintenanceGoal: string;
  technicalMeasures: string;
  score: number;
}

// 模拟数据生成函数
const generateMockData = (count: number): MaintenanceData[] => {
  const roads = ['东湖路', '西山路', '南门大道', '北区环路', '中央林荫道'];
  const contractors = ['张三', '李四', '王五', '赵六', '钱七'];
  const inspectors = ['技术员A', '技术员B', '技术员C', '技术员D', '技术员E'];
  const locations = ['东区', '西区', '南区', '北区', '中央区'];
  const plantTypes = ['乔木', '灌木', '花卉', '草坪', '水生植物'];
  const goals = ['保持良好生长状态', '预防病虫害', '提高观赏性', '增强抗性', '促进繁殖'];
  const measures = [
    '定期浇水、施肥', 
    '病虫害防治、修剪', 
    '除草、松土、换土', 
    '防寒、防冻、防暑', 
    '保持水质清洁、定期换水'
  ];

  return Array.from({ length: count }, (_, i) => {
    return {
      key: i.toString(),
      id: i + 1,
      road: roads[Math.floor(Math.random() * roads.length)],
      contractor: contractors[Math.floor(Math.random() * contractors.length)],
      inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      plantType: plantTypes[Math.floor(Math.random() * plantTypes.length)],
      maintenanceGoal: goals[Math.floor(Math.random() * goals.length)],
      technicalMeasures: measures[Math.floor(Math.random() * measures.length)],
      score: Math.floor(Math.random() * 31) + 70, // 70-100的随机数
    };
  });
};

const MaintenanceRecord: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<MaintenanceData[]>([]);
  const [filteredData, setFilteredData] = useState<MaintenanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 初始加载数据
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockData(50);
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // 处理查询
  const handleSearch = useCallback(() => {
    const formValues = form.getFieldsValue();
    const { contractor, inspector, road } = formValues;
    
    let filtered = [...data];
    
    if (contractor) {
      filtered = filtered.filter(item => 
        item.contractor.toLowerCase().includes(contractor.toLowerCase())
      );
    }
    
    if (inspector) {
      filtered = filtered.filter(item => 
        item.inspector.toLowerCase().includes(inspector.toLowerCase())
      );
    }
    
    if (road) {
      filtered = filtered.filter(item => 
        item.road.toLowerCase().includes(road.toLowerCase())
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
    // 实际应用中这里会打开新增表单模态框
  };

  // 处理编辑
  const handleEdit = (record: MaintenanceData) => {
    message.info(`编辑记录：${record.id}`);
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
  const handleView = (record: MaintenanceData) => {
    message.info(`查看记录详情：${record.id}`);
    // 实际应用中这里会打开详情模态框
  };

  // 表格列定义
  const columns: ColumnsType<MaintenanceData> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '道路',
      dataIndex: 'road',
      key: 'road',
      width: 120,
    },
    {
      title: '绿地承包人',
      dataIndex: 'contractor',
      key: 'contractor',
      width: 120,
    },
    {
      title: '技术巡查员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '植物类型',
      dataIndex: 'plantType',
      key: 'plantType',
      width: 100,
    },
    {
      title: '养护目标',
      dataIndex: 'maintenanceGoal',
      key: 'maintenanceGoal',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (maintenanceGoal) => (
        <Tooltip placement="topLeft" title={maintenanceGoal}>
          {maintenanceGoal}
        </Tooltip>
      ),
    },
    {
      title: '分项内容及技术措施',
      dataIndex: 'technicalMeasures',
      key: 'technicalMeasures',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (technicalMeasures) => (
        <Tooltip placement="topLeft" title={technicalMeasures}>
          {technicalMeasures}
        </Tooltip>
      ),
    },
    {
      title: '分值',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score) => {
        let color = 'green';
        if (score < 80) {
          color = 'red';
        } else if (score < 90) {
          color = 'orange';
        }
        return <Tag color={color}>{score}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
          </Button>
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
            >
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="maintenance-record">
      <Card title="养护记录管理" className="filter-card">
        <Form 
          form={form} 
          layout="horizontal" 
          className="filter-form"
        >
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item name="contractor" label="承包负责人">
                <Input placeholder="" allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="inspector" label="技术巡查员">
                <Input placeholder="" allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="road" label="道路">
                <Input placeholder="" allowClear />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item className="action-buttons">
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
                  style={{ marginLeft: '8px' }}
                >
                  清空
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAdd}
                  style={{ marginLeft: '8px' }}
                >
                  新增
                </Button>
              </Form.Item>
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

export default MaintenanceRecord; 