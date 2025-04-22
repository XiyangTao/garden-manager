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
import { maintenanceCompanyAPI } from '../../services/api'; // 确保导出名称一致
import './MaintenanceCompany.css';

const { Title } = Typography;
const { Option } = Select;

// 定义养护单位数据类型
interface MaintenanceCompanyData {
  key: string;
  id: number;
  companyName: string;
  companyType: string;
  legalPerson: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
}

// 公司类型枚举
const COMPANY_TYPES = {
  STATE_OWNED: '国有企业',
  PRIVATE: '民营企业',
  FOREIGN: '外资企业',
  JOINT_VENTURE: '合资企业',
  OTHER: '其他'
};

// API URL
const API_URL = '/api/maintenance-companies';

const MaintenanceCompany: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<MaintenanceCompanyData[]>([]);
  const [filteredData, setFilteredData] = useState<MaintenanceCompanyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 加载数据方法
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await maintenanceCompanyAPI.getAll();
      const data = response.data;
      const companiesData = data.map((item: any) => ({
        key: item.id,
        id: item.id, // 直接使用后端返回的ID
        companyName: item.companyName,
        companyType: item.companyType,
        legalPerson: item.legalPerson,
        contactPerson: item.contactPerson,
        contactPhone: item.contactPhone,
        address: item.address
      }));
      setData(companiesData);
      setFilteredData(companiesData);
    } catch (error) {
      console.error('获取养护单位数据失败:', error);
      message.error('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchData();
  }, []);

  // 处理查询
  const handleSearch = useCallback(async () => {
    const companyName = form.getFieldValue('companyName');
    
    if (companyName) {
      setLoading(true);
      try {
        const response = await maintenanceCompanyAPI.search(companyName);
        const data = response.data;
        const companiesData = data.map((item: any) => ({
          key: item.id,
          id: item.id,
          companyName: item.companyName,
          companyType: item.companyType,
          legalPerson: item.legalPerson,
          contactPerson: item.contactPerson,
          contactPhone: item.contactPhone,
          address: item.address
        }));
        setFilteredData(companiesData);
        message.success('查询成功');
      } catch (error) {
        console.error('查询失败:', error);
        message.error('查询失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredData(data);
      message.info('请输入查询条件');
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
    // 此处可以添加打开表单模态框的逻辑
    message.info('添加新养护单位功能将在后续版本实现');
  };

  // 处理导出
  const handleExport = () => {
    message.info('导出功能将在后续版本实现');
  };

  // 处理编辑
  const handleEdit = (record: MaintenanceCompanyData) => {
    // 此处可以添加打开编辑表单模态框的逻辑
    message.info(`编辑养护单位：${record.companyName}`);
  };

  // 处理删除
  const handleDelete = async (key: string) => {
    setLoading(true);
    try {
      await maintenanceCompanyAPI.delete(key);
      await fetchData(); // 刷新数据
      message.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理查看详情
  const handleView = (record: MaintenanceCompanyData) => {
    // 此处可以添加打开详情模态框的逻辑
    Modal.info({
      title: '养护单位详情',
      content: (
        <div>
          <p><strong>企业名称：</strong> {record.companyName}</p>
          <p><strong>企业类别：</strong> {record.companyType}</p>
          <p><strong>企业法人：</strong> {record.legalPerson}</p>
          <p><strong>联系人：</strong> {record.contactPerson}</p>
          <p><strong>联系电话：</strong> {record.contactPhone}</p>
          <p><strong>地址：</strong> {record.address}</p>
        </div>
      ),
      width: 600,
    });
  };

  // 表格列定义
  const columns: ColumnsType<MaintenanceCompanyData> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: '企业名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200,
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
      title: '企业类别',
      dataIndex: 'companyType',
      key: 'companyType',
      width: 100,
    },
    {
      title: '企业法人',
      dataIndex: 'legalPerson',
      key: 'legalPerson',
      width: 100,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 300,
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
              title="确定删除此养护单位吗?"
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
    <div className="maintenance-company">
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
                label="名称" 
                name="companyName" 
                className="search-form-item"
              >
                <Input placeholder="请输入企业名称" />
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
        title={<Title level={4}>养护单位列表</Title>}
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
          scroll={{ x: 1200 }}
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

export default MaintenanceCompany; 