import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space,
  Upload,
  Avatar,
  Divider,
  Spin,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadProps } from 'antd';
import { userAPI } from '../../services/api';
import './ProfileSettings.css';

const { Title, Text } = Typography;

// 使用相对路径，通过Nginx代理转发到实际后端
// 如果环境变量中有设置，则优先使用环境变量的值
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

// 用户数据类型
interface UserProfile {
  id: number;
  username: string;
  nickname?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
}

// 提示信息类型
interface FeedbackMessage {
  type: 'success' | 'error' | 'warning' | 'info' | null;
  message: string;
}

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<FeedbackMessage>({ type: null, message: '' });
  const [avatarFeedback, setAvatarFeedback] = useState<FeedbackMessage>({ type: null, message: '' });

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 获取用户信息
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      
      // 处理头像URL
      let avatarUrl = userData.avatar;
      if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http')) {
        // 如果是相对路径，添加基础URL
        avatarUrl = `${BASE_URL}/${avatarUrl.replace(/^\//, '')}`;
        console.log('构建头像URL:', avatarUrl); // 添加调试日志
      }
      
      setCurrentUser({
        id: userData.id,
        username: userData.username,
        nickname: userData.nickname || userData.fullName || userData.username,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        avatar: avatarUrl
      });
      setAvatarUrl(avatarUrl);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setFeedback({ type: 'error', message: '获取用户信息失败' });
      
      // 如果API调用失败，尝试从localStorage获取基本信息
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setCurrentUser({
            id: user.id,
            username: user.username,
            nickname: user.fullName || user.username,
            fullName: user.fullName,
            email: user.email
          });
        } catch (e) {
          console.error('解析本地用户信息失败', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 设置表单初始值
  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        nickname: currentUser.nickname
      });
    }
  }, [form, currentUser]);

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing && currentUser) {
      form.setFieldsValue({
        nickname: currentUser.nickname
      });
    }
    // 清除反馈信息
    setFeedback({ type: null, message: '' });
    setAvatarFeedback({ type: null, message: '' });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentUser) {
      form.setFieldsValue({
        nickname: currentUser.nickname
      });
      setAvatarUrl(currentUser.avatar || null);
    }
    // 清除反馈信息
    setFeedback({ type: null, message: '' });
    setAvatarFeedback({ type: null, message: '' });
  };

  // 上传头像
  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      // 清除之前的反馈
      setAvatarFeedback({ type: null, message: '' });
      
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        setAvatarFeedback({ type: 'error', message: '只能上传 JPG/PNG 格式的图片!' });
        return Upload.LIST_IGNORE;
      }
      
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        setAvatarFeedback({ type: 'error', message: '图片大小不能超过 2MB!' });
        return Upload.LIST_IGNORE;
      }

      // 使用 FileReader 预览图片
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
        setAvatarFeedback({ type: 'success', message: '头像已预览，保存后生效' });
      };
      
      // 阻止自动上传
      return false;
    }
  };

  // 保存个人资料
  const handleSave = async (values: any) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setFeedback({ type: null, message: '' });
      
      const updateData: any = {
        nickname: values.nickname
      };
      
      // 如果头像被修改，将Base64数据添加到请求中
      if (avatarUrl) {
        // 只有当头像是新的Base64数据或者头像有变化时才更新
        if (avatarUrl.startsWith('data:') || 
            (currentUser.avatar && avatarUrl !== currentUser.avatar)) {
          updateData.avatar = avatarUrl;
          console.log('更新头像数据:', avatarUrl.substring(0, 50) + '...');
        }
      }
      
      // 调用API更新用户信息
      const response = await userAPI.updateProfile(updateData);
      console.log('API响应:', response.data);
      
      // 获取API返回的用户信息
      let newNickname = values.nickname;
      let newAvatarUrl = avatarUrl;
      
      if (response.data) {
        // 使用API返回的昵称（如果有）
        if (response.data.nickname) {
          newNickname = response.data.nickname;
        }
        
        // 使用API返回的头像URL（如果有）
        if (response.data.avatar) {
          const responseAvatar = response.data.avatar;
          if (responseAvatar) {
            // 处理返回的头像URL路径
            if (responseAvatar.startsWith('data:') || responseAvatar.startsWith('http')) {
              newAvatarUrl = responseAvatar;
            } else {
              // 如果是相对路径，添加基础URL
              newAvatarUrl = `${responseAvatar.replace(/^\//, '')}`;
            }
            console.log('API返回的新头像URL:', newAvatarUrl);
          }
        }
      }

      // 更新本地状态
      setCurrentUser({
        ...currentUser,
        nickname: newNickname,
        avatar: newAvatarUrl
      });

      if(newAvatarUrl && !newAvatarUrl.startsWith('data:') && !newAvatarUrl.startsWith('http')){
        setAvatarUrl(`${BASE_URL}/${newAvatarUrl.replace(/^\//, '')}`);
      }else{
        setAvatarUrl(newAvatarUrl);
      }
      
      // 更新localStorage中的用户信息
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          localStorage.setItem('user', JSON.stringify({
            ...user,
            nickname: newNickname,
            fullName: user.fullName,
            avatar: newAvatarUrl
          }));
        } catch (e) {
          console.error('更新本地用户信息失败', e);
        }
      }
      
      setFeedback({ type: 'success', message: '个人资料已更新' });
      setIsEditing(false);
    } catch (error) {
      console.error('更新个人资料失败:', error);
      setFeedback({ type: 'error', message: '更新个人资料失败' });
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl: string) => {
        setAvatarUrl(imageUrl);
        setAvatarFeedback({ type: 'success', message: '头像已预览，保存后生效' });
      });
    }
  };

  // 将文件转为Base64
  const getBase64 = (img: File, callback: (base64Url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  if (loading && !currentUser) {
    return (
      <div className="profile-settings loading-container">
        <Spin spinning={true} size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="profile-settings">
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
      
      <Card className="profile-card" variant="outlined">
        <div className="profile-header">
          <Title level={2}>个人资料</Title>
          {!isEditing ? (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={toggleEditMode}
            >
              编辑
            </Button>
          ) : (
            <Space>
              <Button onClick={handleCancelEdit}>取消</Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={() => form.submit()}
                loading={loading}
              >
                保存
              </Button>
            </Space>
          )}
        </div>
        
        <Divider />
        
        {feedback.type && (
          <div className="feedback-container" style={{ marginBottom: '16px' }}>
            {feedback.type === 'success' ? (
              <Text type="success">
                <CheckCircleOutlined /> {feedback.message}
              </Text>
            ) : feedback.type === 'error' ? (
              <Text type="danger">
                <ExclamationCircleOutlined /> {feedback.message}
              </Text>
            ) : (
              <Text>{feedback.message}</Text>
            )}
          </div>
        )}
        
        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-display">
              {avatarUrl ? (
                <>
                <Avatar 
                  size={120} 
                  src={avatarUrl} 
                  className="user-avatar"
                />
                {process.env.NODE_ENV === 'development' && (
                  <Text type="secondary" style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                    {/* {avatarUrl} */}
                  </Text>
                )}
                </>
              ) : (
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                  className="user-avatar"
                />
              )}
              
              {isEditing && (
                <div className="avatar-upload">
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                      if (!isJpgOrPng) {
                        setAvatarFeedback({ type: 'error', message: '只能上传 JPG/PNG 格式的图片!' });
                        return Upload.LIST_IGNORE;
                      }
                      
                      const isLt2M = file.size / 1024 / 1024 < 2;
                      if (!isLt2M) {
                        setAvatarFeedback({ type: 'error', message: '图片大小不能超过 2MB!' });
                        return Upload.LIST_IGNORE;
                      }
                      
                      getBase64(file, (imageUrl) => {
                        setAvatarUrl(imageUrl);
                        setAvatarFeedback({ type: 'success', message: '头像已预览，保存后生效' });
                      });
                      
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>更换头像</Button>
                  </Upload>
                  
                  <div className="avatar-feedback">
                    {avatarFeedback.type && (
                      avatarFeedback.type === 'success' ? (
                        <Text type="success">
                          <CheckCircleOutlined /> {avatarFeedback.message}
                        </Text>
                      ) : avatarFeedback.type === 'error' ? (
                        <Text type="danger">
                          <ExclamationCircleOutlined /> {avatarFeedback.message}
                        </Text>
                      ) : (
                        <Text>{avatarFeedback.message}</Text>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Spin spinning={loading}>
            <div className="info-section">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                disabled={!isEditing}
                className="profile-form"
              >
                <Form.Item label="用户名">
                  <Input 
                    value={currentUser?.username} 
                    disabled={true} 
                    prefix={<UserOutlined />}
                  />
                  <Text type="secondary" className="field-description">
                    用户名不可修改
                  </Text>
                </Form.Item>
                
                <Form.Item
                  name="nickname"
                  label="昵称"
                  rules={[{ required: true, message: '请输入昵称' }]}
                >
                  <Input placeholder="请输入昵称" />
                </Form.Item>
                
                {currentUser?.email && (
                  <Form.Item label="邮箱">
                    <Input value={currentUser.email} disabled={true} />
                  </Form.Item>
                )}
                
                {currentUser?.phone && (
                  <Form.Item label="手机号">
                    <Input value={currentUser.phone} disabled={true} />
                  </Form.Item>
                )}
              </Form>
            </div>
          </Spin>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings; 