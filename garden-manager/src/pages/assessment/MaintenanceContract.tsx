import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, Space, DatePicker, Tag, Popconfirm, message, Row, Col, Typography } from 'antd';
import { SearchOutlined, ClearOutlined, PlusOutlined, ExportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';

interface ContractData {
  key: string;
  id: number;
  companyName: string;
  projectName: string;
  projectCode: string;
  maintenanceArea: string;
  bidDate: string;
  endDate: string;
}

const MaintenanceContract: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<ContractData[]>([
    {
      key: '1',
      id: 1,
      companyName: '绿城园林有限公司',
      projectName: '中央公园绿化养护项目',
      projectCode: 'GH-2023-001',
      maintenanceArea: '中央公园北区',
      bidDate: '2023-05-15',
      endDate: '2024-05-14',
    },
    {
      key: '2',
      id: 2,
      companyName: '城市绿化管理有限公司',
      projectName: '滨江公园养护工程',
      projectCode: 'GH-2023-002',
      maintenanceArea: '滨江公园全区',
      bidDate: '2023-06-10',
      endDate: '2024-06-09',
    },
    {
      key: '3',
      id: 3,
      companyName: '绿洲园艺工程有限公司',
      projectName: '市民广场绿化养护',
      projectCode: 'GH-2023-003',
      maintenanceArea: '市民广场及周边',
      bidDate: '2023-03-20',
      endDate: '2024-03-19',
    },
    {
      key: '4',
      id: 4,
      companyName: '四季青园林工程有限公司',
      projectName: '东湖公园养护项目',
      projectCode: 'GH-2023-004',
      maintenanceArea: '东湖公园全区',
      bidDate: '2023-04-01',
      endDate: '2024-03-31',
    },
    {
      key: '5',
      id: 5,
      companyName: '城市绿化管理有限公司',
      projectName: '西湖景区养护工程',
      projectCode: 'GH-2023-005',
      maintenanceArea: '西湖景区南岸',
      bidDate: '2023-07-01',
      endDate: '2024-06-30',
    },
  ]);
  
  const [filteredData, setFilteredData] = useState<ContractData[]>(data);
  
  // 处理搜索
  const handleSearch = (values: any) => {
    const { projectName } = values;
    
    if (!projectName || projectName.trim() === '') {
      setFilteredData(data);
      return;
    }
    
    const filtered = data.filter(item => 
      item.projectName.toLowerCase().includes(projectName.toLowerCase())
    );
    
    setFilteredData(filtered);
  };
  
  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setFilteredData(data);
  };
  
  // 添加合同(示例功能)
  const handleAdd = () => {
    message.success('点击了添加按钮，此功能正在开发中');
  };
  
  // 导出CSV
  const handleExport = () => {
    // 创建CSV数据
    const headers = ['序号', '养护单位名称', '项目名称', '项目编号', '养护区域', '中标日期', '合同截止日期'];
    
    const csvData = filteredData.map((item, index) => [
      (index + 1).toString(),
      item.companyName,
      item.projectName,
      item.projectCode,
      item.maintenanceArea,
      item.bidDate,
      item.endDate
    ]);
    
    // 添加表头
    csvData.unshift(headers);
    
    // 格式化为CSV字符串
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 创建隐藏下载链接并触发
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `养护合同管理_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('数据导出成功！');
  };
  
  // 编辑合同(示例功能)
  const handleEdit = (record: ContractData) => {
    message.success(`点击了编辑按钮，编辑ID: ${record.id}，此功能正在开发中`);
  };
  
  // 删除合同
  const handleDelete = (key: string) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
    setFilteredData(newData);
    message.success('删除成功');
  };
  
  // 表格列定义
  const columns: TableProps<ContractData>['columns'] = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: '养护单位名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 180,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: '养护区域',
      dataIndex: 'maintenanceArea',
      key: 'maintenanceArea',
      width: 180,
    },
    {
      title: '中标日期',
      dataIndex: 'bidDate',
      key: 'bidDate',
      width: 120,
    },
    {
      title: '合同截止日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (text) => {
        const isExpired = dayjs(text).isBefore(dayjs());
        return (
          <span>
            {text} {isExpired && <Tag color="red">已到期</Tag>}
          </span>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此合同吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card variant="borderless">
      <Typography.Title level={4}>养护合同管理</Typography.Title>
      
      {/* 搜索表单 */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 20 }}
      >
        <Row style={{ width: '100%' }}>
          <Col flex="auto">
            <Form.Item name="projectName" label="项目名称">
              <Input placeholder="请输入项目名称" allowClear />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item style={{ marginRight: 0 }}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                >
                  查询
                </Button>
                <Button 
                  onClick={handleReset} 
                  icon={<ClearOutlined />}
                >
                  清空
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      
      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            onClick={handleAdd} 
            icon={<PlusOutlined />}
          >
            添加
          </Button>
          <Button 
            onClick={handleExport} 
            icon={<ExportOutlined />}
          >
            导出
          </Button>
        </Space>
      </div>
      
      {/* 数据表格 */}
      <Table 
        columns={columns} 
        dataSource={filteredData}
        rowKey="key"
        pagination={{ 
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          defaultPageSize: 10,
        }}
        bordered
        scroll={{ x: 1100 }}
      />
    </Card>
  );
};

export default MaintenanceContract; 