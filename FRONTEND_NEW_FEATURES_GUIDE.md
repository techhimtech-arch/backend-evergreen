# 🌳 HP Evergreen - New Features Frontend Integration Guide
> **सिर्फ नए Features के लिए: Inspection, Plantation Events, Tree Monitoring**

---

## 🎯 Overview (नए Features क्या हैं)

### ✅ नए Implemented Features:
1. **Tree Inspection System** - पेड़ों की health check और monitoring
2. **Plantation Events** - Organized plantation drives management  
3. **Real-time Tree Monitoring** - Live tree status tracking
4. **Photo-based Monitoring** - Time-lapse tree growth tracking

---

## 🔍 Tree Inspection System (पेड़ निरीक्षण प्रणाली)

### 1. Get My Pending Inspections (मेरे pending inspections)
```javascript
const getMyInspections = async () => {
  try {
    const response = await api.get('/inspections/my-pending');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inspections:', error);
    throw error;
  }
};

// Response structure:
// {
//   success: true,
//   data: [
//     {
//       id: "insp_123",
//       treeId: "tree_456",
//       treeLocation: "गांव के मंदिर के पास",
//       scheduledDate: "2024-01-15T10:00:00Z",
//       priority: "HIGH", // LOW, MEDIUM, HIGH, CRITICAL
//       status: "PENDING" // PENDING, IN_PROGRESS, COMPLETED, MISSED
//     }
//   ]
// }
```

### 2. Complete Inspection (निरीक्षण पूरा करें)
```javascript
const completeInspection = async (inspectionId, inspectionData) => {
  try {
    const response = await api.patch(`/inspections/${inspectionId}/complete`, inspectionData);
    return response.data;
  } catch (error) {
    console.error('Failed to complete inspection:', error);
    throw error;
  }
};

// Example usage:
const inspectionData = {
  treeStatus: "HEALTHY", // HEALTHY, WEAK, DISEASED, DEAD
  healthScore: 8, // 1-10 scale
  growthStage: "YOUNG", // SEEDLING, SAPLING, YOUNG, MATURE
  remarks: "पेड़ अच्छी तरह से बढ़ रहा है, पत्तियां हरी-भरी हैं",
  photos: [
    {
      url: "https://storage-url.com/inspection1.jpg",
      caption: "पेड़ का वर्तमान हाल"
    },
    {
      url: "https://storage-url.com/inspection2.jpg", 
      caption: "पत्तियों का close-up"
    }
  ],
  latitude: 32.0998,
  longitude: 76.2691,
  location: "GPS location confirmed"
};
```

### 3. Inspection History (निरीक्षण इतिहास)
```javascript
const getInspectionHistory = async (treeId) => {
  try {
    const response = await api.get(`/inspections/tree/${treeId}/history`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inspection history:', error);
    throw error;
  }
};
```

