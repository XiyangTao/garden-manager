import axios from 'axios';

// 使用相对路径，可以通过Nginx代理转发到实际后端
// 如果需要在开发环境中使用完整URL，可以通过环境变量覆盖
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许跨域请求携带凭证
});

// 请求拦截器，添加Token
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to ${config.url}`, config);
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response || error);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    }
    
    const originalRequest = error.config;
    
    // 如果是401错误，且不是登录请求，清除本地token并重定向到登录页
    if (error.response && error.response.status === 401 && 
        !originalRequest.url.includes('/auth/signin') &&
        !originalRequest.url.includes('/auth/test') &&
        window.location.pathname !== '/login') {
      // Clear all authentication data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      console.log('Authentication failed (401), redirecting to login page');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// 认证相关接口
const authAPI = {
  login: async (username, password) => {
    console.log('Login attempt:', { username, password: '********' });
    
    try {
      // 打印请求信息以便调试
      console.log('Login request payload:', { username, password: '***' });
      
      // 直接使用axios进行请求以便更多自定义控制
      const response = await axios({
        method: 'post',
        url: `${API_URL}/auth/signin`,
        data: { username, password },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        timeout: 10000
      });
      
      console.log('Login response:', response.data);
      return response;
    } catch (error) {
      console.error('Login request failed:', error);
      if (error.response) {
        console.error('Login error status:', error.response.status);
        console.error('Login error data:', error.response.data);
        console.error('Login error headers:', error.response.headers);
      }
      throw error;
    }
  },
  register: (userData) => {
    return api.post('/auth/signup', userData);
  },
};

// 用户相关接口
const userAPI = {
  getProfile: () => {
    return api.get('/users/profile');
  },
  updateProfile: (userData) => {
    return api.put('/users/profile', userData);
  },
  changePassword: (currentPassword, newPassword) => {
    return api.put('/users/profile', { currentPassword, newPassword });
  },
  getAllUsers: () => {
    return api.get('/users');
  },
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },
  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};

// 处理头像URL，确保有正确的完整路径
export const processAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  
  // 如果已经是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // 如果是Base64数据，直接返回
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  
  // 否则，拼接服务器路径
  // 使用相对路径或基础URL（取决于环境）
  const baseUrl = process.env.REACT_APP_API_URL;
  
  // 确保avatarUrl没有前导斜杠，而baseUrl没有结尾斜杠
  const cleanAvatarUrl = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/${cleanAvatarUrl}`;
};

// 管养单元相关接口
const maintenanceUnitAPI = {
  // 获取所有管养单元
  getAllUnits: () => {
    return api.get('/maintenance-units');
  },
  
  // 获取单个管养单元详情
  getUnitById: (id) => {
    return api.get(`/maintenance-units/${id}`);
  },
  
  // 创建新管养单元
  createUnit: (unitData) => {
    return api.post('/maintenance-units', unitData);
  },
  
  // 更新管养单元
  updateUnit: (id, unitData) => {
    return api.put(`/maintenance-units/${id}`, unitData);
  },
  
  // 删除管养单元
  deleteUnit: (id) => {
    return api.delete(`/maintenance-units/${id}`);
  }
};


// 管养单元相关接口
const maintenanceCompanyAPI = {
  getAll: () => api.get('/maintenance-companies'),
  
  search: (companyName) => 
    api.get('/maintenance-companies/search', { params: { companyName } }),
  
  delete: (id) => api.delete(`/maintenance-companies/${id}`),
  
  // 保持其他方法不变
  getById: (id) => api.get(`/maintenance-companies/${id}`),
  create: (data) => api.post('/maintenance-companies', data),
  update: (id, data) => api.put(`/maintenance-companies/${id}`, data)
};

export { api, authAPI, userAPI, maintenanceUnitAPI, maintenanceCompanyAPI }; 