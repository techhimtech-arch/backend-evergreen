# HP Evergreen - Phase 2 Documentation
## Monitoring Layer - Tree Survival & Health Tracking

### Overview
Phase 2 transforms HP Evergreen from a basic registration system to a comprehensive environmental monitoring platform. The focus shifts from "planting" to "survival monitoring" with advanced health tracking, photo evidence, and systematic inspection workflows.

### Core Features Implemented

#### 1. Enhanced Tree Health Tracking 📊
**Purpose**: Monitor tree survival and growth beyond initial planting

**New Features**:
- **Advanced Status Levels**: PLANTED → GROWING → HEALTHY → WEAK → DEAD
- **Growth Stage Tracking**: SEEDLING → SAPLING → YOUNG → MATURE → FLOWERING → FRUITING
- **Health Remarks**: Detailed observations and notes
- **Inspection Scheduling**: Last/next inspection date tracking

**Enhanced Tree Model**:
```javascript
{
  // Existing fields...
  status: { type: String, enum: ['PLANTED', 'GROWING', 'HEALTHY', 'WEAK', 'DEAD'] },
  growthStage: { type: String, enum: ['SEEDLING', 'SAPLING', 'YOUNG', 'MATURE', 'FLOWERING', 'FRUITING'] },
  healthRemarks: String,
  photos: [{
    url: String,
    uploadedAt: Date,
    uploadedBy: ObjectId,
    caption: String
  }],
  lastInspectionDate: Date,
  nextInspectionDate: Date
}
```

**API Endpoints**:
```
PATCH  /api/v1/trees/:id/health       # Update tree health status
GET    /api/v1/trees/health/:status   # Filter trees by health status
GET    /api/v1/trees/needing-inspection # Trees due for inspection
POST   /api/v1/trees/:id/photos       # Add photo to tree
```

#### 2. Advanced Photo Management 📸
**Purpose**: Visual evidence and monitoring of tree conditions

**Features**:
- **Multiple Photos per Tree**: Historical photo tracking
- **Photo Metadata**: Upload timestamp, uploader, captions
- **Photo Integration**: Automatic linking with inspections
- **Photo API**: Dedicated endpoints for photo management

**Photo Schema**:
```javascript
{
  url: String,           // Cloud storage URL
  uploadedAt: Date,      // Upload timestamp
  uploadedBy: ObjectId,  // Reference to User
  caption: String        // Optional description
}
```

#### 3. Enhanced Geo-Tagging 📍
**Purpose**: Precise location tracking for environmental monitoring

**Improvements**:
- **Coordinate Validation**: Latitude (-90 to 90), Longitude (-180 to 180)
- **Geo Indexes**: Optimized database queries for location-based operations
- **Location Accuracy**: Support for GPS coordinates from mobile devices
- **Mapping Integration**: Ready for integration with mapping services

#### 4. Complete Inspection Module 🔍
**Purpose**: Systematic tree health monitoring and maintenance workflow

**Key Components**:

**Inspection Model**:
```javascript
{
  treeId: ObjectId,           // Tree being inspected
  inspectorId: ObjectId,      // Assigned inspector
  assignedBy: ObjectId,       // Who assigned the inspection
  scheduledDate: Date,        // When inspection should happen
  completedDate: Date,        // When inspection was completed
  status: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'],
  treeStatus: ['HEALTHY', 'WEAK', 'DEAD', 'NEEDS_ATTENTION'],
  growthStage: String,        // Current growth stage
  healthScore: Number,        // 1-10 health rating
  remarks: String,            // Inspection notes
  photos: [{                  // Evidence photos
    url: String,
    caption: String
  }],
  recommendedActions: [String], // Follow-up tasks
  priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
}
```

**Inspection Workflow**:
1. **Create Inspection**: Assign inspector to tree with priority and schedule
2. **Field Inspection**: Inspector visits tree, records findings
3. **Photo Evidence**: Capture condition photos
4. **Complete Inspection**: Submit findings and recommendations
5. **Follow-up**: System tracks recommended actions