### 4. Inspection Component (React Component)
```jsx
// src/components/InspectionForm.jsx
import React, { useState } from 'react';
import { completeInspection } from '../services/inspectionService';

const InspectionForm = ({ inspection, onComplete }) => {
  const [formData, setFormData] = useState({
    treeStatus: '',
    healthScore: 5,
    growthStage: '',
    remarks: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await completeInspection(inspection.id, formData);
      onComplete();
    } catch (error) {
      alert('निरीक्षण पूरा करने में विफल: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inspection-form">
      <h3>पेड़ निरीक्षण - {inspection.treeLocation}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>पेड़ की स्थिति</label>
          <select 
            value={formData.treeStatus} 
            onChange={(e) => setFormData({...formData, treeStatus: e.target.value})}
            required
          >
            <option value="">चुनें</option>
            <option value="HEALTHY">स्वस्थ</option>
            <option value="WEAK">कमजोर</option>
            <option value="DISEASED">रोगग्रस्त</option>
            <option value="DEAD">मरा हुआ</option>
          </select>
        </div>

        <div className="form-group">
          <label>स्वास्थ्य स्कोर (1-10)</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={formData.healthScore}
            onChange={(e) => setFormData({...formData, healthScore: parseInt(e.target.value)})}
          />
          <span>{formData.healthScore}/10</span>
        </div>

        <div className="form-group">
          <label>विकास अवस्था</label>
          <select 
            value={formData.growthStage} 
            onChange={(e) => setFormData({...formData, growthStage: e.target.value})}
            required
          >
            <option value="">चुनें</option>
            <option value="SEEDLING">अंकुर</option>
            <option value="SAPLING">पौधा</option>
            <option value="YOUNG">युवा</option>
            <option value="MATURE">परिपक्व</option>
          </select>
        </div>

        <div className="form-group">
          <label>टिप्पणियां</label>
          <textarea 
            value={formData.remarks}
            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
            placeholder="पेड़ की स्थिति के बारे में विस्तृत जानकारी..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>फोटो अपलोड करें</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              // Handle photo upload to cloud storage
              const files = Array.from(e.target.files);
              // Upload to cloud and get URLs
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'सबमिट हो रहा है...' : 'निरीक्षण पूरा करें'}
        </button>
      </form>
    </div>
  );
};

export default InspectionForm;
```

---

## 🌱 Plantation Events Management (पौधारोपण कार्यक्रम प्रबंधन)

### 1. Create Plantation Event (नया पौधारोपण कार्यक्रम)
```javascript
const createPlantationEvent = async (eventData) => {
  try {
    const response = await api.post('/plantation-events', eventData);
    return response.data;
  } catch (error) {
    console.error('Failed to create plantation event:', error);
    throw error;
  }
};

// Example usage:
const newEvent = {
  title: "मानसून पौधारोपण अभियान",
  description: "बरसाती सीजन में 1000 पेड़ लगाने का अभियान",
  eventDate: "2024-07-15T06:00:00Z",
  location: "कांगड़ा जिला मुख्यालय",
  targetTrees: 1000,
  coordinatorId: "user_123",
  participants: ["user_456", "user_789"],
  plantTypes: ["plant_1", "plant_2"], // Plant type IDs
  status: "UPCOMING" // UPCOMING, ONGOING, COMPLETED, CANCELLED
};
```

### 2. Get Upcoming Events (आने वाले कार्यक्रम)
```javascript
const getUpcomingEvents = async () => {
  try {
    const response = await api.get('/plantation-events/upcoming');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error);
    throw error;
  }
};
```

### 3. Join Event (कार्यक्रम में भाग लें)
```javascript
const joinPlantationEvent = async (eventId) => {
  try {
    const response = await api.post(`/plantation-events/${eventId}/join`);
    return response.data;
  } catch (error) {
    console.error('Failed to join event:', error);
    throw error;
  }
};
```

### 4. Event Dashboard Component
```jsx
// src/components/PlantationEventDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getUpcomingEvents, joinPlantationEvent } from '../services/plantationService';

const PlantationEventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getUpcomingEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await joinPlantationEvent(eventId);
      alert('कार्यक्रम में सफलतापूर्वक शामिल हो गए!');
      fetchEvents(); // Refresh events
    } catch (error) {
      alert('कार्यक्रम में शामिल होने में विफल: ' + error.message);
    }
  };

  if (loading) return <div>लोड हो रहा है...</div>;

  return (
    <div className="events-dashboard">
      <h2>आने वाले पौधारोपण कार्यक्रम</h2>
      
      {events.length === 0 ? (
        <p>अभी कोई आने वाला कार्यक्रम नहीं है</p>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p><strong>तारीख:</strong> {new Date(event.eventDate).toLocaleDateString('hi-IN')}</p>
              <p><strong>स्थान:</strong> {event.location}</p>
              <p><strong>लक्ष्य:</strong> {event.targetTrees} पेड़</p>
              <p><strong>प्रतिभागी:</strong> {event.participants?.length || 0} लोग</p>
              
              <button 
                onClick={() => handleJoinEvent(event.id)}
                className="join-btn"
              >
                भाग लें
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantationEventDashboard;
```

