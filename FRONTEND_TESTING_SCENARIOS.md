# HP Evergreen - Frontend Testing Scenarios
## Complete Guide for QA Testers

---

## 1. Testing Environment Setup

### 1.1 Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend application running on `http://localhost:4200` or similar
- Test data populated in database
- Valid user credentials for all roles

### 1.2 Test Users Setup
```javascript
// Test User Credentials
const testUsers = {
  superAdmin: {
    email: "admin@evergreen.com",
    password: "Admin123!@#",
    role: "SUPER_ADMIN"
  },
  orgAdmin: {
    email: "orgadmin@test.com", 
    password: "Test123!@#",
    role: "ORG_ADMIN"
  },
  volunteer: {
    email: "volunteer@test.com",
    password: "Test123!@#", 
    role: "VOLUNTEER"
  },
  accountant: {
    email: "accountant@test.com",
    password: "Test123!@#",
    role: "accountant"
  },
  parent: {
    email: "parent@test.com",
    password: "Test123!@#",
    role: "parent"
  },
  student: {
    email: "student@test.com", 
    password: "Test123!@#",
    role: "student"
  }
};
```

---

## 2. Authentication Testing Scenarios

### 2.1 Login Functionality Testing

#### Test Case 1: Valid Login
**Objective**: Verify successful login with valid credentials
**Steps**:
1. Navigate to login page
2. Enter valid email and password
3. Click login button
4. Verify redirect to dashboard
5. Check JWT tokens in localStorage

**Expected Results**:
- User redirected to dashboard
- Access and refresh tokens stored
- User profile loaded
- No error messages

**Test Data**: Use any test user from above

---

#### Test Case 2: Invalid Login
**Objective**: Verify login failure with invalid credentials
**Steps**:
1. Navigate to login page
2. Enter invalid email/password
3. Click login button
4. Verify error message

**Expected Results**:
- Error message displayed
- No redirect occurs
- No tokens stored
- Form fields cleared

**Test Data**: 
```javascript
{
  email: "invalid@test.com",
  password: "wrongpassword"
}
```

---

#### Test Case 3: Token Refresh
**Objective**: Verify automatic token refresh
**Steps**:
1. Login successfully
2. Wait for access token to expire (or manually expire)
3. Make API call that requires authentication
4. Verify automatic refresh

**Expected Results**:
- New access token generated
- API call succeeds
- User session maintained
- No logout required

---

### 2.2 Logout Functionality Testing

#### Test Case 4: Successful Logout
**Objective**: Verify proper logout functionality
**Steps**:
1. Login successfully
2. Click logout button
3. Verify redirect to login page
4. Check localStorage cleared

**Expected Results**:
- Redirected to login page
- Tokens removed from localStorage
- User session ended
- Cannot access protected routes

---

## 3. User Management Testing Scenarios

### 3.1 User Creation Testing (Admin Only)

#### Test Case 5: Create New User
**Objective**: Verify admin can create new users
**Steps**:
1. Login as SUPER_ADMIN or ORG_ADMIN
2. Navigate to user management
3. Click "Create User"
4. Fill user form with valid data
5. Submit form

**Expected Results**:
- User created successfully
- Success message displayed
- User appears in user list
- Email notification sent (if configured)

**Test Data**:
```javascript
{
  firstName: "Test",
  lastName: "User",
  email: "newuser@test.com",
  password: "Test123!@#",
  role: "VOLUNTEER",
  organizationId: "valid_org_id"
}
```

---

#### Test Case 6: User Validation Testing
**Objective**: Verify form validation for user creation
**Steps**:
1. Login as admin
2. Navigate to create user
3. Submit form with invalid data
4. Check validation messages

**Test Cases**:
- Invalid email format
- Password too short
- Missing required fields
- Duplicate email

**Expected Results**:
- Appropriate error messages
- Form not submitted
- Fields highlighted with errors

---

### 3.2 User List and Search Testing

#### Test Case 7: User List Display
**Objective**: Verify user list loads correctly
**Steps**:
1. Login as admin
2. Navigate to user management
3. Verify user list displays
4. Check pagination
5. Verify user details

**Expected Results**:
- All users displayed according to permissions
- Pagination works
- User details accurate
- Loading states handled

---

#### Test Case 8: User Search Functionality
**Objective**: Verify user search works correctly
**Steps**:
1. Login as admin
2. Navigate to user management
3. Enter search query
4. Verify filtered results
5. Test different search terms

**Expected Results**:
- Search returns relevant users
- Case-insensitive search
- Search by name and email
- Clear search functionality

---

## 4. Organization Management Testing

### 4.1 Organization CRUD Testing

