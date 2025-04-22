import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tooltip,
  Popconfirm,
  message,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  ExportOutlined,
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './DailyPhrases.css';

const { Title } = Typography;

// 定义日常用语数据类型
interface DailyPhraseData {
  key: string;
  id: number;
  phrase: string;
}

// 生成模拟数据
const generateMockData = (): DailyPhraseData[] => {
  const mockData: DailyPhraseData[] = [];
  
  const phrases = [
    "请注意保持草坪整洁，勿践踏草地。",
    "树木修剪过程中，请勿靠近施工区域。",
    "园区内请勿采摘花卉和果实。",
    "发现病虫害情况，请及时向管理处报告。",
    "灌溉设备已开启，请避开喷洒区域。",
    "正在进行植物养护工作，请绕行。",
    "花坛新种植区域，请勿靠近。",
    "垃圾请分类投放至指定垃圾桶。",
    "园区内禁止使用明火，谨防火灾。",
    "保持公共区域卫生，人人有责。",
    "花木修剪后的废弃物将及时清理，请谅解临时堆放。",
    "为保护环境，请勿在园区内乱扔垃圾。",
    "园区内禁止遛狗，谢谢配合。",
    "新栽植的幼苗需要特别呵护，请勿触碰。",
    "绿地养护期间，暂时封闭，请绕行。",
    "园区设施如有损坏，请及时报告管理处。",
    "定期养护期间可能产生噪音，敬请理解。",
    "雨后路面湿滑，请小心行走。",
    "保护花草树木，共建美好家园。",
    "请爱护公共设施，文明游园。"
  ];
  
  // 生成日常用语数据
  for (let i = 0; i < phrases.length; i++) {
    mockData.push({
      key: (i + 1).toString(),
      id: i + 1,
      phrase: phrases[i]
    });
  }
  
  return mockData;
};

const DailyPhrases: React.FC = () => {
  const [data, setData] = useState<DailyPhraseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 初始加载数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const mockData = generateMockData();
      setData(mockData);
      setLoading(false);
    }, 800);
  }, []);

  // 处理添加
  const handleAdd = () => {
    message.info('添加新日常用语功能将在后续版本实现');
  };

  // 处理导出
  const handleExport = () => {
    message.info('导出功能将在后续版本实现');
  };

  // 处理编辑
  const handleEdit = (record: DailyPhraseData) => {
    message.info(`编辑日常用语：${record.phrase.substring(0, 15)}...`);
    // 实际应用中这里会打开编辑表单模态框
  };

  // 处理删除
  const handleDelete = (key: string) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
    message.success('删除成功');
  };

  // 处理查看详情
  const handleView = (record: DailyPhraseData) => {
    message.info(`查看日常用语详情：${record.phrase}`);
    // 实际应用中这里可能会打开一个模态框显示更多信息
  };

  // 表格列定义
  const columns: ColumnsType<DailyPhraseData> = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '日常用语',
      dataIndex: 'phrase',
      key: 'phrase',
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
              title="确定删除此日常用语吗?"
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
    <div className="daily-phrases">
      <Card 
        title={<Title level={4}>日常用语列表</Title>}
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
          dataSource={data}
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

export default DailyPhrases; 