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
  Typography,
  Tooltip,
  Divider,
  Popconfirm,
  Drawer,
  message,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
  ExportOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import './ContractManagement.css';

const { Title, Text } = Typography;

// 定义合同数据类型
interface ContractType {
  key: string;
  contractId: string;
  contractName: string;
  contractType: string;
  partyA: string;
  partyB: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  signDate: string;
  area: string;
  description: string;
}

// 合同状态枚举
const CONTRACT_STATUS = {
  ACTIVE: '生效中',
  EXPIRED: '已到期',
  PENDING: '待生效',
  TERMINATED: '已终止'
};

// 合同类型枚举
const CONTRACT_TYPES = {
  MAINTENANCE: '养护合同',
  PLANTING: '种植合同',
  CONSTRUCTION: '建设合同',
  CONSULTING: '咨询合同',
  OTHER: '其他'
};

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [currentContract, setCurrentContract] = useState<ContractType | null>(null);

  // 生成模拟数据
  const generateMockData = useCallback(() => {
    const mockData: ContractType[] = [];
    const statusValues = Object.values(CONTRACT_STATUS);
    const typeValues = Object.values(CONTRACT_TYPES);
    const areas = ['东区', '西区', '南区', '北区', '中心区'];
  
    for (let i = 1; i <= 30; i++) {
      const startDate = dayjs().subtract(Math.floor(Math.random() * 365), 'day').format('YYYY-MM-DD');
      const endDate = dayjs(startDate).add(Math.floor(Math.random() * 730) + 365, 'day').format('YYYY-MM-DD');
      const status = statusValues[Math.floor(Math.random() * statusValues.length)];
      const contractType = typeValues[Math.floor(Math.random() * typeValues.length)];
      const area = areas[Math.floor(Math.random() * areas.length)];
  
      mockData.push({
        key: i.toString(),
        contractId: `HT-${2023}-${String(i).padStart(4, '0')}`,
        contractName: `${area}${contractType}项目合同`,
        contractType,
        partyA: '园林管理处',
        partyB: `${['恒通', '绿洲', '盛世', '华美', '永兴'][Math.floor(Math.random() * 5)]}园林公司`,
        amount: Math.floor(Math.random() * 900000) + 100000,
        startDate,
        endDate,
        status,
        signDate: dayjs(startDate).subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
        area,
        description: `该合同主要负责${area}的园林${contractType === CONTRACT_TYPES.MAINTENANCE ? '养护' : '建设'}工作`
      });
    }
    return mockData;
  }, []);

  // 初始化数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      setContracts(generateMockData());
      setLoading(false);
    }, 500);
  }, [generateMockData]);

  // 过滤数据
  const filterData = useCallback(() => {
    let filteredData = [...generateMockData()];
    
    if (searchText) {
      filteredData = filteredData.filter(item => 
        item.contractName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.contractId.toLowerCase().includes(searchText.toLowerCase()) ||
        item.partyB.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filteredData;
  }, [searchText, generateMockData]);

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    form.resetFields();
    setSearchText('');
    
    setTimeout(() => {
      setContracts(generateMockData());
      setLoading(false);
      message.success('数据已刷新');
    }, 500);
  };

  // 查看合同详情
  const handleView = (record: ContractType) => {
    setCurrentContract(record);
    setVisible(true);
  };

  // 删除合同
  const handleDelete = (id: string) => {
    setContracts(contracts.filter(item => item.contractId !== id));
    message.success('合同已删除');
  };

  // 添加新合同
  const handleAdd = () => {
    message.info('添加新合同功能将在后续版本实现');
  };

  // 导出功能
  const handleExport = () => {
    message.info('导出功能将在后续版本实现');
  };

  // 编辑合同
  const handleEdit = (record: ContractType) => {
    message.info('编辑合同功能将在后续版本实现');
  };

  // 表格列定义
  const columns: ColumnsType<ContractType> = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '养护单位名称',
      dataIndex: 'partyB',
      key: 'partyB',
      width: 180,
    },
    {
      title: '项目名称',
      dataIndex: 'contractName',
      key: 'contractName',
      width: 220,
      render: (text) => <span className="contract-name">{text}</span>
    },
    {
      title: '项目编号',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 150,
    },
    {
      title: '养护区域',
      dataIndex: 'area',
      key: 'area',
      width: 120,
      filters: [
        { text: '东区', value: '东区' },
        { text: '西区', value: '西区' },
        { text: '南区', value: '南区' },
        { text: '北区', value: '北区' },
        { text: '中心区', value: '中心区' },
      ],
      onFilter: (value, record) => record.area === value,
    },
    {
      title: '中标日期',
      dataIndex: 'signDate',
      key: 'signDate',
      width: 120,
      sorter: (a, b) => dayjs(a.signDate).unix() - dayjs(b.signDate).unix(),
    },
    {
      title: '合同截止日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
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
              title="确定删除此合同吗?"
              onConfirm={() => handleDelete(record.contractId)}
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

  // 处理搜索表单提交
  const handleSearch = () => {
    setContracts(filterData());
    message.success('查询成功');
  };

  // 清空搜索条件
  const handleReset = () => {
    form.resetFields();
    setSearchText('');
    setContracts(generateMockData());
    message.info('已清空搜索条件');
  };

  return (
    <div className="contract-management">
      <Card className="search-card">
        <Form 
          form={form} 
          layout="horizontal" 
          onFinish={handleSearch}
          className="search-form"
        >
          <Row gutter={[16, 16]} align="middle" className="search-row">
            <Col xs={24} sm={12} md={10} lg={8} className="search-col">
              <Form.Item label="关键词搜索" name="searchText" className="search-form-item">
                <Input 
                  placeholder="项目名称/编号/养护单位" 
                  prefix={<SearchOutlined />} 
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={14} lg={16} className="button-col">
              <Space>
                <Button icon={<ClearOutlined />} onClick={handleReset}>清空</Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
      
      <Card 
        title={<Title level={4}>养护合同列表</Title>}
        className="data-card"
        extra={
          <Space>
            <Button icon={<FileAddOutlined />} type="primary" onClick={handleAdd}>增加</Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          loading={loading}
          rowKey="contractId"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>
      
      {currentContract && (
        <Drawer
          title="合同详情"
          width={720}
          open={visible}
          onClose={() => setVisible(false)}
          extra={
            <Space>
              <Button onClick={() => setVisible(false)}>关闭</Button>
              <Button type="primary" onClick={() => handleEdit(currentContract)}>编辑</Button>
            </Space>
          }
        >
          <div className="contract-detail">
            <Divider orientation="left">基本信息</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>项目编号: </Text>
                <Text>{currentContract.contractId}</Text>
              </Col>
              <Col span={12}>
                <Text strong>项目名称: </Text>
                <Text>{currentContract.contractName}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>合同类型: </Text>
                <Text>{currentContract.contractType}</Text>
              </Col>
              <Col span={12}>
                <Text strong>养护区域: </Text>
                <Text>{currentContract.area}</Text>
              </Col>
            </Row>
            
            <Divider orientation="left">合同方</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>甲方: </Text>
                <Text>{currentContract.partyA}</Text>
              </Col>
              <Col span={12}>
                <Text strong>养护单位: </Text>
                <Text>{currentContract.partyB}</Text>
              </Col>
            </Row>
            
            <Divider orientation="left">合同内容</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>合同金额: </Text>
                <Text>¥{currentContract.amount.toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>中标日期: </Text>
                <Text>{currentContract.signDate}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>生效日期: </Text>
                <Text>{currentContract.startDate}</Text>
              </Col>
              <Col span={12}>
                <Text strong>合同截止日期: </Text>
                <Text>{currentContract.endDate}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>合同状态: </Text>
                <Text>{currentContract.status}</Text>
              </Col>
            </Row>
            
            <Divider orientation="left">合同描述</Divider>
            <Row>
              <Col span={24}>
                <Text>{currentContract.description}</Text>
              </Col>
            </Row>
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default ContractManagement; 