#### Test Case 9: Create Organization
**Objective**: Verify organization creation
**Steps**:
1. Login as SUPER_ADMIN
2. Navigate to organizations
3. Click "Create Organization"
4. Fill organization details
5. Submit form

**Expected Results**:
- Organization created successfully
- Appears in organization list
- Details correctly saved

**Test Data**:
```javascript
{
  name: "Test School",
  type: "SCHOOL",
  address: "123 Test Street",
  contactPerson: "Test Contact",
  contactEmail: "contact@test.com",
  contactPhone: "+1234567890"
}
```

---

#### Test Case 10: Organization Status Toggle
**Objective**: Verify organization status management
**Steps**:
1. Login as SUPER_ADMIN
2. Navigate to organizations
3. Click status toggle for an organization
4. Verify status change

**Expected Results**:
- Status toggles between active/inactive
- UI updates immediately
- Status persists after refresh

---

## 5. Assignment Management Testing

### 5.1 Assignment Creation Testing

#### Test Case 11: Create Assignment (Fixed Issue)
**Objective**: Verify assignment creation works with auto organizationId
**Steps**:
1. Login as any authenticated user
2. Navigate to assignments
3. Click "Create Assignment"
4. Fill assignment details
5. Submit form

**Expected Results**:
- Assignment created successfully
- OrganizationId auto-populated
- No validation errors
- Assignment appears in list

**Test Data**:
```javascript
{
  groupId: "valid_group_id",
  targetPlants: 50,
  landArea: 100,
  species: ["pine", "oak"],
  assignedOfficer: "valid_user_id"
  // organizationId will be auto-added
}
```

---

#### Test Case 12: Assignment Validation Testing
**Objective**: Verify assignment form validation
**Steps**:
1. Navigate to create assignment
2. Submit form with invalid data
3. Check validation messages

**Test Cases**:
- Missing required fields
- Invalid numbers
- Invalid ObjectId references

**Expected Results**:
- Proper validation errors
- Form not submitted
- Clear error messages

---

### 5.2 Assignment List and Filtering

#### Test Case 13: Assignment List Display
**Objective**: Verify assignment list loads correctly
**Steps**:
1. Login as authenticated user
2. Navigate to assignments
3. Verify list displays
4. Check data population

**Expected Results**:
- Assignments displayed according to user permissions
- Group details populated
- Officer details populated
- Organization details populated

---

## 6. Dashboard Testing Scenarios

### 6.1 Dashboard Data Loading

#### Test Case 14: Dashboard Statistics
**Objective**: Verify dashboard loads correct statistics
**Steps**:
1. Login as any user
2. Navigate to dashboard
3. Verify all statistics load
4. Check data accuracy

**Expected Results**:
- User statistics displayed
- Assignment statistics shown
- Tree/plant statistics visible
- No loading errors

---

#### Test Case 15: Dashboard Permissions
**Objective**: Verify dashboard shows role-appropriate data
**Steps**:
1. Test with different user roles
2. Verify data visibility
3. Check permission-based access

**Expected Results**:
- SUPER_ADMIN sees all data
- ORG_ADMIN sees organization data
- Other users see limited data
- No unauthorized data access

---

## 7. Profile Management Testing

### 7.1 Profile Viewing and Editing

#### Test Case 16: View Profile
**Objective**: Verify profile viewing works
**Steps**:
1. Login as any user
2. Navigate to profile
3. Verify profile data
4. Check all fields

**Expected Results**:
- Profile data accurate
- All fields populated
- No sensitive data exposed
- Proper formatting

---

#### Test Case 17: Update Profile
**Objective**: Verify profile update functionality
**Steps**:
1. Navigate to profile
2. Edit profile fields
3. Submit changes
4. Verify updates

**Expected Results**:
- Profile updated successfully
- Changes reflected immediately
- Validation works
- Success message shown

---

#### Test Case 18: Change Password
**Objective**: Verify password change functionality
**Steps**:
1. Navigate to profile/change password
2. Enter current and new password
3. Submit form
4. Verify password change

**Expected Results**:
- Password changed successfully
- Can login with new password
- Old password no longer works
- Security validation passes

---

## 8. Error Handling Testing

### 8.1 Network Error Handling

#### Test Case 19: Network Disconnection
**Objective**: Verify app handles network errors
**Steps**:
1. Disconnect network
2. Try to perform actions
3. Verify error messages
4. Reconnect network

**Expected Results**:
- Graceful error messages
- No app crashes
- Retry mechanisms work
- Data preserved

---

#### Test Case 20: Server Error Handling
**Objective**: Verify 500 error handling
**Steps**:
1. Trigger server error (if possible)
2. Verify error display
3. Check app stability

**Expected Results**:
- User-friendly error messages
- App remains functional
- Error logging occurs
- Recovery options available

