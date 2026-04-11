# 🌳 HP Evergreen - Frontend Developer Complete Guide

> **फ्रंटएंड टीम के लिए पूरा गाइड - सब कुछ एक जगह पर!**

---

## 🚀 Quick Start (तुरंत शुरू करें)

### 1. Environment Setup (एनवायरनमेंट सेटअप)
```bash
# Frontend में ये Environment Variables सेट करें
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HP Evergreen
VITE_APP_VERSION=1.0.0
```

### 2. Required Dependencies (जरूरी पैकेज)
```bash
npm install axios react-router-dom yup react-hook-form @hookform/resolvers
```

---

## 🔐 Authentication Flow (लॉगिन प्रोसेस)

### Login API Call
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Tokens को localStorage में सेव करें
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Automatic Token Refresh (टोकन अपडेट)
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// हर request के साथ token भेजें
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expire होने पर automatically refresh करें
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Original request को नए token के साथ दोबारा भेजें
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh fail हो गया, user को logout करें
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 📱 Complete API Integration (पूरा API इंटीग्रेशन)

### 1. User Management (यूजर मैनेजमेंट)

#### Get All Users (सभी यूजर लाएं)
```javascript
const getUsers = async (page = 1, limit = 10, role = '') => {
  try {
    const response = await api.get('/users', {
      params: { page, limit, role }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};
```

#### Create New User (नया यूजर बनाएं)
```javascript
const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
};

// Example usage:
const newUser = {
  firstName: "राम",
  lastName: "शर्मा",
  email: "ram.sharma@example.com",
  password: "SecurePass123!",
  role: "field_officer",
  phone: "9876543210"
};
```

### 2. Organization Management (संगठन प्रबंधन)

#### Get Organizations (संगठनों की सूची)
```javascript
const getOrganizations = async () => {
  try {
    const response = await api.get('/organizations');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    throw error;
  }
};
```

#### Create Organization (नया संगठन बनाएं)
```javascript
const createOrganization = async (orgData) => {
  try {
    const response = await api.post('/organizations', orgData);
    return response.data;
  } catch (error) {
    console.error('Failed to create organization:', error);
    throw error;
  }
};

// Example usage:
const newOrg = {
  name: "हरियाली फाउंडेशन",
  type: "NGO",
  contactPerson: "सीता देवी",
  contactEmail: "sita@hariyali.org",
  phone: "9876543210",
  address: "कांगड़ा, हिमाचल प्रदेश"
};
```

### 3. Tree Management (पेड़ प्रबंधन)

#### Get All Trees (सभी पेड़ों की जानकारी)
```javascript
const getTrees = async (filters = {}) => {
  try {
    const response = await api.get('/trees', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch trees:', error);
    throw error;
  }
};
```

#### Register New Tree (नया पेड़ रजिस्टर करें)
```javascript
const registerTree = async (treeData) => {
  try {
    const response = await api.post('/trees', treeData);
    return response.data;
  } catch (error) {
    console.error('Failed to register tree:', error);
    throw error;
  }
};

// Example usage with GPS:
const newTree = {
  plantTypeId: "plant_123",
  location: "गांव के मंदिर के पास",
  latitude: 32.0998,
  longitude: 76.2691,
  photo: "https://storage-url.com/tree-photo.jpg",
  status: "PLANTED"
};
```

### 4. Plant Catalog (पौधों की सूची)

#### Get All Plant Types (सभी पौधों के प्रकार)
```javascript
const getPlantTypes = async () => {
  try {
    const response = await api.get('/plants');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch plant types:', error);
    throw error;
  }
};
```

#### Add New Plant Type (नया पौधा प्रकार जोड़ें)
```javascript
const addPlantType = async (plantData) => {
  try {
    const response = await api.post('/plants', plantData);
    return response.data;
  } catch (error) {
    console.error('Failed to add plant type:', error);
    throw error;
  }
};

// Example usage:
const newPlant = {
  name: "नीम",
  scientificName: "Azadirachta indica",
  category: "MEDICINAL",
  description: "तेजी से बढ़ने वाला हरा-भरा पेड़",
  image: "https://example.com/neem.jpg"
};
```

---

## 🎨 React Components (React कॉम्पोनेंट्स)

