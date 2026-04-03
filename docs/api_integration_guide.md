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
**5. Fetch All Users**
- **Method & Endpoint:** `GET /users`
- **Payload:** *None* (Supports query params like `?page=1&limit=10`)

**6. Create a New User**
- **Method & Endpoint:** `POST /users`
- **Payload:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@evergreen.com",
    "password": "Password123!",
    "roleId": "<ROLE_OBJECT_ID>" 
  }
  ```

**7. Get / Update / Delete User Details**
- **Get User:** `GET /users/:id`
- **Update User:** `PATCH /users/:id` 
  - **Payload:** `{ "firstName": "NewName" }`
- **Delete User:** `DELETE /users/:id`

### Phase 4: Roles & Permissions Hierarchy
**8. Fetch All Roles**
- **Method & Endpoint:** `GET /roles`
- **Payload:** *None*

**9. Create a Role**
- **Method & Endpoint:** `POST /roles`
- **Payload:**
  ```json
  {
    "name": "accountant",
    "description": "Manages fee and payments",
    "permissions": ["users:read", "fees:manage"]
  }
  ```

**10. Fetch Permissions List**
- **Method & Endpoint:** `GET /permissions`
- **Payload:** *None*

### Phase 5: Groups & Assignments
**11. Fetch All Groups**
- **Method & Endpoint:** `GET /groups`
- **Payload:** *None*

**12. Create a Group**
- **Method & Endpoint:** `POST /groups`
- **Payload:**
  ```json
  {
    "name": "Science Batch A",
    "description": "Core science students"
  }
  ```

**13. Manage Assignments**
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