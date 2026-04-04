# HP Evergreen - Frontend Integration Guide
## Quick Start for Frontend Developers

### 🚀 Getting Started

1. **Base URL**: `http://localhost:5000/api/v1`
2. **Authentication**: JWT Bearer tokens required for all requests
3. **Response Format**: Consistent JSON structure across all endpoints

---

## 🔐 Authentication Flow

### 1. User Registration/Login
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  }
  return data;
};
```

### 2. API Requests with Auth
```javascript
// Helper function for authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(`/api/v1${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  });

  return response.json();
};
```

---

## 📱 Key Frontend Integration Points

### Dashboard Data
```javascript
// Get dashboard statistics
const getDashboard = () => apiRequest('/dashboard');
```

### Tree Management
```javascript
// Get all trees
const getTrees = () => apiRequest('/trees');

// Register new tree
const registerTree = (treeData) =>
  apiRequest('/trees', {
    method: 'POST',
    body: JSON.stringify(treeData)
  });

// Update tree health (Phase 2)
const updateTreeHealth = (treeId, healthData) =>
  apiRequest(`/trees/${treeId}/health`, {
    method: 'PATCH',
    body: JSON.stringify(healthData)
  });

// Add tree photo (Phase 2)
const addTreePhoto = (treeId, photoData) =>
  apiRequest(`/trees/${treeId}/photos`, {
    method: 'POST',
    body: JSON.stringify(photoData)
  });
```

### Inspection Management (Phase 2)
```javascript
// Get my pending inspections
const getMyInspections = () => apiRequest('/inspections/my-pending');

