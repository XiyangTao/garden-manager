import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Card, Space, Breadcrumb, Spin, message } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  WarningOutlined,
  TrophyOutlined,
  HistoryOutlined,
  ApartmentOutlined,
  DownOutlined,
  LoadingOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BankOutlined,
  ToolOutlined,
  MessageOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import type { MenuProps } from 'antd';
import { processAvatarUrl } from '../../services/api';

// Lazy load components for better performance
const ProblemManagement = lazy(() => import('../inspection/ProblemManagement'));
const Leaderboard = lazy(() => import('../inspection/Leaderboard'));
const MaintenanceRecord = lazy(() => import('../inspection/MaintenanceRecord'));
const MaintenanceUnit = lazy(() => import('../inspection/MaintenanceUnit'));
const AssessmentManagement = lazy(() => import('../assessment/AssessmentManagement'));
const DeductionStatistics = lazy(() => import('../assessment/DeductionStatistics'));
const MaintenanceImplementation = lazy(() => import('../assessment/MaintenanceImplementation'));
const MaintenancePlan = lazy(() => import('../assessment/MaintenancePlan'));
const MaintenanceCompany = lazy(() => import('../inspection/MaintenanceCompany'));
const MaintenanceMeasures = lazy(() => import('../inspection/MaintenanceMeasures'));
const DailyPhrases = lazy(() => import('../inspection/DailyPhrases'));
const AssessmentItems = lazy(() => import('../inspection/AssessmentItems'));
const MaintenanceContract = lazy(() => import('../assessment/MaintenanceContract'));

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [openKeys, setOpenKeys] = useState<string[]>(['sub1']);
  const [userInfo, setUserInfo] = useState<{
    nickname?: string;
    fullName?: string;
    username: string;
    roles: string[];
    avatar?: string;
  } | null>(null);

  // 在组件挂载时获取用户信息
  useEffect(() => {
    loadUserInfoFromLocalStorage();
  }, []);
  
  // 添加一个函数从localStorage刷新用户信息
  const loadUserInfoFromLocalStorage = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserInfo({
          nickname: user.nickname || user.fullName || user.username, // 优先使用nickname
          fullName: user.fullName,
          username: user.username,
          roles: user.roles || [],
          avatar: processAvatarUrl(user.avatar) // 处理头像URL
        });
      } catch (error) {
        console.error('解析用户信息失败', error);
      }
    }
  };
  

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    message.success('已安全退出系统');
    navigate('/login');
  };

  const handleAccountSettings = () => {
    navigate('/settings');
  };

  const handleProfileSettings = () => {
    navigate('/profile');
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(keys.length ? keys : []);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    // If collapsing and there are open keys, save them and close all
    if (!collapsed) {
      setOpenKeys([]);
    } else {
      // When expanding, restore default open key
      setOpenKeys(['sub1']);
    }
  };

  // Menu items for the sidebar
  const menuItems: MenuItem[] = [
    {
      key: '1',
      icon: <SearchOutlined />,
      label: '查询',
    },
    {
      key: '2',
      icon: <BarChartOutlined />,
      label: '统计',
    },
    {
      key: 'sub1',
      icon: <FileSearchOutlined />,
      label: '养护巡查',
      children: [
        {
          key: 'sub1-1',
          label: '日常巡查',
          children: [
            {
              key: '3-1-1',
              icon: <WarningOutlined />,
              label: '问题处置管理',
            },
            {
              key: '3-1-2',
              icon: <TrophyOutlined />,
              label: '排行榜',
            },
            {
              key: '3-1-3',
              icon: <HistoryOutlined />,
              label: '养护记录',
            },
            {
              key: '3-1-4',
              icon: <ApartmentOutlined />,
              label: '管养单元',
            }
          ]
        },
        {
          key: '3-2',
          icon: <CheckCircleOutlined />,
          label: '养护考核',
          children: [
            {
              key: '3-2-1',
              icon: <CheckCircleOutlined />,
              label: '养护考核管理',
            },
            {
              key: '3-2-2',
              icon: <BarChartOutlined />,
              label: '扣分统计',
            },
            {
              key: '3-2-3',
              icon: <FileSearchOutlined />,
              label: '养护实施管理',
            },
            {
              key: '3-2-4',
              icon: <FileTextOutlined />,
              label: '养护合同管理',
            },
            {
              key: '3-2-5',
              icon: <CalendarOutlined />,
              label: '养护计划',
            }
          ]
        },
        {
          key: '3-3',
          icon: <DatabaseOutlined />,
          label: '数据字典',
          children: [
            {
              key: '3-3-1',
              icon: <BankOutlined />,
              label: '养护单位管理',
            },
            {
              key: '3-3-2',
              icon: <ToolOutlined />,
              label: '养护措施管理',
            },
            {
              key: '3-3-3',
              icon: <MessageOutlined />,
              label: '日常用语管理',
            },
            {
              key: '3-3-4',
              icon: <FileProtectOutlined />,
              label: '考核项目内容管理',
            }
          ]
        }
      ]
    }
  ];

  // Function to get the title based on selected menu item
  const getTitle = () => {
    // Logic to get nested menu item title
    const findMenuItemLabel = (items: any, key: string): string | undefined => {
      for (const item of items) {
        if (item.key === key) {
          return item.label;
        }
        if (item.children) {
          const label = findMenuItemLabel(item.children, key);
          if (label) return label;
        }
      }
      return undefined;
    };

    return findMenuItemLabel(menuItems, selectedKey) || '';
  };

  // Function to get the breadcrumb
  const getBreadcrumb = () => {
    const breadcrumbs: { title: string, path?: string }[] = [{ title: '首页', path: '/dashboard' }];
    
    const findPath = (items: any, targetKey: string, currentPath: { title: string, path?: string }[] = []): boolean => {
      for (const item of items) {
        if (item.key === targetKey) {
          currentPath.push({ title: item.label });
          breadcrumbs.push(...currentPath);
          return true;
        }
        
        if (item.children) {
          const newPath = [...currentPath, { title: item.label, path: `/dashboard/${item.key}` }];
          if (findPath(item.children, targetKey, newPath)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findPath(menuItems, selectedKey);
    return breadcrumbs;
  };

  // Render content based on selected menu item
  const renderContent = () => {
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
    
    switch (selectedKey) {
      case '3-1-1': // 问题处置管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <ProblemManagement />
          </Suspense>
        );
      case '3-1-2': // 排行榜
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <Leaderboard />
          </Suspense>
        );
      case '3-1-3': // 养护记录
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenanceRecord />
          </Suspense>
        );
      case '3-1-4': // 管养单元
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenanceUnit />
          </Suspense>
        );
      case '3-2-1': // 养护考核管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <AssessmentManagement />
          </Suspense>
        );
      case '3-2-2': // 扣分统计
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <DeductionStatistics />
          </Suspense>
        );
      case '3-2-3': // 养护实施管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenanceImplementation />
          </Suspense>
        );
      case '3-2-4': // 养护合同管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenanceContract />
          </Suspense>
        );
      case '3-2-5': // 养护计划
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenancePlan />
          </Suspense>
        );
      case '3-3-1': // 养护单位管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenanceCompany />
          </Suspense>
        );
      case '3-3-2': // 养护措施管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <MaintenanceMeasures />
          </Suspense>
        );
      case '3-3-3': // 日常用语管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <DailyPhrases />
          </Suspense>
        );
      case '3-3-4': // 考核项目内容管理
        return (
          <Suspense fallback={<div className="loading-container"><Spin spinning={true} indicator={antIcon} tip="加载中..." /></div>}>
            <AssessmentItems />
          </Suspense>
        );
      default:
        return (
          <Card>
            <Paragraph>
              欢迎使用花园管理系统。请从左侧菜单选择功能模块。
            </Paragraph>
            <Text type="secondary">
              这是{getTitle()}模块的内容区域，根据需要可以在此处显示相应的功能组件。
            </Text>
          </Card>
        );
    }
  };

  return (
    <Layout className="dashboard-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        className="dashboard-sider"
        width={240}
      >
        <div className="logo">
          {!collapsed && <span>花园管理系统</span>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={({ key }) => handleMenuClick(key)}
          items={menuItems}
        />
      </Sider>
      <Layout className={`site-layout ${collapsed ? 'collapsed' : ''}`}>
        <Header className="site-header" style={{ padding: 0 }}>
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: toggleCollapsed,
            })}
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: [
              {
                key: '1',
                icon: <UserOutlined />,
                label: '个人资料',
                onClick: handleProfileSettings
              },
              // {
              //   key: '2',
              //   icon: <SettingOutlined />,
              //   label: '账户设置',
              //   onClick: handleAccountSettings
              // },
              // {
              //   type: 'divider'
              // },
              {
                key: '3',
                icon: <LogoutOutlined />,
                label: '退出登录',
                onClick: handleLogout
              }
            ] }} trigger={['click']}>
              <Button type="link" className="user-dropdown-button">
                <Space>
                  {userInfo?.avatar ? (
                    <Avatar src={userInfo.avatar} />
                  ) : (
                    <Avatar icon={<UserOutlined />} />
                  )}
                  <span>{userInfo?.nickname || userInfo?.fullName || userInfo?.username || '用户'}</span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content className="site-content">
          <div className="content-header">
            <Breadcrumb
              items={getBreadcrumb().map((item, index) => ({
                title: index === 0 ? <><HomeOutlined /> {item.title}</> : item.title,
                href: item.path
              }))}
            />
            <Title level={2}>{getTitle()}</Title>
          </div>
          
          <div className="content-body">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard; 