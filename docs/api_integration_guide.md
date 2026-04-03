# Backend API Integration Guide 

## 1. Global Configuration & Authorization
- **Base URL:** `http://localhost:<PORT>/api/v1` (Update with deployed URL for production)
- **Universal Header:** All API requests (except Login/Register) must include the access token in the headers as shown below. You only need to set this up once globally in your Axios/Fetch instance:
  ```json
  {
    "Authorization": "Bearer <YOUR_ACCESS_TOKEN>",
    "Content-Type": "application/json"
  }
  ```
> **Note:** Access tokens expire in 15 minutes. Use the Refresh Token API to get a new token when it expires.

---

## 2. Default Credentials (For Testing)
To get started as the Super Admin, use these credentials:
- **Email:** `admin@evergreen.com`
- **Password:** `Admin123!@#`

---

## 3. Order of Implementation (API Endpoints & Payloads)

### Phase 1: Authentication
**1. Login API**
- **Method & Endpoint:** `POST /auth/login`
- **Payload:**
  ```json
  {
    "email": "admin@evergreen.com",
    "password": "Admin123!@#"
  }
  ```

**2. Refresh Token API** (Fire this when `accessToken` expires)
- **Method & Endpoint:** `POST /auth/refresh-tokens`
- **Payload:**
  ```json
  {
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }
  ```

**3. Logout API**
- **Method & Endpoint:** `POST /auth/logout`
- **Payload:**
  ```json
  {
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }
  ```

### Phase 2: Dashboard
**4. Dashboard Statistics** 
- **Method & Endpoint:** `GET /dashboard` *(or `/api/dashboard` depending on legacy routing/configuration)*
- **Payload:** *None* (Only requires the Authorization header)

### Phase 3: User Management
**5. Fetch All Users (with pagination and filters)**
- **Method & Endpoint:** `GET /users`
- **Query Params:** `?page=1&limit=10&role=teacher&isActive=true&search=John`
- **Payload:** *None*

**6. Create a New User**
- **Method & Endpoint:** `POST /users`
- **Payload:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@evergreen.com",
    "password": "Password123!",
    "userType": "ORG_ADMIN",
    "organizationId": "<ORG_OBJECT_ID>",
    "status": "ACTIVE"
  }
  ```

**7. Get Specific User Details**
- **Method & Endpoint:** `GET /users/:userId`
- **Payload:** *None*

**8. Update User**
- **Method & Endpoint:** `PUT /users/:userId` 
  - **Payload:** 
    ```json
    {
      "firstName": "NewName",
      "lastName": "Doe",
      "email": "john@evergreen.com",
      "status": "ACTIVE"
    }
    ```

**9. Soft Delete User**
- **Method & Endpoint:** `DELETE /users/:userId`
- **Payload:** *None*

**10. Toggle User Status**
- **Method & Endpoint:** `PATCH /users/:userId/status`
- **Payload:** 
  ```json
  {
    "status": "SUSPENDED"
  }
  ```

**11. Search Users**
- **Method & Endpoint:** `GET /users/search?q=john&limit=10`
- **Payload:** *None*

**12. User Statistics**
- **Method & Endpoint:** `GET /users/stats`
- **Payload:** *None*

### Phase 4: Roles & Permissions Hierarchy
**13. Fetch All Roles**
- **Method & Endpoint:** `GET /roles`
- **Payload:** *None*

**14. Create a Role**
- **Method & Endpoint:** `POST /roles`
- **Payload:**
  ```json
  {
    "name": "accountant",
    "description": "Manages fee and payments",
    "permissions": ["users:read", "fees:manage"]
  }
  ```

**15. Fetch Permissions List**
- **Method & Endpoint:** `GET /permissions`
- **Payload:** *None*

### Phase 5: Groups & Assignments
**16. Fetch All Groups**
- **Method & Endpoint:** `GET /groups`
- **Payload:** *None*

**17. Create a Group**
- **Method & Endpoint:** `POST /groups`
- **Payload:**
  ```json
  {
    "name": "Science Batch A",
    "description": "Core science students"
  }
  ```

**18. Manage Assignments**
- **Fetch Assignments:** `GET /assignments`
- **Create Assignment:** `POST /assignments`
  - **Payload:**
    ```json
    {
      "title": "Math Homework 1",
      "dueDate": "2026-04-10T00:00:00.000Z",
      "groupId": "<GROUP_ID>"
    }
    ```

### Phase 6: Organization Management
You will need Organizations to link Users (like `ORG_ADMIN`, `VOLUNTEER`) to a specific entity. Here are the endpoints the frontend will use to manage Organizations:

**19. Fetch All Organizations**
- **Method & Endpoint:** `GET /organizations`
- **Query Params:** `?page=1&limit=10&status=ACTIVE&type=NGO`
- **Payload:** *None*

**20. Create a New Organization**
- **Method & Endpoint:** `POST /organizations`
- **Payload:**
  ```json
  {
    "name": "Green Earth NGO",
    "slug": "green-earth-ngo",
    "organizationType": "NGO",
    "description": "Plantation drive organization",
    "contactEmail": "contact@greenearth.org",
    "contactPhone": "+1234567890",
    "address": "123 Green Avenue, NY",
    "status": "ACTIVE"
  }
  ```
  *(Note: `organizationType` must be one of `GOVERNMENT`, `NGO`, `SCHOOL`, or `CSR`)*

**21. Get Specific Organization Details**
- **Method & Endpoint:** `GET /organizations/:orgId`
- **Payload:** *None*

**22. Update Organization**
- **Method & Endpoint:** `PUT /organizations/:orgId`
  - **Payload:**
    ```json
    {
      "name": "Green Earth Updated",
      "contactEmail": "newemail@greenearth.org"
    }
    ```

**23. Toggle Organization Status**
- **Method & Endpoint:** `PATCH /organizations/:orgId/status`
- **Payload:**
  ```json
  {
    "status": "SUSPENDED"
  }
  ```