// Complete inspection
const completeInspection = (inspectionId, findings) =>
  apiRequest(`/inspections/${inspectionId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(findings)
  });
```

---

## 🗺️ Data Structures for Frontend

### Tree Object
```javascript
const treeStructure = {
  id: "tree_123",
  plantTypeId: "plant_456",
  location: "Near Village Temple",
  latitude: 28.6139,
  longitude: 77.2090,
  status: "HEALTHY", // PLANTED, GROWING, HEALTHY, WEAK, DEAD
  growthStage: "SAPLING", // SEEDLING, SAPLING, YOUNG, MATURE, FLOWERING, FRUITING
  healthRemarks: "Growing well",
  photos: [{
    url: "https://storage.example.com/photo.jpg",
    uploadedAt: "2024-01-01T10:00:00Z",
    caption: "Current condition"
  }],
  plantedAt: "2024-01-01T09:00:00Z"
};
```

### Inspection Object
```javascript
const inspectionStructure = {
  id: "insp_123",
  treeId: "tree_456",
  inspectorId: "user_789",
  scheduledDate: "2024-01-15T10:00:00Z",
  status: "PENDING", // PENDING, IN_PROGRESS, COMPLETED, MISSED
  priority: "MEDIUM", // LOW, MEDIUM, HIGH, CRITICAL
  treeStatus: "HEALTHY",
  healthScore: 8,
  remarks: "Tree in good condition",
  photos: [{
    url: "https://storage.example.com/inspection.jpg",
    caption: "Inspection evidence"
  }]
};
```

---

## 🎨 UI Component Suggestions

### Tree Status Badges
```javascript
const getStatusColor = (status) => {
  const colors = {
    PLANTED: 'blue',
    GROWING: 'yellow',
    HEALTHY: 'green',
    WEAK: 'orange',
    DEAD: 'red'
  };
  return colors[status] || 'gray';
};
```

### Health Score Indicator
```javascript
const HealthScore = ({ score }) => {
  const percentage = (score / 10) * 100;
  return (
    <div className="health-bar">
      <div
        className="health-fill"
        style={{ width: `${percentage}%` }}
      />
      <span>{score}/10</span>
    </div>
  );
};
```

### Photo Upload Component
```javascript
const PhotoUpload = ({ onPhotoUpload }) => {
  const handleFileSelect = async (file) => {
    // Upload to cloud storage first
    const photoUrl = await uploadToCloud(file);

    // Then add to tree
    const result = await addTreePhoto(treeId, {
      url: photoUrl,
      caption: 'Uploaded from mobile'
    });

    onPhotoUpload(result);
  };

  return (
    <input
      type="file"
      accept="image/*"
      capture="environment"
      onChange={(e) => handleFileSelect(e.target.files[0])}
    />
  );
};
```

---

## 📍 GPS Integration

### Get Current Location
```javascript
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
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

### Tree Registration with GPS
```javascript
const registerTreeWithGPS = async (plantTypeId, eventId) => {
  try {
    const location = await getCurrentLocation();

    const treeData = {
      plantTypeId,
      eventId,
      latitude: location.latitude,
      longitude: location.longitude,
      location: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`
    };

    return await registerTree(treeData);
  } catch (error) {
    console.error('GPS error:', error);
    // Fallback to manual location input
  }
};
```

---

## 🔄 State Management

### Redux Store Structure
```javascript
const initialState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  trees: {
    list: [],
    loading: false,
    selectedTree: null
  },
  inspections: {
    pending: [],
    completed: [],
    loading: false
  },
  dashboard: {
    stats: null,
    loading: false
  }
};
```

### Key Actions
```javascript
// Auth actions
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

// Tree actions
export const FETCH_TREES = 'FETCH_TREES';
export const UPDATE_TREE_HEALTH = 'UPDATE_TREE_HEALTH';

// Inspection actions
export const FETCH_MY_INSPECTIONS = 'FETCH_MY_INSPECTIONS';
export const COMPLETE_INSPECTION = 'COMPLETE_INSPECTION';
```

---

## 🚨 Error Handling

### Global Error Handler
```javascript
const handleApiError = (error) => {
  switch (error.status) {
    case 401:
      // Token expired, redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      break;
    case 403:
      // Permission denied
      showNotification('You do not have permission for this action', 'error');
      break;
    case 422:
      // Validation error
      showValidationErrors(error.data.errors);
      break;
    default:
      showNotification('An error occurred. Please try again.', 'error');
  }
};
```

---

## 📊 Charts & Analytics

### Survival Rate Chart
```javascript
const SurvivalChart = ({ trees }) => {
  const healthy = trees.filter(t => t.status === 'HEALTHY').length;
  const weak = trees.filter(t => t.status === 'WEAK').length;
  const dead = trees.filter(t => t.status === 'DEAD').length;
  const total = trees.length;

  const survivalRate = ((total - dead) / total * 100).toFixed(1);

  return (
    <div className="survival-chart">
      <h3>Tree Survival Rate: {survivalRate}%</h3>
      <div className="chart-bars">
        <div className="bar healthy" style={{ width: `${healthy/total*100}%` }}>
          Healthy ({healthy})
        </div>
        <div className="bar weak" style={{ width: `${weak/total*100}%` }}>
          Weak ({weak})
        </div>
        <div className="bar dead" style={{ width: `${dead/total*100}%` }}>
          Dead ({dead})
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 Development Tools

### API Testing with Postman
1. Import the HP Evergreen collection
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api/v1`
   - `token`: Your JWT token
3. Use pre-request scripts for automatic token refresh

### Mock Data for Development
```javascript
// Mock tree data for development
const mockTrees = [
  {
    id: 'tree_1',
    plantTypeId: 'plant_1',
    location: 'Village Center',
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'HEALTHY',
    growthStage: 'SAPLING',
    photos: []
  }
];
```

---

## 📱 Mobile Considerations

### PWA Features
- **Offline Support**: Cache critical data for offline inspection
- **Camera Integration**: Direct photo capture for trees and inspections
- **GPS Tracking**: Automatic location capture
- **Push Notifications**: Inspection reminders and updates

### Performance Optimization
- **Lazy Loading**: Load tree lists in chunks
- **Image Optimization**: Compress photos before upload
- **Caching**: Cache user data and reference data
- **Background Sync**: Queue actions for when online

---

## 🐛 Common Issues & Solutions

### Token Expiration
```javascript
// Automatic token refresh
const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (isTokenExpired(token)) {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
    }
  }
};
```

### Network Error Handling
```javascript
const withRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## 📞 Support Resources

- **API Documentation**: `/API_REFERENCE.md`
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: `/docs/HP_Evergreen.postman_collection.json`
- **Mock Data**: `/docs/mock_data.json`

---

*Happy Coding! 🌳🚀*