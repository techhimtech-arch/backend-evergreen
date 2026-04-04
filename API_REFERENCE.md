# HP Evergreen API Reference
## Complete API Documentation for Phase 1 & Phase 2

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All API requests require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication APIs

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "field_officer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "field_officer"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 🏢 Organization APIs

### List Organizations
```http
GET /organizations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org_123",
      "name": "Green Earth Foundation",
      "type": "NGO",
      "contactPerson": "Jane Smith",
      "contactEmail": "jane@greenearth.org",
      "isActive": true
    }
  ]
}
```

### Create Organization
```http
POST /organizations
```

**Request Body:**
```json
{
  "name": "Green Earth Foundation",
  "type": "NGO",
  "contactPerson": "Jane Smith",
  "contactEmail": "jane@greenearth.org",
  "contactPhone": "+91-9876543210",
  "address": "123 Green Street, Village"
}
```

---

## 👥 Group APIs

### List Groups
```http
GET /groups
```

### Create Group
```http
POST /groups
```

**Request Body:**
```json
{
  "groupName": "Mahila Eco Club",
  "groupType": "WOMEN",
  "village": "Green Village",
  "panchayat": "Green Panchayat",
  "district": "Green District",
  "leaderName": "Priya Sharma",
  "mobile": "+91-9876543210"
}
```

---

## 🌱 Plant Catalog APIs

### List Plants
```http
GET /plants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plant_123",
      "name": "Neem Tree",
      "scientificName": "Azadirachta indica",
      "category": "MEDICINAL",
      "description": "Fast growing medicinal tree"
    }
  ]
}
```

### Create Plant
```http
POST /plants
```

**Request Body:**
```json
{
  "name": "Neem Tree",
  "scientificName": "Azadirachta indica",
  "category": "MEDICINAL",
  "description": "Fast growing medicinal tree",
  "season": "ALL",
  "soilType": "ALL"
}
```

---

## 📅 Plantation Event APIs

### List Events
```http
GET /events
```

### Create Event
```http
POST /events
```

**Request Body:**
```json
{
  "eventName": "Village Plantation Drive 2024",
  "eventDate": "2024-01-15T10:00:00Z",
  "location": "Green Village Community Center",
  "organizer": "Green Earth Foundation",
  "targetPlants": 500,
  "description": "Mass plantation drive for village"
}
```

---

## 🌳 Tree Registration APIs (Phase 1)

### List Trees
```http
GET /trees
```

### Register Tree
```http
POST /trees
```

**Request Body:**
```json
{
  "plantTypeId": "plant_123",
  "eventId": "event_456",
  "location": "Near Village Temple",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "status": "PLANTED"
}
```

### Update Tree
```http
PUT /trees/:id
```

---

## 📊 Tree Monitoring APIs (Phase 2)

### Get Trees by Health Status
```http
GET /trees/health/HEALTHY
```

### Get Trees Needing Inspection
```http
GET /trees/needing-inspection
```

### Update Tree Health
```http
PATCH /trees/:id/health
```

**Request Body:**
```json
{
  "status": "HEALTHY",
  "growthStage": "SAPLING",
  "healthRemarks": "Tree growing well"
}
```

### Add Tree Photo
```http
POST /trees/:id/photos
```

**Request Body:**
```json
{
  "url": "https://storage.example.com/tree-photo.jpg",
  "caption": "Current tree condition"
}
```

---

## 🔍 Inspection APIs (Phase 2)

### List Inspections
```http
GET /inspections?status=PENDING
```

### Create Inspection
```http
POST /inspections
```

**Request Body:**
```json
{
  "treeId": "tree_123",
  "inspectorId": "user_456",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "priority": "MEDIUM"
}
```

### Complete Inspection
```http
PATCH /inspections/:id/complete
```

**Request Body:**
```json
{
  "treeStatus": "HEALTHY",
  "growthStage": "SAPLING",
  "healthScore": 8,
  "remarks": "Tree in good condition",
  "photos": [
    {
      "url": "https://storage.example.com/inspection-photo.jpg",
      "caption": "Inspection evidence"
    }
  ],
  "recommendedActions": ["Regular watering"]
}
```

