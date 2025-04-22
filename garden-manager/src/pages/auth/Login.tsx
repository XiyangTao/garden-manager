import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Card, 
  Checkbox, 
  Spin, 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeTwoTone, 
  EyeInvisibleOutlined,
  ExclamationCircleOutlined, 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI  } from '../../services/api';
import './Login.css';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<{ visible: boolean; message: string; details?: any }>({ 
    visible: false, 
    message: '' 
  });

  
  const onFinish = async (values: any) => {
    if (loading) return; // 防止重复提交
    
    setLoading(true);
    
    try {
      const { username, password } = values;
      console.log('Attempting login with:', { username, password: '********' });
      const response = await authAPI.login(username, password);
      
      // 保存认证信息
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        fullName: response.data.fullName,
        nickname: response.data.nickname || response.data.fullName,
        roles: response.data.roles,
        avatar: response.data.avatar // 保存头像URL
      }));
      localStorage.setItem('isAuthenticated', 'true');
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        // 详细的HTTP错误信息
        const errorDetails = {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        };
        
        // 根据状态码更新错误消息
        let errorMsg = '登录失败: ';
        if (error.response.status === 401) {
          errorMsg += '用户名或密码错误';
        } else if (error.response.status === 400) {
          errorMsg += error.response.data?.message || '请求参数错误';
        } else if (error.response.status === 500) {
          errorMsg += '服务器内部错误';
        } else {
          errorMsg += error.response.data?.message || '未知错误';
        }
        
        setLoginError({
          visible: true,
          message: errorMsg,
          details: errorDetails
        });
        
      } else {
        // 网络错误或请求被阻止
        setLoginError({
          visible: true,
          message: '网络错误或无法连接到服务器',
          details: error.message
        });
        
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Card variant="borderless" className="login-card">
          <div className="login-header">
            <Title level={2} className="login-title">花园管理系统</Title>
            <Text type="secondary">欢迎使用，请先登录</Text>
          </div>
          
          <Spin spinning={loading}>
            <Form
              form={form}
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  disabled={loading}
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                />
              </Form.Item>

              {loginError.visible && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
                  <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
                  {loginError.message}
                </div>
              )}

              <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>

                <a className="login-form-forgot" >
                  忘记密码
                </a>
              </Form.Item>

              <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="login-form-button" 
                    loading={loading}
                  >
                    登录
                  </Button>
              </Form.Item>
            </Form>
          </Spin>
          
         
        </Card>
      </div>
    </div>
  );
};

export default Login;