**API Endpoints**:
```
GET    /api/v1/inspections                    # List inspections (with filters)
POST   /api/v1/inspections                   # Create new inspection
GET    /api/v1/inspections/:id               # Get inspection details
PUT    /api/v1/inspections/:id               # Update inspection
DELETE /api/v1/inspections/:id               # Delete inspection
PATCH  /api/v1/inspections/:id/complete      # Complete inspection with findings
GET    /api/v1/inspections/tree/:treeId      # Tree's inspection history
GET    /api/v1/inspections/my-pending        # Inspector's pending tasks
```

### Enhanced Dashboard Analytics 📊

**Phase 2 adds comprehensive monitoring metrics**:

```json
{
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
```

**Key Metrics**:
- **Survival Rate**: (Total Trees - Dead Trees) / Total Trees × 100
- **Health Distribution**: Breakdown by health status
- **Inspection Coverage**: Completed vs pending inspections
- **Photo Documentation**: Visual evidence tracking

### Mobile-First Considerations 📱

**Phase 2 APIs designed for mobile field operations**:
- **Offline-Capable**: Minimal data requirements for field work
- **Photo Upload**: Optimized for mobile camera integration
- **GPS Integration**: Automatic coordinate capture
- **Simple Workflows**: Streamlined for field inspectors

### Data Validation & Quality Assurance

**Enhanced Validation Rules**:
- **Coordinate Validation**: Geographic boundary checks
- **Photo Requirements**: Mandatory evidence for inspections
- **Health Score Validation**: 1-10 rating system
- **Date Logic**: Prevent future-dated inspections

### Integration Points

**Phase 2 enables integration with**:
- **Mapping Services**: Google Maps, OpenStreetMap
- **Cloud Storage**: AWS S3, Google Cloud Storage for photos
- **Mobile Apps**: Field inspection applications
- **IoT Sensors**: Future environmental monitoring devices
- **Reporting Systems**: Automated environmental reports

### Performance Optimizations

**Database Enhancements**:
- **Geo Indexes**: Efficient location-based queries
- **Status Indexes**: Fast filtering by health status
- **Date Indexes**: Optimized inspection scheduling queries
- **Aggregation Pipelines**: Real-time dashboard calculations

### Security Enhancements

**Phase 2 Security Features**:
- **Field Data Encryption**: Secure photo and location data
- **Audit Trails**: Complete inspection history tracking
- **Role-Based Access**: Inspector-specific permissions
- **Data Integrity**: Validation at all entry points

### API Examples

#### Create Inspection
```json
POST /api/v1/inspections
{
  "treeId": "tree_123",
  "inspectorId": "user_456",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "priority": "HIGH"
}
```

#### Complete Inspection
```json
PATCH /api/v1/inspections/insp_789/complete
{
  "treeStatus": "HEALTHY",
  "growthStage": "SAPLING",
  "healthScore": 8,
  "remarks": "Tree growing well, minor pest activity observed",
  "photos": [
    {
      "url": "https://storage.example.com/photo1.jpg",
      "caption": "Current tree condition"
    }
  ],
  "recommendedActions": ["Apply organic pesticide"]
}
```

#### Update Tree Health
```json
PATCH /api/v1/trees/tree_123/health
{
  "status": "HEALTHY",
  "growthStage": "SAPLING",
  "healthRemarks": "Responding well to recent treatment"
}
```

### Phase 2 Success Criteria ✅

**Functional Requirements**:
- [x] Enhanced tree health tracking system
- [x] Photo upload and management
- [x] Geo-tagging with validation
- [x] Complete inspection workflow
- [x] Dashboard monitoring metrics
- [x] Mobile-optimized APIs

**Performance Requirements**:
- [x] Sub-second query response times
- [x] Efficient photo storage handling
- [x] Scalable inspection management
- [x] Real-time dashboard updates

**Quality Requirements**:
- [x] Comprehensive API documentation
- [x] Input validation and error handling
- [x] Data integrity constraints
- [x] Audit trail completeness

**Phase 2 Status: COMPLETE** 🎉

### Next Steps Preview (Phase 3)
**Community Participation Layer**:
- Volunteer registration and management
- Task assignment system (watering, inspection, maintenance)
- Attendance and participation tracking
- Community engagement metrics
- Mobile app integration for volunteers