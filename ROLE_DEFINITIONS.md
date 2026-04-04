# Role Definitions & Uniformity Guide

Yeh document backend aur frontend dono jagah **roles** ki uniformity ensure karta hai. Sab jagah same casing aur naming use karo taaki confusion na ho.

## Backend Role Definitions (User Model)
Backend mein `userType` field mein ye roles hain (case-sensitive, uppercase):

```javascript
userType: {
  type: String,
  enum: {
    values: ["SUPER_ADMIN", "ORG_ADMIN", "VOLUNTEER", "CITIZEN"],
    message: '{VALUE} is not a valid user type'
  },
  default: "CITIZEN"
}
```

## Frontend Role Constants
Frontend mein bhi same roles use karo (JavaScript/React mein):

```javascript
// constants/roles.js
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  VOLUNTEER: 'VOLUNTEER',
  CITIZEN: 'CITIZEN'
};
```

## Role Permissions & Access Levels

### SUPER_ADMIN
- **Access:** System ke saare data, saari organizations, global groups, saari assignments.
- **Can Create:** Global groups, organizations, users of any type.
- **Cannot:** Kuch nahi (full access).
- **Frontend UI:** Admin dashboard with all tabs visible.

### ORG_ADMIN
- **Access:** Sirf apni organization ke data (groups, assignments, trees, events).
- **Can Create:** Apni org ke andar groups, assignments, events.
- **Cannot:** Global groups edit/delete, doosri org ke data access.
- **Frontend UI:** Organization-specific dashboard.

### VOLUNTEER
- **Access:** Apne assigned groups ke data, apne planted trees.
- **Can Create:** Trees (with geo-tagging), participate in events.
- **Cannot:** Groups create, assignments create, admin features.
- **Frontend UI:** Mobile app with planting interface, progress tracking.

### CITIZEN
- **Access:** Public data (global groups, public events), apne planted trees agar registered hain.
- **Can Create:** Trees agar allowed hai, events participate.
- **Cannot:** Admin features, groups create.
- **Frontend UI:** Citizen app with limited features.

## Important Notes for Uniformity
1. **Always use uppercase:** `SUPER_ADMIN`, not `superadmin` or `SuperAdmin`.
2. **Backend checks:** Sab jagah `req.user.userType === 'SUPER_ADMIN'` use karo.
3. **Frontend storage:** JWT token mein `userType` field ko same case mein store karo.
4. **API Responses:** User object mein `userType` field ko same case mein return karo.
5. **Database:** MongoDB mein enum values uppercase hain, change mat karo.

## Frontend Implementation Tips
```javascript
// Check role in React component
import { USER_ROLES } from './constants/roles';

const isSuperAdmin = user.userType === USER_ROLES.SUPER_ADMIN;
const isOrgAdmin = user.userType === USER_ROLES.ORG_ADMIN;

// Conditional rendering
{isSuperAdmin && <AdminPanel />}
{isOrgAdmin && <OrgDashboard />}
```

Isse backend aur frontend dono jagah consistency rahegi aur confusion nahi hogi.