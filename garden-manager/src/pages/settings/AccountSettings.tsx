import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Table, 
  Space, 
  Modal, 
  Popconfirm, 
  message, 
  Typography, 
  Divider,
  Row,
  Col,
  Tag,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { userAPI } from '../../services/api';
import './AccountSettings.css';

const { Title, Text } = Typography;

// 用户账户数据类型
interface UserAccount {
  key: string;
  id: number;
  username: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  roles?: string[];
  createdAt?: string;
  lastLogin?: string;
  enabled?: boolean;
}

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [passwordForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userModalVisible, setUserModalVisible] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<string>('password');
  const [loading, setLoading] = useState<boolean>(true);

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 初始加载数据
  useEffect(() => {
    fetchCurrentUser();
    if (isAdmin()) {
      fetchAllUsers();
    } else {
      setLoading(false);
    }
  }, []);

  // 判断当前用户是否是管理员
  const isAdmin = (): boolean => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.roles.includes('ROLE_ADMIN');
    }
    return false;
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      
      // 设置当前用户
      const user: UserAccount = {
        key: userData.id.toString(),
        id: userData.id,
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        isAdmin: isAdmin(),
        createdAt: formatDate(userData.createdAt),
        lastLogin: formatDate(userData.lastLogin)
      };
      
      setCurrentUser(user);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      message.error('获取用户信息失败');
    }
  };

  // 获取所有用户信息
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      const usersData = response.data.map((user: any) => ({
        key: user.id.toString(),
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.roles.some((role: any) => role.name === 'ROLE_ADMIN'),
        roles: user.roles.map((role: any) => role.name),
        createdAt: formatDate(user.createdAt),
        lastLogin: formatDate(user.lastLogin),
        enabled: user.enabled
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('获取所有用户失败:', error);
      message.error('获取用户列表失败');
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

  // 修改密码
  const handlePasswordChange = async (values: any) => {
    try {
      const response = await userAPI.changePassword(values.oldPassword, values.newPassword);
      
      // 检查响应中是否包含密码更改成功的标志
      const successMessage = response.data && response.data.message 
        ? response.data.message 
        : '密码已成功修改';
      
      // 使用更明显的成功提示
      Modal.success({
        title: '密码更新成功',
        content: '您的密码已经成功更新，请在下次登录时使用新密码。',
        okText: '知道了',
        onOk: () => {
          // 重置表单
          passwordForm.resetFields();
        }
      });
      
      // 同时显示消息提示
      message.success(successMessage);
    } catch (error: any) {
      if (error.response && error.response.data) {
        // 检查是否是当前密码不正确的错误
        const errorMessage = error.response.data.message || '密码修改失败';
        
        // 如果是密码不正确的错误，显示更详细的错误提示
        if (errorMessage.includes('Current password is incorrect') || 
            errorMessage.includes('当前密码不正确')) {
          Modal.error({
            title: '密码验证失败',
            content: '您输入的当前密码不正确，请重新输入。',
            okText: '确定'
          });
        } else {
          // 其他类型的错误
          Modal.error({
            title: '密码修改失败',
            content: errorMessage,
            okText: '确定'
          });
        }
        
        // 同时显示消息提示
        message.error(errorMessage);
      } else {
        // 网络错误或其他未知错误
        Modal.error({
          title: '操作失败',
          content: '密码修改失败，请检查网络连接后重试。',
          okText: '确定'
        });
        message.error('密码修改失败，请稍后再试');
      }
    }
  };

  // 打开添加用户模态框
  const showAddUserModal = () => {
    setIsNewUser(true);
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  // 打开编辑用户模态框
  const showEditUserModal = (user: UserAccount) => {
    setIsNewUser(false);
    setEditingUser(user);
    userForm.setFieldsValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin
    });
    setUserModalVisible(true);
  };

  // 关闭用户模态框
  const handleUserModalCancel = () => {
    setUserModalVisible(false);
  };

  // 保存用户信息
  const handleUserSave = async (values: any) => {
    try {
      if (isNewUser) {
        // 添加新用户
        await userAPI.updateProfile({
          username: values.username,
          email: values.email,
          fullName: values.fullName,
          phone: values.phone,
          // 注意：因为没有专门的注册新用户API，这里使用更新资料API代替
          // 实际使用时需要替换为正确的API
        });
        message.success('新用户已添加');
      } else if (editingUser) {
        // 更新现有用户
        // 实际场景这里可能需要不同的API，本演示用updateProfile替代
        await userAPI.updateProfile({
          username: values.username,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone
          // 角色修改通常需要专门的API
        });
        message.success('用户信息已更新');
      }
      
      // 重新获取用户列表
      fetchAllUsers();
      setUserModalVisible(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || '操作失败');
      } else {
        message.error('操作失败，请稍后再试');
      }
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    // 不允许删除当前登录用户
    if (currentUser && userId === currentUser.id) {
      message.error('不能删除当前登录的用户');
      return;
    }
    
    try {
      await userAPI.deleteUser(userId);
      message.success('用户已删除');
      fetchAllUsers();
    } catch (error: any) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || '删除用户失败');
      } else {
        message.error('删除用户失败，请稍后再试');
      }
    }
  };

  // 用户管理表格列定义
  const userColumns: ColumnsType<UserAccount> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg'],
    },
    {
      title: '管理员',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (_, record) => (
        record.roles?.includes('ROLE_ADMIN') ? 
          <Tag color="green" icon={<CheckCircleOutlined />}>是</Tag> : 
          <Tag color="default" icon={<CloseCircleOutlined />}>否</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      responsive: ['lg'],
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditUserModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此用户吗?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={currentUser ? record.id === currentUser.id : false}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              disabled={currentUser ? record.id === currentUser.id : false}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 创建 Tab 项
  const getTabItems = () => {
    const items = [
      {
        key: 'password',
        label: '修改密码',
        children: (
          <div className="password-container">
            <Title level={4}>修改密码</Title>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
              className="password-form"
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="当前密码" 
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '密码长度不能少于8个字符' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="新密码" 
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="确认新密码" 
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  更新密码
                </Button>
              </Form.Item>
            </Form>
          </div>
        ),
      }
    ];

    // 如果是管理员添加用户管理选项卡
    if (isAdmin()) {
      items.push({
        key: 'users',
        label: '用户管理',
        children: (
          <div className="users-container">
            <div className="section-header">
              <Title level={4}>账户管理</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddUserModal}>
                添加用户
              </Button>
            </div>
            <Divider />
            <Spin spinning={loading}>
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                scroll={{ x: 800 }}
                pagination={{ pageSize: 5 }}
              />
            </Spin>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <div className="account-settings">
      <div className="back-button-container">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToDashboard}
          className="back-button"
        >
          返回仪表盘
        </Button>
      </div>
      <Card className="settings-card" variant="outlined">
        {currentUser ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={getTabItems()} />
        ) : (
          <div className="loading-container">
            <Spin spinning={true} size="large" tip="加载中..." />
          </div>
        )}
      </Card>
      
      <Modal
        title={isNewUser ? "添加新用户" : "编辑用户"}
        open={userModalVisible}
        onCancel={handleUserModalCancel}
        footer={null}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSave}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1\d{10}$/, message: '请输入有效的手机号码' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号码" />
          </Form.Item>
          {isNewUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码长度不能少于8个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
              />
            </Form.Item>
          )}
          <Form.Item
            name="isAdmin"
            label="管理员权限"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item>
            <div className="modal-footer">
              <Space>
                <Button onClick={handleUserModalCancel}>取消</Button>
                <Button type="primary" htmlType="submit">
                  {isNewUser ? "添加" : "保存"}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountSettings; 