### Get My Pending Inspections
```http
GET /inspections/my-pending
```

---

## 📈 Dashboard APIs

### Get Dashboard Stats
```http
GET /dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalGroups": 25,
      "totalAssignments": 10,
      "totalOrganizations": 5
    },
    "plantations": {
      "totalLandAreaAllocated": 50.5,
      "totalTargetPlants": 2500
    },
    "trees": {
      "totalTrees": 1250,
      "healthyTrees": 980,
      "weakTrees": 150,
      "deadTrees": 120,
      "survivalRate": 78.4,
      "totalPhotos": 3400
    },
    "inspections": {
      "totalInspections": 450,
      "completedInspections": 380,
      "pendingInspections": 70,
      "completionRate": 84.4
    }
  }
}
```

---

## 📋 User Management APIs

### List Users
```http
GET /users
```

### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh@example.com",
  "password": "TempPass123!",
  "role": "volunteer",
  "organizationId": "org_123"
}
```

### Update User
```http
PUT /users/:id
```

---

## 🔑 Role & Permission APIs

### List Roles
```http
GET /roles
```

### List Permissions
```http
GET /permissions
```

### Create Permission
```http
POST /permissions
```

**Request Body:**
```json
{
  "name": "CREATE_INSPECTION",
  "description": "Permission to create tree inspections",
  "resource": "INSPECTION",
  "action": "CREATE"
}
```

---

## 📝 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [/* Array of items */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Validation Error - Input validation failed |
| 500 | Internal Server Error - Server error |

---

## 🔒 Security Requirements

1. **All requests must include** `Authorization: Bearer <token>` header
2. **HTTPS only** in production environment
3. **Rate limiting** enforced on all endpoints
4. **Input validation** on all user inputs
5. **SQL injection protection** via parameterized queries
6. **XSS protection** via input sanitization

---

## 📊 Data Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  organizationId: ObjectId,
  isActive: Boolean,
  lastLogin: Date
}
```

### Tree (Phase 2 Enhanced)
```javascript
{
  plantTypeId: ObjectId,
  eventId: ObjectId,
  plantedBy: ObjectId,
  location: String,
  latitude: Number (-90 to 90),
  longitude: Number (-180 to 180),
  status: ['PLANTED', 'GROWING', 'HEALTHY', 'WEAK', 'DEAD'],
  growthStage: ['SEEDLING', 'SAPLING', 'YOUNG', 'MATURE', 'FLOWERING', 'FRUITING'],
  healthRemarks: String,
  photos: [{
    url: String,
    uploadedAt: Date,
    uploadedBy: ObjectId,
    caption: String
  }],
  lastInspectionDate: Date,
  nextInspectionDate: Date,
  plantedAt: Date
}
```

### Inspection (Phase 2)
```javascript
{
  treeId: ObjectId,
  inspectorId: ObjectId,
  assignedBy: ObjectId,
  scheduledDate: Date,
  completedDate: Date,
  status: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'],
  treeStatus: ['HEALTHY', 'WEAK', 'DEAD', 'NEEDS_ATTENTION'],
  growthStage: String,
  healthScore: Number (1-10),
  remarks: String,
  photos: [{
    url: String,
    caption: String
  }],
  recommendedActions: [String],
  priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
}
```

---

## 🧪 Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "API v1 is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "v1"
}
```

### Environment Info
- **Node.js**: v16+
- **Database**: MongoDB 4.4+
- **Cache**: Redis (optional)
- **File Storage**: AWS S3 / Google Cloud Storage (for photos)

---

## 📞 Support

For API integration support:
- **Documentation**: This reference document
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: Available in `/docs` folder
- **Error Logs**: Check application logs for detailed error information

---

*Last Updated: April 2026*
*Version: 2.0.0*
*Phases: 1 (Foundation) & 2 (Monitoring) - COMPLETE*