# TrackU - Complete Project Documentation
## Club Management & Member Tracking Platform

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Models](#database-models)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Structure](#api-structure)
7. [Key Features](#key-features)
8. [User Roles & Permissions](#user-roles--permissions)
9. [User Flow](#user-flow)
10. [Pages & Components](#pages--components)
11. [Business Logic](#business-logic)
12. [Unique Aspects](#unique-aspects)

---

## 🎯 Project Overview

### What is TrackU?
TrackU is a **full-stack web application** that enables club leaders and administrators to efficiently manage their clubs, track member attendance, monitor member contributions (points/hours), and maintain detailed activity records. It's designed for sports clubs, hobby groups, volunteer organizations, and professional networks.

### Problem It Solves
- **Manual tracking**: Eliminates spreadsheet-based member tracking
- **Lack of transparency**: Members can see their contributions and achievements
- **No accountability**: Creates clear records of who did what and when
- **Scalability issues**: Supports clubs of any size
- **Access control**: Multi-level approval system for security
 
### Core Value Proposition
- Centralized member database
- Real-time activity tracking
- Secure token-based authentication
- Role-based access control (Admin, Club Leader)
- Comprehensive reporting and analytics

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.0.10 (React 19.2.1)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.35.0
- **3D Graphics**: Spline (@splinetool/react-spline 4.1.0)

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **Database**: MongoDB 
- **ORM**: Mongoose 9.0.1

### Security
- **Authentication**: JWT (JSON Web Tokens) with jsonwebtoken 9.0.3
- **Password Hashing**: bcryptjs 3.0.3
- **JWT Library**: jose 6.1.3

### Development Tools
- **Linting**: ESLint 9
- **Build Tool**: Next.js built-in bundler
- **Type Checking**: TypeScript with strict mode

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages: Login, Register, Dashboard, Admin Panel  │  │
│  │  Components: Forms, Tables, Charts, Animations   │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────────┐
│            API Layer (Next.js API Routes)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ /api/auth/* (Login, Register, Logout)            │  │
│  │ /api/admin/* (User/Club/Attendance Management)   │  │
│  │ /api/club/* (Club Operations)                    │  │
│  │ /api/attendance/* (Attendance Tracking)          │  │
│  │ /api/team-members/* (Member Management)         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────────────────┐
│           Database Layer (MongoDB)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Collections: Users, Clubs, Attendance, Members   │  │
│  │ Supporting: AccessRequests, Settings, MemberFiles│  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Request/Response Flow

```
1. User fills form (Login/Register)
   ↓
2. Frontend validates & sends POST request
   ↓
3. API Route receives request
   ↓
4. Database connection established (cached)
   ↓
5. Authenticate user or create user record
   ↓
6. Generate JWT token
   ↓
7. Return token & user data to frontend
   ↓
8. Frontend stores token (localStorage/cookie)
   ↓
9. Subsequent requests include token in Authorization header
   ↓
10. Middleware verifies token before processing
```

---

## 💾 Database Models

### 1. **User Model**
Represents registered users (Admin, Club Leaders, Regular Members)

```typescript
{
  username: String (required),
  email: String (required, unique),
  phone: String (optional),
  password: String (hashed, required),
  club: ObjectId (reference to Club),
  isClubLeader: Boolean (default: false),
  isApproved: Boolean (default: false), // Requires admin approval
  timestamps: { createdAt, updatedAt }
}
```

**Key Points**:
- Only club leaders can register directly, others require admin approval
- Phone number must be 10 digits in Indian format (first digit ≥ 6)
- Passwords are hashed using bcryptjs with salt rounds = 10
- Each user can be assigned to one club

---

### 2. **Club Model**
Represents a club or team

```typescript
{
  name: String (required),
  description: String (optional),
  imageUrl: String (optional),
  leader: ObjectId (reference to User, required),
  members: [ObjectId] (array of member references),
  timestamps: { createdAt, updatedAt }
}
```

**Key Points**:
- Each club has one leader
- Members is an array of User IDs
- Stores club metadata and branding

---

### 3. **TeamMember Model**
Tracks individual member data within a club (distinct from User model)

```typescript
{
  name: String (required),
  enrollmentNumber: String (required),
  position: String (optional),
  memberFile: ObjectId (reference to MemberFile),
  
  // Performance metrics
  points: Number (default: 0),
  hours: Number (default: 0),
  
  // Comments on member
  remarks: [
    {
      text: String,
      date: Date (default: now)
    }
  ],
  
  // Audit trail
  updateHistory: [
    {
      points: Number,
      hours: Number,
      remark: String,
      date: Date (required),
      addedBy: ObjectId (reference to User),
      addedAt: Date (default: now)
    }
  ],
  
  createdBy: ObjectId (reference to User, required),
  lastUpdatedBy: ObjectId (reference to User),
  club: ObjectId (reference to Club, required),
  timestamps: { createdAt, updatedAt }
}
```

**Key Points**:
- Separate from User model - represents member profiles
- Tracks contribution metrics (points and hours)
- Full audit trail of all updates with who and when
- Supports progression tracking over time

---

### 4. **Attendance Model**
Records meeting/event attendance

```typescript
{
  meetingTitle: String (required),
  meetingDate: Date (required),
  meetingType: Enum ["regular", "special", "emergency", "workshop"],
  duration: Number (in minutes, default: 60),
  location: String (optional),
  description: String (optional),
  
  attendees: [
    {
      memberId: ObjectId (reference to TeamMember),
      memberName: String,
      enrollmentNumber: String,
      status: Enum ["present", "absent", "late"],
      checkInTime: Date,
      remarks: String
    }
  ],
  
  createdBy: ObjectId (reference to User),
  lastUpdatedBy: ObjectId (reference to User),
  club: ObjectId (reference to Club, required),
  timestamps: { createdAt, updatedAt }
}
```

**Key Points**:
- Bulk attendance recording for meetings
- Flexible meeting types for different event categories
- Individual-level attendance status tracking
- Full audit with creation and update metadata

---

### 5. **AccessRequest Model**
Workflow for user approval process

```typescript
{
  user: ObjectId (reference to User, required),
  username: String,
  email: String,
  phone: String,
  requestMessage: String,
  
  status: Enum ["pending", "approved", "rejected"],
  
  reviewedBy: ObjectId (reference to User),
  reviewedAt: Date,
  rejectionReason: String,
  
  timestamps: { createdAt, updatedAt }
}
```

**Key Points**:
- Created automatically when unapproved user tries to login
- Admins review and either approve or reject
- Tracks who reviewed and when
- Stores rejection reason for feedback

---

### 6. **MemberFile Model**
Template/reference for member information

```typescript
{
  name: String (required),
  enrollmentNumber: String (required),
  position: String (optional),
  createdBy: ObjectId (reference to User, required),
  timestamps: { createdAt, updatedAt }
}
```

**Key Points**:
- Acts as a template for creating team members
- Can be reused across multiple clubs
- Lightweight reference data

---

### 7. **Settings Model**
System-wide configuration

```typescript
{
  maintenanceMode: Boolean,
  allowNewRegistrations: Boolean
}
```

**Key Points**:
- Controls application state
- Can disable registrations site-wide
- Enables maintenance without shutting down the service

---

## 🔐 Authentication & Authorization

### Authentication Flow

#### 1. **Registration (Club Leaders Only)**
```
POST /api/auth/register
├─ Validates: username, email, password, phone (optional)
├─ Checks: email uniqueness, phone format (Indian)
├─ Checks: maintenance mode, registration disabled
├─ Hash password with bcryptjs (10 salt rounds)
├─ Create User with isApproved = false
├─ Create AccessRequest for admin review
└─ Return success message (user awaiting approval)
```

**Important**: Only club leaders can register. Regular members must be added by club leaders.

#### 2. **Login**
```
POST /api/auth/login
├─ Validate email & password present
├─ Check maintenance mode (except for admin)
├─ Find user by email
├─ Compare hashed password with bcryptjs
├─ Check if user is admin (email match with ADMIN_EMAIL env var)
├─ If not admin, check if user is approved:
│  └─ If not approved:
│     ├─ Create AccessRequest if doesn't exist
│     └─ Return "pending_approval" status
├─ Generate JWT token:
│  ├─ Payload: { userId, username }
│  ├─ Secret: process.env.JWT_SECRET
│  └─ ExpiresIn: 7 days
└─ Return token + user metadata (isAdmin, isClubLeader)
```

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string,          // MongoDB ObjectId
  username: string,        // User's chosen username
  iat: number,            // Issued at (timestamp)
  exp: number             // Expiration (7 days from issue)
}
```

### Authorization System

#### Admin Check
```typescript
function isAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return email.toLowerCase() === adminEmail.toLowerCase();
}
```
- Admin status determined by exact email match
- Admins bypass approval requirements
- Admins can access all management endpoints

#### Role-Based Access
```
┌─────────────────┬──────────────────┬─────────────────┐
│    Role         │  Can Do           │  Cannot Do      │
├─────────────────┼──────────────────┼─────────────────┤
│ Admin           │ All operations    │ Nothing         │
├─────────────────┼──────────────────┼─────────────────┤
│ Club Leader     │ Manage own club   │ Access other    │
│                 │ Add/update members│ clubs or admin  │
│                 │ Track attendance  │ panel          │
├─────────────────┼──────────────────┼─────────────────┤
```

### Security Features

1. **Password Security**
   - Hashed with bcryptjs (industry standard)
   - Salt rounds: 10 (computationally expensive)
   - Passwords never stored in plain text

2. **Token Security**
   - JWT with secret key from environment variable
   - 7-day expiration (reasonable time window)
   - Verified on each protected request

3. **Database Connection**
   - Cached globally to prevent connection leaks
   - TLS certificate validation enabled
   - Proper error handling for connection failures

4. **Approval Workflow**
   - New club leaders require admin approval before access
   - Prevents unauthorized access
   - Automatic AccessRequest creation

---

## 🔌 API Structure

### Base URL
```
http://localhost:3000/api
```

### API Endpoints Overview

#### **Authentication Routes** (`/api/auth/*`)
```
POST /auth/login
├─ Body: { email, password }
└─ Returns: { token, userId, username, isAdmin, isClubLeader, isApproved }

POST /auth/register
├─ Body: { username, email, password, phone?, isClubLeader, clubName?, clubDescription? }
└─ Returns: { message, userId } (awaiting approval)

POST /auth/logout
└─ Clears session

POST /auth/assign-club
├─ Body: { clubId }
└─ Returns: { message, club }
```

#### **Admin Routes** (`/api/admin/*`)
```
GET/POST /admin/access-requests
├─ List pending user approvals
└─ Approve/reject access requests

POST /admin/access-requests/[id]/approve
POST /admin/access-requests/[id]/reject

GET /admin/users
GET /admin/users/[id]
POST /admin/users
PUT /admin/users/[id]
DELETE /admin/users/[id]

GET /admin/clubs
GET /admin/clubs/[id]
POST /admin/clubs
PUT /admin/clubs/[id]

GET /admin/attendance
GET /admin/attendance-diagnostic
POST /admin/assign-attendance-to-club
POST /admin/migrate-attendance

GET /admin/activity
GET /admin/stats
GET /admin/settings
PUT /admin/settings
```

#### **Club Routes** (`/api/club/*`)
```
GET /club
GET /club/[id]
POST /club

GET /club/[id]/members
POST /club/[id]/members

GET /club/active-members
```

#### **Team Member Routes** (`/api/team-members/*`)
```
GET /team-members
POST /team-members
GET /team-members/[id]
PUT /team-members/[id]
DELETE /team-members/[id]

GET /team-members/[id]/activity
```

#### **Attendance Routes** (`/api/attendance/*`)
```
GET /attendance
POST /attendance

GET /attendance/[id]
PUT /attendance/[id]
DELETE /attendance/[id]
```

#### **Utility Routes**
```
GET /ping                    # Health check
GET /clubs                   # List all clubs
GET /leaders/active          # Active club leaders
```

---

## ✨ Key Features

### 1. **Dashboard Overview**
- **Real-time statistics**: Total members, attendance rate, contribution metrics
- **Member list**: Quick view of all team members
- **Activity feed**: Recent updates and changes
- **Performance indicators**: Visual representation of team metrics

### 2. **Team Member Management**
- **Add new members**: Simple form to add members to club
- **Member profiles**: Store name, enrollment number, position
- **Update contributions**: Record points and hours
- **Remarks/comments**: Add notes about member performance
- **Update history**: Complete audit trail of all changes

### 3. **Attendance Tracking**
- **Bulk attendance**: Record attendance for entire meeting
- **Multiple status options**: Present, Absent, Late
- **Meeting details**: Title, date, type, duration, location
- **Attendance remarks**: Individual notes for each attendee
- **Check-in time tracking**: Record when members arrived

### 4. **Activity History**
- **Complete audit trail**: Who changed what and when
- **Points/hours tracking**: Historical changes to contributions
- **Remarks log**: All comments and notes on members
- **Creator tracking**: Identifies who made each update

### 5. **Role-Based Access Control**
- **Admin panel**: Full system management
- **Club leader dashboard**: Manage specific club
- **Member view**: See personal statistics
- **Access requests workflow**: Controlled user onboarding

### 6. **Secure Authentication**
- **JWT tokens**: Secure, stateless authentication
- **Email verification**: Pending approval system
- **Session management**: 7-day token expiration
- **Password protection**: Bcryptjs hashing

### 7. **Settings & Maintenance**
- **Maintenance mode**: Pause application without downtime
- **Registration control**: Enable/disable new registrations
- **Global settings**: System-wide configurations

---

## 👥 User Roles & Permissions

### Admin
- **What**: Has complete control over the system
- **Email-based**: Identified by ADMIN_EMAIL environment variable
- **Can**:
  - Approve/reject user access requests
  - Manage all users (create, read, update, delete)
  - Manage all clubs
  - View all attendance records
  - Access analytics and statistics
  - Modify system settings
  - Toggle maintenance mode
- **Bypass**: Admin approval requirement, maintenance mode

### Club Leader
- **What**: Person who created the club
- **Status**: `isClubLeader = true, isApproved = true`
- **Can**:
  - Create and manage club
  - Add/remove members
  - Update member contributions (points, hours)
  - Record attendance
  - View club statistics
  - Add remarks to members
- **Cannot**:
  - Access other clubs
  - Approve other users
  - Modify system settings

### Regular Member
- **What**: Registered user approved by admin
- **Status**: `isClubLeader = false, isApproved = true`
- **Can**:
  - View own dashboard
  - See personal contributions
  - View club member list
  - See team statistics
- **Cannot**:
  - Add members
  - Record attendance
  - Modify any records
  - Access admin panel

### Unapproved User
- **What**: Registered but not yet approved
- **Status**: `isApproved = false`
- **Can**:
  - Login (redirected to pending page)
  - View pending approval message
- **Cannot**:
  - Access any other features
  - View dashboard
  - Make changes

---

## 🔄 User Flow

### New Club Leader Registration Flow

```
1. User visits Register page
   ↓
2. Fills registration form:
   - Username
   - Email
   - Password
   - Phone (optional)
   - Club Name
   - Club Description
   ↓
3. System validates:
   - Check email not in use
   - Check phone format (if provided)
   - Check registrations allowed (not in maintenance)
   ↓
4. Password hashed with bcryptjs
   ↓
5. User record created with:
   - isClubLeader = true
   - isApproved = false
   ↓
6. Club created with this user as leader
   ↓
7. AccessRequest created for admin review
   ↓
8. User sees: "Your registration is pending admin approval"
   ↓
9. Admin reviews access request
   ↓
10. Admin approves → isApproved = true
    OR rejects → AccessRequest marked rejected
    ↓
11. User can now login and access dashboard
```

### Existing Club Leader Adding Member Flow

```
1. Club leader goes to Club Members page
   ↓
2. Clicks "Add Member"
   ↓
3. Fills member details:
   - Name
   - Enrollment Number
   - Position (optional)
   ↓
4. System creates TeamMember record:
   - Points = 0
   - Hours = 0
   - Empty remarks/updateHistory
   ↓
5. Member appears in club member list
   ↓
6. Leader can now track this member's contributions
```

### Recording Attendance Flow

```
1. Club leader goes to Attendance page
   ↓
2. Creates new attendance record:
   - Meeting title
   - Meeting date
   - Meeting type (regular/special/emergency/workshop)
   - Duration
   - Location
   ↓
3. Adds attendees:
   - Select members from club
   - Mark status (present/absent/late)
   - Optional check-in time
   - Optional remarks
   ↓
4. System saves with:
   - createdBy = current user
   - club = user's club
   - Full attendee details
   ↓
5. Attendance record viewable in:
   - Attendance list
   - Member's activity history
   - Club statistics
```

### Updating Member Contribution Flow

```
1. Club leader selects member
   ↓
2. Clicks "Update Contribution"
   ↓
3. Enters:
   - Points to add
   - Hours to add
   - Remark (optional)
   ↓
4. System:
   - Updates TeamMember.points and .hours
   - Adds entry to updateHistory with:
     * New points/hours values
     * Remark
     * Current date
     * addedBy = current user
   - Updates lastUpdatedBy
   ↓
5. Member's contribution updated with full audit trail
   ↓
6. Accessible in member profile and activity history
```

---

## 📄 Pages & Components

### Frontend Structure

#### **Public Pages**
```
/                    → Home page (landing)
/login               → User login
/register            → Club leader registration
/about               → About TrackU
/features            → Feature showcase
/pricing             → Pricing plans
/contact             → Contact form
/privacy             → Privacy policy
/terms               → Terms of service
/security            → Security information
```

#### **Protected Pages (Require Login)**
```
/dashboard           → Main dashboard (stats overview)
/attendance          → View/record attendance
/pending             → Approval pending page
/maintenance         → Maintenance mode page
```

#### **Admin Pages**
```
/admin               → Admin dashboard
/admin/users         → Manage users
/admin/clubs         → Manage clubs
/admin/attendance    → Manage attendance records
/admin/access-requests → Review user approvals
/admin/activity      → System activity log
/admin/settings      → System settings
```

#### **Club Leader Pages**
```
/dashboard (club context)
  → View club statistics
  → Manage team members
  → Record attendance
  → Track contributions
```

### Key Components

```tsx
// UI Components
<Card />              → Basic card container
<ShootingStars />     → Animated background effect
<SplineScene />       → 3D Spline visualization
<Spotlight />         → Spotlight animation effect

// Form Components
<LoginForm />
<RegisterForm />
<MemberRegistrationForm />
<AttendanceForm />

// Data Components
<MemberList />
<AttendanceTable />
<StatisticsPanel />
<ActivityFeed />
```

---

## 🧠 Business Logic

### Core Algorithms & Logic

#### 1. **Authentication Logic**
```typescript
function login(email, password) {
  // Check if admin (before approval check)
  if (isAdmin(email)) {
    // Grant access immediately
    generateToken(user);
  } else if (!user.isApproved) {
    // Check and create access request
    createOrFindAccessRequest(user);
    return "pending_approval";
  } else {
    // Regular approved user
    generateToken(user);
  }
}
```

**Key Decision**: Admin bypass + automatic AccessRequest creation on first unapproved login 

#### 2. **Member Contribution Tracking**
```typescript
function updateMemberContribution(memberId, points, hours, remark) {
  // Get current member
  const member = await TeamMember.findById(memberId);
  
  // Calculate new totals (cumulative)
  member.points += points;
  member.hours += hours;
  
  // Record this update in history
  member.updateHistory.push({
    points: member.points,      // New total
    hours: member.hours,        // New total
    remark: remark,
    date: now(),
    addedBy: currentUser
  });
  
  // Update metadata
  member.lastUpdatedBy = currentUser;
  member.updatedAt = now();
  
  await member.save();
}
```

**Key Points**: 
- Cumulative tracking (add to existing)
- Full history of all changes
- Audit trail with user attribution
- Timestamp for each change

#### 3. **Attendance Recording**
```typescript
function recordAttendance(meetingData, attendees) {
  // Create attendance record
  const attendance = new Attendance({
    meetingTitle,
    meetingDate,
    meetingType,
    duration,
    location,
    description,
    attendees: attendees.map(a => ({
      memberId: a.id,
      memberName: a.name,
      enrollmentNumber: a.enrollment,
      status: a.status,  // present/absent/late
      checkInTime: a.checkInTime,
      remarks: a.remarks
    })),
    createdBy: currentUser,
    club: userClub
  });
  
  await attendance.save();
}
```

**Key Points**:
- Bulk recording with multiple attendees
- Individual status per attendee
- Linked to club and creator
- Optional check-in timestamps

#### 4. **Access Request Workflow**
```typescript
function login(email, password) {
  const user = findUser(email);
  
  if (!user.isApproved && !isAdmin(user.email)) {
    // Check if request already exists
    let request = AccessRequest.findOne({
      user: user._id,
      status: "pending"
    });
    
    // Create new if doesn't exist
    if (!request) {
      request = new AccessRequest({
        user: user._id,
        username: user.username,
        email: user.email,
        status: "pending"
      });
      await request.save();
    }
    
    return "pending_approval";
  }
}
```

**Key Logic**:
- Idempotent request creation (no duplicates)
- Tracks creation time automatically
- Admin can approve/reject with reason
- User sees pending status until decision

#### 5. **Database Connection Caching**
```typescript
// Global cache prevents connection leaks
let cached = {
  conn: null,
  promise: null
};

async function connectDB() {
  // Return existing connection
  if (cached.conn) return cached.conn;
  
  // Check if mongoose already connected
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }
  
  // Create new connection (cached as promise during creation)
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
```

**Benefits**:
- Reuses connections across requests
- Prevents connection exhaustion
- Faster subsequent requests
- Handles concurrent connection attempts

---

## 🚀 Unique Aspects & Design Decisions

### 1. **Separate User & TeamMember Models**
```
Why? 
- User = Login identity (authentication)
- TeamMember = Club member profile (tracking)

Benefits:
- One user can belong to multiple clubs
- Members can have unique identifiers per club (enrollment numbers)
- Clean separation of concerns
- Flexible club membership changes
```

### 2. **Cumulative Points/Hours System**
```
Why cumulative instead of per-event?

Example:
- Week 1: Add 5 points → Total = 5
- Week 2: Add 3 points → Total = 8
- History shows: [Week 1: 5], [Week 2: 8]

Benefits:
- Clear running total visible
- Historical snapshot of progression
- Easy to see member's journey
- Can identify top performers
```

### 3. **Automatic AccessRequest Creation**
```
Why create on first unapproved login?

Scenarios:
- New club leader registers → approval needed
- If user disappears then logs in again → tracked
- Admin knows who's waiting without manual entry

Benefits:
- No manual request creation
- Tracks when user first tried to access
- Better audit trail
- Idempotent (no duplicate requests)
```

### 4. **Admin Email-Based Identity**
```
Why email-based instead of flag in database?

Advantages:
- Admin status not hackable via database
- Managed via environment variable
- Can change without database access
- Survives database imports
- More secure than a role flag
```

### 5. **Maintenance Mode Toggle**
```
Why both maintenanceMode and allowNewRegistrations?

Use Cases:
- Maintenance Mode: Server maintenance, urgent fixes
- Disable Registrations: Control user growth, focus on existing users
- Can handle independently for flexibility

Example:
- Bug found: Enable maintenance, fix, disable
- Too many users: Disable registrations, but admin can still login
```

### 6. **Phone Number Validation (Indian Format)**
```
Why so specific?

Rules:
- Exactly 10 digits
- First digit must be ≥ 6 (mobile standard)

Reasoning:
- Project appears to be for Indian use
- Ensures valid phone numbers (not 0000000000)
- Easy to identify real mobile numbers
```

### 7. **JWT Token 7-Day Expiration**
```
Why 7 days?

Balance:
- Security: Not too long (reduces token theft window)
- Usability: Not too short (users don't logout constantly)
- Cloud: Matches typical session duration

Alternative considerations:
- 24 hours: More secure, frequent logins
- 30 days: Less secure, better UX
- 7 days: Middle ground (industry standard)
```

### 8. **Full Audit Trail in UpdateHistory**
```
Why store full history?

Questions answered:
- Who made the change? → addedBy
- When did it happen? → date, addedAt
- What changed? → Previous and new points/hours
- Why? → remark field

Use Cases:
- Dispute resolution
- Accountability
- Analysis of contribution patterns
- Compliance requirements
```

---

## 📊 Database Relations Diagram

```
User (Authentication)
├─ 1:1 → Club (as leader)
├─ M:N → Club (as member)
└─ 1:M → AccessRequest
└─ 1:M → TeamMember (as creator)
└─ 1:M → Attendance (as creator)

Club (Organization)
├─ 1:1 ← User (leader)
├─ M:N ← User (members)
├─ 1:M → TeamMember
└─ 1:M → Attendance

TeamMember (Tracking)
├─ M:1 → Club
├─ M:1 → User (creator)
├─ M:1 → User (last updater)
├─ 1:1 → MemberFile (optional)
└─ 1:M → (implied) Attendance

Attendance (Events)
├─ M:1 → Club
├─ M:1 → User (creator)
├─ M:1 → User (last updater)
└─ 1:M → TeamMember (via attendees[].memberId)

AccessRequest (Workflow)
└─ M:1 → User
```

---

## 🔒 Security Checklist

✅ **Password Security**
- Hashed with bcryptjs (not plaintext)
- 10 salt rounds (industry standard)
- Compared securely during login

✅ **Authentication**
- JWT tokens with secret
- 7-day expiration
- Verified on protected routes

✅ **Authorization**
- Role-based access control
- Admin bypass via email
- Approval workflow for new users

✅ **Data Protection**
- Database credentials in environment variables
- TLS connections to database
- No sensitive data in tokens

✅ **Input Validation**
- Email format validation
- Phone number format validation
- Required field checks
- Enum validation for statuses

⚠️ **Potential Improvements**
- Rate limiting on login attempts
- Refresh token rotation
- Two-factor authentication
- HTTPS only in production
- CSRF protection
- Input sanitization for all fields

---

## 🚀 Setup & Running

### Prerequisites
```
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- Environment variables configured
```

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com

# Run development server
npm run dev

# Run production build
npm run build
npm start

# Lint code
npm run lint
```

### Database Setup
- MongoDB connection via Mongoose (automatic on first request)
- Collections created automatically
- No manual migration needed

### Default Admin Access
- Set `ADMIN_EMAIL` in environment
- That email bypasses all approval requirements
- Has access to all admin endpoints

---

## 📈 Project Statistics

- **Total Models**: 7 (User, Club, TeamMember, Attendance, AccessRequest, MemberFile, Settings)
- **API Routes**: 40+ endpoints
- **Frontend Pages**: 15+ pages
- **Authentication**: JWT-based
- **Database**: MongoDB with Mongoose ODM
- **Frontend Framework**: Next.js with React/TypeScript
- **Tech Stack**: Full-stack JavaScript/TypeScript

---

## 🎓 For Interview

### Key Talking Points
1. **Problem Solved**: Manual tracking → Centralized digital platform
2. **Architecture**: Separate authentication (User) and tracking (TeamMember) models
3. **Security**: JWT + bcryptjs + approval workflow
4. **Scalability**: Supports unlimited clubs and members
5. **Audit Trail**: Complete history of all changes with who/what/when
6. **Role-Based Access**: Admin > Club Leader > Member hierarchy
7. **Business Logic**: Cumulative tracking with historical snapshots
8. **Database Design**: Well-normalized with proper relationships

### Questions You Should Be Able to Answer
- **"What does the app do?"**: Club management and member contribution tracking
- **"How does auth work?"**: JWT tokens, bcryptjs hashing, approval workflow
- **"Why separate User and TeamMember?"**: Different concerns - login identity vs tracking profile
- **"How is audit trail maintained?"**: updateHistory array with user/date for each change
- **"How do admins get access?"**: Email match with environment variable (not database)
- **"What prevents unauthorized access?"**: isApproved flag + access request workflow
- **"How does scaling work?"**: MongoDB handles data, no artificial limits

---

## 📞 Summary for Quick Reference

| Aspect | Details |
|--------|---------|
| **What** | Club management & member tracking platform |
| **Who** | Club leaders managing teams of members |
| **Tech** | Next.js + MongoDB + JWT + TypeScript |
| **Key Features** | Attendance tracking, contribution tracking, reports |
| **Auth** | JWT tokens, bcryptjs hashing, approval workflow |
| **Models** | User, Club, TeamMember, Attendance, AccessRequest, MemberFile, Settings |
| **API** | 40+ endpoints for all operations |
| **Unique** | Cumulative points/hours, full audit trail, admin email-based |
| **Security** | Password hashing, JWT expiration, role-based access |

---

**Last Updated**: March 14, 2026
**Version**: 1.0
**Status**: Ready for Interview

