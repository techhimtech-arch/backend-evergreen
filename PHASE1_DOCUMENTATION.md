# HP Evergreen - Phase 1 Documentation
## Foundation Layer - Minimum Working Product

### Overview
Phase 1 establishes the core foundation of HP Evergreen, a digital ecosystem for tree plantation, survival monitoring, and environmental accountability.

### Core Features Implemented

#### 1. Authentication & Authorization System 🔐
**Purpose**: Secure user access with role-based permissions

**Key Components**:
- JWT-based authentication (15-min access tokens, 7-day refresh tokens)
- Password hashing with bcrypt
- Login audit trails
- Role-Based Access Control (RBAC) with granular permissions

**API Endpoints**:
```
POST   /api/v1/auth/register          # User registration
POST   /api/v1/auth/login             # User login
POST   /api/v1/auth/refresh           # Refresh access token
POST   /api/v1/auth/logout            # User logout
GET    /api/v1/auth/me               # Get current user profile
```

**User Roles**:
- Super Admin: Full system access
- Organization Admin: Organization-level management
- Field Officer: Data entry and monitoring
- Volunteer: Limited access for community participation

#### 2. Organization Management 🏢
**Purpose**: Multi-tenant support for different organizations

**Features**:
- Organization CRUD operations
- Contact information management
- Status management (Active/Inactive)
- Organization-specific data isolation

**API Endpoints**:
```
GET    /api/v1/organizations           # List all organizations
POST   /api/v1/organizations          # Create organization
GET    /api/v1/organizations/:id      # Get organization details
PUT    /api/v1/organizations/:id      # Update organization
DELETE /api/v1/organizations/:id      # Delete organization
PATCH  /api/v1/organizations/:id/status # Toggle status
```

#### 3. Group Management 👥
**Purpose**: Community group organization and management

**Features**:
- Group creation and management
- Group type classification (Mahila Mandal, Youth Club, Eco Club, etc.)
- Geographic information (Village, Panchayat, District)
- Leader assignment and contact details

**API Endpoints**:
```
GET    /api/v1/groups                 # List all groups
POST   /api/v1/groups                 # Create group
GET    /api/v1/groups/:id             # Get group details
PUT    /api/v1/groups/:id             # Update group
DELETE /api/v1/groups/:id             # Delete group
```

#### 4. Plant Catalog 🌱
**Purpose**: Master data for tree and plant species

**Features**:
- Plant species information
- Scientific and common names
- Category classification
- Suitability information
- Seasonal planting data

**API Endpoints**:
```
GET    /api/v1/plants                 # List all plants
POST   /api/v1/plants                 # Add new plant species
GET    /api/v1/plants/:id             # Get plant details
PUT    /api/v1/plants/:id             # Update plant info
DELETE /api/v1/plants/:id             # Delete plant species
```

#### 5. Plantation Events 📅
**Purpose**: Track tree planting drives and events

**Features**:
- Event scheduling and management
- Location and organizer tracking
- Target and actual plant counts
- Event status tracking
- Photo documentation

**API Endpoints**:
```
GET    /api/v1/events                 # List all events
POST   /api/v1/events                 # Create plantation event
GET    /api/v1/events/:id             # Get event details
PUT    /api/v1/events/:id             # Update event
DELETE /api/v1/events/:id             # Delete event
```

#### 6. Tree Registration 🌳
**Purpose**: Individual tree tracking and geo-tagging

**Features**:
- Tree registration with plant type
- Geographic coordinates (latitude/longitude)
- Location descriptions
- Plantation event linking
- Basic status tracking (Planted, Growing, Dead)

**API Endpoints**:
```
GET    /api/v1/trees                  # List all trees
POST   /api/v1/trees                  # Register new tree
GET    /api/v1/trees/:id              # Get tree details
PUT    /api/v1/trees/:id              # Update tree info
DELETE /api/v1/trees/:id              # Delete tree record
```

### Database Schema (Phase 1)

#### Core Models:
- **User**: Authentication and profile data
- **Role**: Permission definitions
- **Permission**: Granular access control
- **Organization**: Multi-tenant structure
- **Group**: Community organization
- **Plant**: Species master data
- **PlantationEvent**: Event tracking
- **Tree**: Individual tree records

### Security Features
- **Helmet**: Security headers
- **Rate Limiting**: Request throttling
- **CORS**: Cross-origin protection
- **Input Validation**: Comprehensive data validation
- **Audit Logging**: All authentication and critical actions

### API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Getting Started
1. **Environment Setup**: Configure database and JWT secrets
2. **Database Initialization**: Run seed scripts for roles and permissions
3. **User Registration**: Create super admin account
4. **Organization Setup**: Configure organizations and groups
5. **Data Entry**: Add plant species and start plantation events

### Phase 1 Success Criteria ✅
- [x] User authentication and authorization working
- [x] Multi-tenant organization support
- [x] Community group management
- [x] Plant catalog management
- [x] Plantation event tracking
- [x] Tree registration with geo-tagging
- [x] Basic API documentation (Swagger)
- [x] Database seeding and migration scripts
- [x] Security best practices implemented

**Phase 1 Status: COMPLETE** 🎉