---

## 9. Performance Testing

### 9.1 Loading Performance

#### Test Case 21: Page Load Times
**Objective**: Verify acceptable loading times
**Steps**:
1. Navigate to different pages
2. Measure load times
3. Check performance metrics

**Expected Results**:
- Pages load within 3 seconds
- Smooth transitions
- No blocking operations
- Optimized rendering

---

#### Test Case 22: Large Data Handling
**Objective**: Verify app handles large datasets
**Steps**:
1. Load pages with many records
2. Test pagination
3. Check filtering performance

**Expected Results**:
- Pagination works efficiently
- Search performs well
- No memory leaks
- Smooth scrolling

---

## 10. Security Testing

### 10.1 Authentication Security

#### Test Case 23: Session Management
**Objective**: Verify secure session handling
**Steps**:
1. Login successfully
2. Try to access protected routes without token
3. Test token expiration
4. Verify logout security

**Expected Results**:
- Protected routes blocked without auth
- Token expiration enforced
- Logout clears all session data
- No token leakage

---

#### Test Case 24: Authorization Testing
**Objective**: Verify role-based access control
**Steps**:
1. Test with different user roles
2. Try to access unauthorized endpoints
3. Verify permission checks

**Expected Results**:
- Unauthorized access blocked
- Proper error messages
- No privilege escalation
- Secure data isolation

---

## 11. Mobile Responsiveness Testing

### 11.1 Responsive Design

#### Test Case 25: Mobile View Testing
**Objective**: Verify mobile responsiveness
**Steps**:
1. Open app on mobile device/emulator
2. Test all major features
3. Check navigation
4. Verify form usability

**Expected Results**:
- Responsive layout works
- Touch interactions work
- Navigation is mobile-friendly
- Forms are usable on mobile

---

#### Test Case 26: Tablet View Testing
**Objective**: Verify tablet layout
**Steps**:
1. Test on tablet device/emulator
2. Verify layout adaptation
3. Check feature accessibility

**Expected Results**:
- Optimized tablet layout
- Efficient use of space
- Touch-friendly interface
- Full functionality available

---

## 12. Integration Testing

### 12.1 Cross-Browser Testing

#### Test Case 27: Browser Compatibility
**Objective**: Verify cross-browser compatibility
**Steps**:
1. Test in Chrome, Firefox, Safari, Edge
2. Verify all features work
3. Check UI consistency

**Expected Results**:
- Consistent behavior across browsers
- UI renders correctly
- No browser-specific bugs
- Performance acceptable

---

## 13. Test Data Management

### 13.1 Test Data Setup

#### Required Test Data:
```javascript
// Organizations
const organizations = [
  { name: "Test School 1", type: "SCHOOL" },
  { name: "Test NGO 1", type: "NGO" },
  { name: "Test Panchayat 1", type: "PANCHAYAT" }
];

// Groups
const groups = [
  { groupName: "Garden Team 1", village: "Test Village" },
  { groupName: "Plantation Team 1", village: "Test Village" }
];

// Users for each role
const users = [
  // SUPER_ADMIN (already exists)
  // ORG_ADMIN, VOLUNTEER, etc. (create during testing)
];
```

---

## 14. Test Execution Checklist

### 14.1 Pre-Test Checklist
- [ ] Backend server running
- [ ] Frontend application running
- [ ] Test data populated
- [ ] Test credentials ready
- [ ] Browser dev tools open

### 14.2 Post-Test Checklist
- [ ] All test cases executed
- [ ] Bugs documented
- [ ] Test results recorded
- [ ] Performance metrics collected
- [ ] Security issues identified

---

## 15. Bug Reporting Template

### Bug Report Format:
```markdown
## Bug Report
**Test Case**: [Test Case Number]
**Severity**: [Critical/High/Medium/Low]
**Environment**: [Browser, Device, OS]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [Attach if applicable]
**Additional Notes**: [Any other relevant information]
```

---

## 16. Success Criteria

### 16.1 Functional Requirements
- [ ] All authentication flows work
- [ ] User management complete
- [ ] Organization management functional
- [ ] Assignment system working
- [ ] Dashboard displays correct data

### 16.2 Non-Functional Requirements
- [ ] Performance acceptable (<3s load times)
- [ ] Security measures implemented
- [ ] Mobile responsive design
- [ ] Cross-browser compatible
- [ ] Error handling robust

---

**Testing Timeline**: 2-3 days for comprehensive testing
**Priority Order**: Authentication > User Management > Assignments > Dashboard > Others

This comprehensive testing guide covers all aspects of the HP Evergreen frontend application. Testers should follow these scenarios systematically to ensure a high-quality, production-ready application!
