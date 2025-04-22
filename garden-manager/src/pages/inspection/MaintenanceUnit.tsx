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
  message,
  Divider,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  SplitCellsOutlined, 
  ExportOutlined,
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { maintenanceUnitAPI } from '../../services/api';
import './MaintenanceUnit.css';

// 定义数据类型
interface MaintenanceUnitData {
  key: string;
  id: number;
  unitName: string;
  maintenanceLevel: string;
  treeTypes: string;
  treeCount: number;
  greenArea: number;
  patchCount: number;
  createdAt?: string;
  updatedAt?: string;
}

const MaintenanceUnit: React.FC = () => {
  const [form] = Form.useForm();
  const [unitForm] = Form.useForm();
  const [data, setData] = useState<MaintenanceUnitData[]>([]);
  const [filteredData, setFilteredData] = useState<MaintenanceUnitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unitModalVisible, setUnitModalVisible] = useState<boolean>(false);
  const [currentUnit, setCurrentUnit] = useState<MaintenanceUnitData | null>(null);
  const [isNewUnit, setIsNewUnit] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  
  // 初始加载数据
  useEffect(() => {
    fetchMaintenanceUnits();
  }, []);

  // 从后端获取所有管养单元
  const fetchMaintenanceUnits = async () => {
    setLoading(true);
    try {
      const response = await maintenanceUnitAPI.getAllUnits();
      const unitsData = response.data.map((unit: any) => ({
        key: unit.id.toString(),
        id: unit.id,
        unitName: unit.unitName,
        maintenanceLevel: unit.maintenanceLevel || '',
        treeTypes: unit.treeTypes || '',
        treeCount: unit.treeCount,
        greenArea: unit.greenArea,
        patchCount: unit.patchCount,
        createdAt: formatDate(unit.createdAt),
        updatedAt: formatDate(unit.updatedAt)
      }));
      
      setData(unitsData);
      setFilteredData(unitsData);
    } catch (error: any) {
      console.error('获取管养单元失败:', error);
      message.error('获取管养单元列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理查询
  const handleSearch = useCallback(() => {
    const unitName = form.getFieldValue('unitName');
    
    if (unitName) {
      const filtered = data.filter(item => 
        item.unitName.toLowerCase().includes(unitName.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [form, data]);

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setFilteredData(data);
  };

  // 处理拆分
  const handleSplit = () => {
    message.info('点击了拆分按钮');
    // 实际应用中这里会处理拆分管养单元的逻辑
  };

  // 处理导出
  const handleExport = () => {
    message.info('点击了导出按钮');
    // 实际应用中这里会处理导出数据的逻辑
  };

  // 显示添加单元模态框
  const showAddUnitModal = () => {
    setIsNewUnit(true);
    setCurrentUnit(null);
    unitForm.resetFields();
    setUnitModalVisible(true);
  };

  // 显示编辑单元模态框
  const showEditUnitModal = (unit: MaintenanceUnitData) => {
    setIsNewUnit(false);
    setCurrentUnit(unit);
    unitForm.setFieldsValue({
      unitName: unit.unitName,
      maintenanceLevel: unit.maintenanceLevel,
      treeTypes: unit.treeTypes,
      treeCount: unit.treeCount,
      greenArea: unit.greenArea,
      patchCount: unit.patchCount
    });
    setUnitModalVisible(true);
  };

  // 关闭单元模态框
  const handleUnitModalCancel = () => {
    setUnitModalVisible(false);
  };

  // 保存单元信息
  const handleUnitSave = async (values: any) => {
    try {
      if (isNewUnit) {
        // 添加新管养单元
        await maintenanceUnitAPI.createUnit(values);
        message.success('管养单元已添加');
      } else if (currentUnit) {
        // 更新现有管养单元
        await maintenanceUnitAPI.updateUnit(currentUnit.id, values);
        message.success('管养单元已更新');
      }
      
      // 重新获取管养单元列表
      fetchMaintenanceUnits();
      setUnitModalVisible(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || '操作失败');
      } else {
        message.error('操作失败，请稍后再试');
      }
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await maintenanceUnitAPI.deleteUnit(id);
      message.success('管养单元删除成功');
      fetchMaintenanceUnits();
    } catch (error: any) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || '删除管养单元失败');
      } else {
        message.error('删除管养单元失败，请稍后再试');
      }
    }
  };

  // 处理查看详情
  const handleView = async (unit: MaintenanceUnitData) => {
    try {
      // 获取单个管养单元的详细信息
      const response = await maintenanceUnitAPI.getUnitById(unit.id);
      setCurrentUnit({
        ...response.data,
        key: response.data.id.toString(),
        createdAt: formatDate(response.data.createdAt),
        updatedAt: formatDate(response.data.updatedAt)
      });
      setDetailModalVisible(true);
    } catch (error: any) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || '获取管养单元详情失败');
      } else {
        message.error('获取管养单元详情失败，请稍后再试');
      }
    }
  };

  // 表格列定义
  const columns: ColumnsType<MaintenanceUnitData> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
    },
    {
      title: '管养单元名称',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 180,
    },
    {
      title: '养护等级',
      dataIndex: 'maintenanceLevel',
      key: 'maintenanceLevel',
      width: 100,
      align: 'center',
    },
    {
      title: '行道树种类',
      dataIndex: 'treeTypes',
      key: 'treeTypes',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (treeTypes) => (
        <Tooltip placement="topLeft" title={treeTypes}>
          {treeTypes}
        </Tooltip>
      ),
    },
    {
      title: '行道树数量',
      dataIndex: 'treeCount',
      key: 'treeCount',
      width: 120,
      align: 'right',
      render: (count) => `${count} 棵`,
      sorter: (a, b) => a.treeCount - b.treeCount,
    },
    {
      title: '绿地面积 (㎡)',
      dataIndex: 'greenArea',
      key: 'greenArea',
      width: 130,
      align: 'right',
      render: (area) => area.toFixed(2),
      sorter: (a, b) => a.greenArea - b.greenArea,
    },
    {
      title: '斑块数量',
      dataIndex: 'patchCount',
      key: 'patchCount',
      width: 100,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
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
            onClick={() => showEditUnitModal(record)}
          />
          <Popconfirm
            title="确定要删除此管养单元吗？"
            onConfirm={() => handleDelete(record.id)}
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
    <div className="maintenance-unit">
      <Card title="管养单元管理" className="filter-card">
        <Form 
          form={form} 
          layout="horizontal" 
          className="filter-form"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="unitName" label="管养单元名称">
                <Input placeholder="请输入管养单元名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Space className="button-group">
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
            </Col>
          </Row>
          <Row style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Space className="action-buttons">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={showAddUnitModal}
                >
                  添加
                </Button>
                <Button 
                  type="primary" 
                  icon={<SplitCellsOutlined />} 
                  onClick={handleSplit}
                >
                  拆分
                </Button>
                <Button 
                  icon={<ExportOutlined />} 
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

      {/* 管养单元表单模态框 */}
      <Modal
        title={isNewUnit ? "添加管养单元" : "编辑管养单元"}
        open={unitModalVisible}
        onCancel={handleUnitModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={unitForm}
          layout="vertical"
          onFinish={handleUnitSave}
        >
          <Form.Item
            name="unitName"
            label="管养单元名称"
            rules={[{ required: true, message: '请输入管养单元名称' }]}
          >
            <Input placeholder="请输入管养单元名称" />
          </Form.Item>
          <Form.Item
            name="maintenanceLevel"
            label="养护等级"
          >
            <Input placeholder="请输入养护等级" />
          </Form.Item>
          <Form.Item
            name="treeTypes"
            label="行道树种类"
          >
            <Input.TextArea placeholder="请输入行道树种类，多种类型用逗号分隔" rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="treeCount"
                label="行道树数量"
                rules={[{ required: true, message: '请输入行道树数量' }]}
              >
                <Input type="number" min={0} placeholder="数量" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="greenArea"
                label="绿地面积 (㎡)"
                rules={[{ required: true, message: '请输入绿地面积' }]}
              >
                <Input type="number" min={0} step={0.01} placeholder="面积" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="patchCount"
                label="斑块数量"
                rules={[{ required: true, message: '请输入斑块数量' }]}
              >
                <Input type="number" min={0} placeholder="数量" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div className="modal-footer">
              <Space>
                <Button onClick={handleUnitModalCancel}>取消</Button>
                <Button type="primary" htmlType="submit">
                  {isNewUnit ? "添加" : "保存"}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 管养单元详情模态框 */}
      <Modal
        title="管养单元详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setDetailModalVisible(false);
              if (currentUnit) {
                showEditUnitModal(currentUnit);
              }
            }}
          >
            编辑
          </Button>,
        ]}
        width={600}
      >
        {currentUnit && (
          <div className="unit-detail">
            <p><strong>管养单元名称：</strong> {currentUnit.unitName}</p>
            <p><strong>养护等级：</strong> {currentUnit.maintenanceLevel || '-'}</p>
            <p><strong>行道树种类：</strong> {currentUnit.treeTypes || '-'}</p>
            <p><strong>行道树数量：</strong> {currentUnit.treeCount} 棵</p>
            <p><strong>绿地面积：</strong> {currentUnit.greenArea.toFixed(2)} ㎡</p>
            <p><strong>斑块数量：</strong> {currentUnit.patchCount}</p>
            <p><strong>创建时间：</strong> {currentUnit.createdAt}</p>
            <p><strong>更新时间：</strong> {currentUnit.updatedAt}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceUnit; 