### 1. Login Component (लॉगिन कॉम्पोनेंट)
```jsx
// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'लॉगिन विफल हो गया');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>HP Evergreen में लॉगिन करें</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ईमेल</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>पासवर्ड</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

### 2. Dashboard Component (डैशबोर्ड कॉम्पोनेंट)
```jsx
// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>लोड हो रहा है...</div>;
  }

  return (
    <div className="dashboard">
      <h1>डैशबोर्ड</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>कुल पेड़</h3>
          <p className="stat-number">{stats?.totalTrees || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>स्वस्थ पेड़</h3>
          <p className="stat-number">{stats?.healthyTrees || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>कुल यूजर</h3>
          <p className="stat-number">{stats?.totalUsers || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>संगठन</h3>
          <p className="stat-number">{stats?.totalOrganizations || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 📍 GPS Integration (GPS इंटीग्रेशन)

### Get Current Location (वर्तमान लोकेशन प्राप्त करें)
```javascript
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS सपोर्ट नहीं है'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};
```

### Tree Registration with GPS (GPS के साथ पेड़ रजिस्टर करें)
```javascript
const registerTreeWithGPS = async (plantTypeId) => {
  try {
    const location = await getCurrentLocation();
    
    const treeData = {
      plantTypeId,
      latitude: location.latitude,
      longitude: location.longitude,
      location: `अक्षांश: ${location.latitude.toFixed(6)}, देशांतर: ${location.longitude.toFixed(6)}`
    };

    const response = await api.post('/trees', treeData);
    return response.data;
  } catch (error) {
    console.error('GPS error:', error);
    // मैनुअल लोकेशन इनपुट के लिए fallback
    throw new Error('GPS लोकेशन प्राप्त करने में विफल');
  }
};
```

---

## 📊 Data Structures (डेटा स्ट्रक्चर)

### User Object (यूजर ऑब्जेक्ट)
```javascript
const userStructure = {
  id: "user_123",
  firstName: "राम",
  lastName: "शर्मा",
  email: "ram.sharma@example.com",
  role: "field_officer", // super_admin, admin, field_officer, volunteer
  phone: "9876543210",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z"
};
```

### Tree Object (पेड़ ऑब्जेक्ट)
```javascript
const treeStructure = {
  id: "tree_123",
  plantTypeId: "plant_456",
  location: "गांव के मंदिर के पास",
  latitude: 32.0998,
  longitude: 76.2691,
  status: "PLANTED", // PLANTED, GROWING, HEALTHY, WEAK, DEAD
  growthStage: "SAPLING", // SEEDLING, SAPLING, YOUNG, MATURE
  plantedBy: "user_789",
  plantedAt: "2024-01-01T09:00:00Z",
  photo: "https://storage-url.com/tree-photo.jpg"
};
```

### Organization Object (संगठन ऑब्जेक्ट)
```javascript
const organizationStructure = {
  id: "org_123",
  name: "हरियाली फाउंडेशन",
  type: "NGO", // NGO, GOVT, PRIVATE, COMMUNITY
  contactPerson: "सीता देवी",
  contactEmail: "sita@hariyali.org",
  phone: "9876543210",
  address: "कांगड़ा, हिमाचल प्रदेश",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z"
};
```

---

## 🚨 Error Handling (एरर हैंडलिंग)

### Global Error Handler (ग्लोबल एरर हैंडलर)
```javascript
const handleApiError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Token expire, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        break;
      case 403:
        alert('आपके पास इस कार्रवाई करने की अनुमति नहीं है');
        break;
      case 422:
        // Validation error
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          console.error(`${key}: ${errors[key]}`);
        });
        break;
      default:
        alert('कुछ गलत हो गया। कृपया फिर से कोशिश करें।');
    }
  } else {
    alert('नेटवर्क एरर। कृपया अपना इंटरनेट कनेक्शन जांचें।');
  }
};
```

---

## 🎯 Important Notes (महत्वपूर्ण नोट्स)

### 1. Authentication (प्रमाणीकरण)
- सभी API calls के लिए JWT token आवश्यक है
- Token 15 मिनट में expire हो जाता है, automatic refresh होता है
- Refresh token 7 दिनों के लिए valid है

### 2. Roles & Permissions (भूमिकाएं और अनुमतियां)
- **super_admin**: सब कुछ कर सकते हैं
- **admin**: यूजर और संगठन मैनेज कर सकते हैं
- **field_officer**: पेड़ रजिस्टर कर सकते हैं
- **volunteer**: केवल देख सकते हैं

### 3. File Upload (फाइल अपलोड)
- Photos को पहले cloud storage पर अपलोड करें
- URL को API में भेजें
- Supported formats: JPG, PNG, WebP
- Max size: 5MB

### 4. Validation (वैलिडेशन)
- Email: valid email format
- Phone: 10 digits
- Password: Minimum 8 characters, uppercase, lowercase, numbers, special characters

---

## 📞 Support & Help (सहायता)

### Backend Team Contact (बैकएंड टीम से संपर्क)
- **API Issues**: backend-team@hpevergreen.com
- **Documentation Updates**: docs@hpevergreen.com
- **Emergency Support**: +91-XXXXXXXXXX

### Useful Links (उपयोगी लिंक्स)
- **API Documentation**: `/API_REFERENCE.md`
- **Database Schema**: `/DATABASE_SCHEMA.md`
- **Testing Guide**: `/FRONTEND_TESTING_SCENARIOS.md`
- **Product Roadmap**: `/PRODUCT_ROADMAP.md`

---

## 🎉 Quick Testing Checklist (त्वरित टेस्टिंग चेकलिस्ट)

### ✅ Authentication Test
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token refresh on expiry
- [ ] Logout functionality

### ✅ User Management Test
- [ ] Get users list
- [ ] Create new user
- [ ] Update user details
- [ ] Delete user (admin only)

### ✅ Tree Management Test
- [ ] Get trees list
- [ ] Register new tree with GPS
- [ ] Upload tree photo
- [ ] Update tree status

### ✅ Mobile Features Test
- [ ] GPS location capture
- [ ] Camera integration
- [ ] Offline functionality
- [ ] Responsive design

---

**🌳 Happy Coding! अगर कोई समस्या आए तो बैकएंड टीम से संपर्क करें! 🚀**