---

## 📊 Real-time Tree Monitoring (रीयल-टाइम पेड़ मॉनिटरिंग)

### 1. Get Tree Statistics (पेड़ों के आंकड़े)
```javascript
const getTreeStatistics = async (filters = {}) => {
  try {
    const response = await api.get('/trees/statistics', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tree statistics:', error);
    throw error;
  }
};

// Response structure:
// {
//   success: true,
//   data: {
//     totalTrees: 5000,
//     healthyTrees: 4200,
//     weakTrees: 600,
//     deadTrees: 200,
//     survivalRate: 96.0,
//     growthDistribution: {
//       SEEDLING: 1000,
//       SAPLING: 2000,
//       YOUNG: 1500,
//       MATURE: 500
//     },
//     monthlyPlantation: [
//       { month: "Jan", count: 100 },
//       { month: "Feb", count: 150 }
//     ]
//   }
// }
```

### 2. Tree Map Data (मैप के लिए पेड़ों का डेटा)
```javascript
const getTreeMapData = async (bounds = null) => {
  try {
    const response = await api.get('/trees/map-data', {
      params: bounds ? {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west
      } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch map data:', error);
    throw error;
  }
};
```

### 3. Monitoring Dashboard Component
```jsx
// src/components/TreeMonitoringDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getTreeStatistics } from '../services/treeService';

const TreeMonitoringDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await getTreeStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>लोड हो रहा है...</div>;

  return (
    <div className="monitoring-dashboard">
      <h2>पेड़ मॉनिटरिंग डैशबोर्ड</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>कुल पेड़</h3>
          <p className="big-number">{stats?.totalTrees || 0}</p>
        </div>
        
        <div className="stat-card healthy">
          <h3>स्वस्थ पेड़</h3>
          <p className="big-number">{stats?.healthyTrees || 0}</p>
        </div>
        
        <div className="stat-card weak">
          <h3>कमजोर पेड़</h3>
          <p className="big-number">{stats?.weakTrees || 0}</p>
        </div>
        
        <div className="stat-card dead">
          <h3>मरे हुए पेड़</h3>
          <p className="big-number">{stats?.deadTrees || 0}</p>
        </div>
      </div>

      <div className="survival-rate">
        <h3>जीवित रहने की दर</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${stats?.survivalRate || 0}%` }}
          >
            {stats?.survivalRate || 0}%
          </div>
        </div>
      </div>

      <div className="growth-stages">
        <h3>विकास अवस्था वितरण</h3>
        {stats?.growthDistribution && Object.entries(stats.growthDistribution).map(([stage, count]) => (
          <div key={stage} className="stage-item">
            <span>{stage}</span>
            <span>{count} पेड़</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreeMonitoringDashboard;
```

---

## 📸 Photo-based Monitoring (फोटो-आधारित मॉनिटरिंग)

### 1. Upload Tree Photo (पेड़ की फोटो अपलोड करें)
```javascript
const uploadTreePhoto = async (treeId, photoData) => {
  try {
    const response = await api.post(`/trees/${treeId}/photos`, photoData);
    return response.data;
  } catch (error) {
    console.error('Failed to upload photo:', error);
    throw error;
  }
};

// Example usage:
const photoData = {
  url: "https://storage-url.com/tree-photo.jpg",
  caption: "3 महीने बाद पेड़ की ग्रोथ",
  takenAt: "2024-04-01T10:00:00Z",
  latitude: 32.0998,
  longitude: 76.2691
};
```

### 2. Get Tree Timeline (पेड़ का टाइमलाइन)
```javascript
const getTreeTimeline = async (treeId) => {
  try {
    const response = await api.get(`/trees/${treeId}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tree timeline:', error);
    throw error;
  }
};
```

### 3. Photo Timeline Component
```jsx
// src/components/TreeTimeline.jsx
import React, { useState, useEffect } from 'react';
import { getTreeTimeline } from '../services/treeService';

const TreeTimeline = ({ treeId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [treeId]);

  const fetchTimeline = async () => {
    try {
      const response = await getTreeTimeline(treeId);
      setTimeline(response.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>लोड हो रहा है...</div>;

  return (
    <div className="tree-timeline">
      <h3>पेड़ का टाइमलाइन</h3>
      
      {timeline.length === 0 ? (
        <p>अभी तक कोई फोटो नहीं अपलोड की गई</p>
      ) : (
        <div className="timeline-container">
          {timeline.map((item, index) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-date">
                {new Date(item.date).toLocaleDateString('hi-IN')}
              </div>
              
              {item.type === 'photo' ? (
                <div className="timeline-photo">
                  <img src={item.url} alt={item.caption} />
                  <p>{item.caption}</p>
                </div>
              ) : (
                <div className="timeline-event">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeTimeline;
```

---

## 🎨 CSS Styles (स्टाइलिंग के लिए)

```css
/* src/styles/new-features.css */

/* Inspection Form Styles */
.inspection-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

/* Events Dashboard */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.event-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.join-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.join-btn:hover {
  background: #229954;
}

/* Monitoring Dashboard */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card.healthy { border-left: 4px solid #27ae60; }
.stat-card.weak { border-left: 4px solid #f39c12; }
.stat-card.dead { border-left: 4px solid #e74c3c; }

.big-number {
  font-size: 2.5em;
  font-weight: bold;
  margin: 10px 0;
  color: #2c3e50;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #ecf0f1;
  border-radius: 15px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

/* Timeline */
.timeline-container {
  margin-top: 20px;
}

.timeline-item {
  display: flex;
  margin-bottom: 30px;
  align-items: flex-start;
}

.timeline-date {
  min-width: 120px;
  font-weight: bold;
  color: #7f8c8d;
}

.timeline-photo img {
  max-width: 300px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.timeline-event {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #3498db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .timeline-item {
    flex-direction: column;
  }
  
  .timeline-date {
    margin-bottom: 10px;
  }
}
```

---

## 🚀 Quick Implementation Checklist (त्वरित इम्प्लीमेंटेशन चेकलिस्ट)

### ✅ Inspection System
- [ ] Pending inspections list component
- [ ] Inspection form with photo upload
- [ ] Inspection history view
- [ ] GPS location capture
- [ ] Health score visualization

### ✅ Plantation Events  
- [ ] Upcoming events dashboard
- [ ] Event creation form (admin only)
- [ ] Join event functionality
- [ ] Event participants list
- [ ] Event statistics

### ✅ Tree Monitoring
- [ ] Real-time statistics dashboard
- [ ] Tree map integration
- [ ] Growth stage visualization
- [ ] Survival rate calculator
- [ ] Monthly plantation charts

### ✅ Photo Timeline
- [ ] Photo upload component
- [ ] Timeline view
- [ ] Photo gallery
- [ ] Time-lapse comparison
- [ ] Photo metadata display

---

## 📞 Backend Support (बैकएंड सपोर्ट)

### अगर कोई API काम नहीं कर रहा:
1. **Check API Base URL**: `http://localhost:5000/api/v1`
2. **Check Authentication**: Token properly attached?
3. **Check Network**: Backend server running?
4. **Check Payload**: Correct data format?

### Contact Backend Team:
- **API Issues**: Backend team ko tag करें Slack में
- **New Features**: Feature request डालें
- **Bug Reports**: Detailed error भेजें

---

**🌳 ये नए features implement करने के लिए complete guide है! कोई issue आए तो बताना! 🚀**
