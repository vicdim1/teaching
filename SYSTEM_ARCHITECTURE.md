# Tutor CRM - System Architecture & End-to-End Explanation

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Component Breakdown](#component-breakdown)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [User Journey Flows](#user-journey-flows)
5. [Database Architecture](#database-architecture)
6. [API Architecture](#api-architecture)
7. [Technology Stack Explained](#technology-stack-explained)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
│                     (Next.js App Router Pages)                       │
├─────────────────────────────────────────────────────────────────────┤
│  Login Page  │  Dashboard  │  Students  │  Sessions  │  Invoices    │
│              │             │            │            │  Work Reviews │
└──────┬───────────────┬───────────┬──────────┬────────────┬──────────┘
       │               │           │          │            │
       ├───────────────┴───────────┴──────────┴────────────┤
       │                                                     │
┌──────▼─────────────────────────────────────────────────────▼─────────┐
│                        MIDDLEWARE LAYER                              │
│                   (Authentication & Routing)                         │
├──────────────────────────────────────────────────────────────────────┤
│  • Check if user is logged in (cookie-based session)                │
│  • Redirect to /login if not authenticated                          │
│  • Protect all routes except /login and /register                   │
└──────┬───────────────────────────────────────────────────────────────┘
       │
┌──────▼─────────────────────────────────────────────────────────────┐
│                          API ROUTES                                 │
│                    (Next.js API Handlers)                           │
├─────────────────────────────────────────────────────────────────────┤
│  Auth APIs     │  Student APIs  │  Session APIs  │  Invoice APIs   │
│  • /login      │  • GET /all    │  • GET /all    │  • GET /all     │
│  • /logout     │  • POST /new   │  • POST /new   │  • POST /gen    │
│  • /register   │  • PUT /:id    │  • PUT /:id    │  • POST /send   │
│  • /me         │  • DELETE /:id │  • DELETE /:id │  • DELETE /:id  │
│                │                │                │                  │
│  Work Review APIs                                                   │
│  • GET /all    • POST /new (with image)   • DELETE /:id            │
└──────┬──────────────────┬────────────────────┬─────────────────────┘
       │                  │                    │
       ├──────────────────┼────────────────────┤
       │                  │                    │
┌──────▼──────────┐  ┌───▼─────────┐   ┌──────▼──────────┐
│  PRISMA ORM     │  │  OPENAI API │   │  NODEMAILER     │
│  (Data Layer)   │  │  (AI Layer) │   │  (Email Layer)  │
└──────┬──────────┘  └─────────────┘   └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                   SQLite DATABASE                        │
│  (File: prisma/dev.db)                                  │
├──────────────────────────────────────────────────────────┤
│  Tables:                                                │
│  • User        → Stores tutor login credentials         │
│  • Student     → Student records & contact info         │
│  • Session     → Teaching session logs                  │
│  • Invoice     → Generated invoices                     │
│  • WorkReview  → Student work with AI analysis          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   FILE STORAGE                           │
│  public/uploads/  → Student work images                 │
└──────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend Layer (Next.js App Router)

**Location:** `/app` directory

```
app/
├── (dashboard)/              ← Protected routes (require login)
│   ├── page.tsx             ← Dashboard home
│   ├── students/page.tsx    ← Student management UI
│   ├── sessions/page.tsx    ← Session logging UI
│   ├── invoices/page.tsx    ← Invoice management UI
│   └── work-reviews/page.tsx ← Work analysis UI
│
├── login/page.tsx           ← Public login page
├── layout.tsx               ← Root layout wrapper
└── api/                     ← Backend API routes
    ├── auth/
    ├── students/
    ├── sessions/
    ├── invoices/
    └── work-reviews/
```

**What it does:**
- Renders the user interface
- Client-side form handling
- Displays data from API
- Handles user interactions
- Uses React hooks for state management

---

### 2. Middleware Layer

**Location:** `/middleware.ts`

```typescript
Request comes in
     ↓
Check: Does user have valid session cookie?
     ↓
  ┌──Yes──┐    ┌──No───┐
  │       │    │       │
  Allow   │    Redirect to /login
  Access  │    │
```

**What it does:**
- Intercepts every request before it reaches the page
- Checks if user is authenticated (has userId cookie)
- Redirects unauthenticated users to /login
- Allows authenticated users to access dashboard
- Redirects logged-in users away from /login page

---

### 3. API Layer (Backend Routes)

**Location:** `/app/api/**`

#### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│              REGISTRATION FLOW                          │
└─────────────────────────────────────────────────────────┘

User submits registration form
     ↓
POST /api/auth/register
     ↓
Validate email/password (Zod schema)
     ↓
Check if user already exists
     ↓
Hash password (bcrypt)
     ↓
Create user in database
     ↓
Set session cookie (userId)
     ↓
Return user data


┌─────────────────────────────────────────────────────────┐
│                  LOGIN FLOW                             │
└─────────────────────────────────────────────────────────┘

User submits login form
     ↓
POST /api/auth/login
     ↓
Find user by email
     ↓
Verify password (bcrypt.compare)
     ↓
Set session cookie (userId)
     ↓
Return user data
```

#### Student Management Flow

```
┌─────────────────────────────────────────────────────────┐
│              CREATE STUDENT FLOW                        │
└─────────────────────────────────────────────────────────┘

User fills out "Add Student" form
     ↓
POST /api/students
     ↓
Validate data (Zod schema)
  • firstName, lastName (required)
  • hourlyRate (required, must be positive)
  • email (optional, must be valid)
  • parentName, parentEmail, phone, etc.
     ↓
Create student record in database
     ↓
Return created student


┌─────────────────────────────────────────────────────────┐
│              GET ALL STUDENTS                           │
└─────────────────────────────────────────────────────────┘

GET /api/students
     ↓
Query database with Prisma
  • Order by: active (desc), firstName (asc)
  • Include counts: sessions, invoices
     ↓
Return student list
```

#### Session Logging Flow

```
┌─────────────────────────────────────────────────────────┐
│              LOG SESSION FLOW                           │
└─────────────────────────────────────────────────────────┘

User fills out "Log Session" form
  • Select student
  • Choose date & time
  • Enter duration (hours)
  • Add notes (optional)
     ↓
POST /api/sessions
     ↓
Validate data (Zod schema)
     ↓
Create session record
  • Link to student
  • Store date, duration, notes
  • invoiceId = null (not yet invoiced)
     ↓
Return created session
```

#### Invoice Generation Flow

```
┌─────────────────────────────────────────────────────────┐
│           GENERATE INVOICE FLOW                         │
└─────────────────────────────────────────────────────────┘

User clicks "Generate Invoice"
  • Selects student
  • Selects month/year
     ↓
POST /api/invoices
     ↓
1. Check if invoice already exists for this period
   → If yes, return error
     ↓
2. Get all sessions for this student in this month
   → Filter: invoiceId = null (uninvoiced only)
     ↓
3. Calculate totals
   • totalHours = sum(session.duration)
   • totalAmount = totalHours × student.hourlyRate
     ↓
4. Generate unique invoice number
   → Format: "INV-YYYYMM-STUDENTID"
     ↓
5. Create invoice record
     ↓
6. Link all sessions to this invoice
   → Update session.invoiceId
     ↓
Return created invoice


┌─────────────────────────────────────────────────────────┐
│              SEND INVOICE EMAIL                         │
└─────────────────────────────────────────────────────────┘

User clicks "Send" on invoice
     ↓
POST /api/invoices/:id/send
     ↓
1. Get invoice with student details
     ↓
2. Determine recipient email
   → Prefer parentEmail, fallback to student email
     ↓
3. Generate HTML email
   • Invoice number
   • Period (month/year)
   • Total hours and amount
   • Professional formatting
     ↓
4. Send via Nodemailer (SMTP)
     ↓
5. Update invoice status
   • status = "sent"
   • sentAt = now()
     ↓
Return success
```

#### Work Review Flow

```
┌─────────────────────────────────────────────────────────┐
│         WORK REVIEW WITH AI ANALYSIS                    │
└─────────────────────────────────────────────────────────┘

User uploads student work
  • Select student
  • Upload image
  • Add description (optional)
  • Add tutor notes (optional)
     ↓
POST /api/work-reviews (multipart/form-data)
     ↓
1. Receive uploaded image file
     ↓
2. Save image to public/uploads/
   → Filename: timestamp-sanitized-name.jpg
     ↓
3. Convert image to base64
     ↓
4. Send to OpenAI GPT-4 Vision API
   → System prompt: "You are an experienced tutor..."
   → User message: description + image
     ↓
5. Receive AI analysis
   • What student did well
   • Areas for improvement
   • Specific suggestions
   • Concepts to reinforce
     ↓
6. Create work review record
   • studentId
   • imageUrl = "/uploads/filename.jpg"
   • description
   • aiAnalysis (from OpenAI)
   • tutorNotes
     ↓
Return created work review with AI analysis
```

---

## Data Flow Diagrams

### Complete User Session Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   USER OPENS APP                             │
│                http://localhost:3000                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   MIDDLEWARE CHECK   │
              │  Is user logged in?  │
              └──────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼────┐           ┌───▼────┐
         │   NO    │           │  YES   │
         └────┬────┘           └───┬────┘
              │                    │
              │                    │
    ┌─────────▼─────────┐    ┌────▼──────────────┐
    │  REDIRECT TO      │    │  LOAD DASHBOARD   │
    │  /login           │    │  Show: students,  │
    └─────────┬─────────┘    │  sessions, stats  │
              │              └────┬──────────────┘
              │                   │
    ┌─────────▼─────────┐         │
    │  LOGIN PAGE       │         │
    │  Enter email/pwd  │         │
    └─────────┬─────────┘         │
              │                   │
    ┌─────────▼─────────┐         │
    │ POST /api/auth/   │         │
    │      login        │         │
    └─────────┬─────────┘         │
              │                   │
    ┌─────────▼─────────┐         │
    │  Set session      │         │
    │  cookie           │         │
    └─────────┬─────────┘         │
              │                   │
              └───────────────────┤
                                  │
                    ┌─────────────▼──────────────┐
                    │   USER IS NOW LOGGED IN    │
                    │   Can access all features  │
                    └────────────────────────────┘
```

### Complete Invoice Generation Flow

```
┌────────────────────────────────────────────────────────────┐
│  USER JOURNEY: Generate & Send Invoice                    │
└────────────────────────────────────────────────────────────┘

Month of October ends
  ↓
User navigates to "Invoices" page
  ↓
Clicks "Generate Invoice" button
  ↓
Modal form appears
  ↓
User selects:
  • Student: "John Doe"
  • Month: October
  • Year: 2024
  ↓
Clicks "Generate Invoice"
  ↓
┌───────────────────────────────────────┐
│    FRONTEND SENDS REQUEST             │
│  POST /api/invoices                   │
│  Body: {                              │
│    studentId: "abc123",               │
│    month: 10,                         │
│    year: 2024                         │
│  }                                    │
└───────────┬───────────────────────────┘
            │
┌───────────▼───────────────────────────┐
│    BACKEND PROCESSING                 │
│                                       │
│  1. Find all sessions for John Doe   │
│     in October 2024                   │
│                                       │
│     Database query:                   │
│     WHERE studentId = "abc123"        │
│       AND date >= 2024-10-01          │
│       AND date <= 2024-10-31          │
│       AND invoiceId = NULL            │
│                                       │
│     Results:                          │
│     - Oct 5: 2 hours (Math)           │
│     - Oct 12: 1.5 hours (Science)     │
│     - Oct 19: 2 hours (Math)          │
│     - Oct 26: 1 hour (Reading)        │
│                                       │
│  2. Calculate totals                  │
│     totalHours = 2+1.5+2+1 = 6.5 hrs  │
│     hourlyRate = $50 (from student)   │
│     totalAmount = 6.5 × $50 = $325    │
│                                       │
│  3. Generate invoice number           │
│     Format: "INV-202410-abc123"       │
│                                       │
│  4. Create invoice record             │
│     {                                 │
│       invoiceNumber: "INV-202410..."  │
│       studentId: "abc123"             │
│       month: 10                       │
│       year: 2024                      │
│       totalHours: 6.5                 │
│       hourlyRate: 50                  │
│       totalAmount: 325                │
│       status: "pending"               │
│     }                                 │
│                                       │
│  5. Link sessions to invoice          │
│     UPDATE sessions                   │
│     SET invoiceId = "invoice123"      │
│     WHERE id IN (session1, session2...) │
│                                       │
└───────────┬───────────────────────────┘
            │
┌───────────▼───────────────────────────┐
│    INVOICE CREATED                    │
│    Frontend shows:                    │
│    "Invoice INV-202410-abc123         │
│     created successfully!"            │
└───────────┬───────────────────────────┘
            │
User clicks "Send" button on invoice
            │
┌───────────▼───────────────────────────┐
│    SEND EMAIL                         │
│  POST /api/invoices/:id/send          │
│                                       │
│  1. Get invoice details               │
│  2. Get student email                 │
│     (parent@email.com)                │
│  3. Generate HTML email               │
│     - Professional template           │
│     - List all sessions               │
│     - Show total                      │
│  4. Send via Nodemailer               │
│     - SMTP: smtp.gmail.com            │
│     - From: tutor@gmail.com           │
│     - To: parent@email.com            │
│  5. Update invoice status             │
│     status = "sent"                   │
│     sentAt = now()                    │
└───────────┬───────────────────────────┘
            │
┌───────────▼───────────────────────────┐
│    EMAIL SENT                         │
│    Parent receives professional       │
│    invoice in their inbox             │
└───────────────────────────────────────┘
```

---

## Database Architecture

### Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│       USER          │
│─────────────────────│
│ id (PK)             │ ← Tutor login credentials
│ email               │
│ password (hashed)   │
│ name                │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘


┌──────────────────────────────────────┐
│           STUDENT                    │
│──────────────────────────────────────│
│ id (PK)                              │
│ firstName                            │
│ lastName                             │
│ email                                │
│ phone                                │
│ parentName                           │
│ parentEmail                          │
│ parentPhone                          │
│ hourlyRate                           │ ← Important for invoicing
│ grade                                │
│ subject                              │
│ notes                                │
│ active (boolean)                     │
│ createdAt                            │
│ updatedAt                            │
└──────────┬───────────────────────────┘
           │
           │ One-to-Many
           │
    ┌──────┴────────┬─────────────┬────────────┐
    │               │             │            │
    │               │             │            │
┌───▼────────┐  ┌───▼──────┐  ┌──▼──────┐  ┌─▼────────────┐
│  SESSION   │  │ INVOICE  │  │ WORK    │  │ (future)     │
│            │  │          │  │ REVIEW  │  │              │
└────────────┘  └──────────┘  └─────────┘  └──────────────┘


┌─────────────────────────────────────┐
│            SESSION                  │
│─────────────────────────────────────│
│ id (PK)                             │
│ studentId (FK) ──────────────┐      │
│ date                         │      │
│ duration                     │      │
│ subject                      │      │
│ notes                        │      │
│ invoiceId (FK) ────────┐     │      │
│ createdAt              │     │      │
│ updatedAt              │     │      │
└────────────────────────┼─────┼──────┘
                         │     │
                         │     │
              ┌──────────┘     └──────────────┐
              │                               │
              │                               │
┌─────────────▼────────────────┐   ┌──────────▼────────┐
│         INVOICE              │   │     STUDENT       │
│──────────────────────────────│   └───────────────────┘
│ id (PK)                      │
│ studentId (FK) ──────────────┼───→ links back to student
│ invoiceNumber (unique)       │
│ month                        │
│ year                         │
│ totalHours                   │   ← Calculated from sessions
│ hourlyRate                   │   ← Copied from student
│ totalAmount                  │   ← totalHours × hourlyRate
│ status (pending/sent/paid)   │
│ sentAt                       │
│ paidAt                       │
│ notes                        │
│ createdAt                    │
│ updatedAt                    │
└──────────────────────────────┘


┌─────────────────────────────────────┐
│         WORK REVIEW                 │
│─────────────────────────────────────│
│ id (PK)                             │
│ studentId (FK) ──────────────┐      │
│ date                         │      │
│ imageUrl                     │      │ ← "/uploads/file.jpg"
│ description                  │      │
│ aiAnalysis                   │      │ ← From OpenAI
│ tutorNotes                   │      │
│ createdAt                    │      │
│ updatedAt                    │      │
└──────────────────────────────┼──────┘
                               │
                               └──────→ links to STUDENT
```

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Student {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String?
  phone       String?
  parentName  String?
  parentEmail String?
  parentPhone String?
  hourlyRate  Float           // Critical for invoice calculation
  grade       String?
  subject     String?
  notes       String?
  active      Boolean  @default(true)

  // Relations
  sessions    Session[]       // One student → many sessions
  invoices    Invoice[]       // One student → many invoices
  workReviews WorkReview[]    // One student → many work reviews
}

model Session {
  id        String   @id @default(cuid())
  studentId String
  date      DateTime
  duration  Float           // Hours (can be 0.25, 0.5, etc.)
  subject   String?
  notes     String?
  invoiceId String?         // NULL until invoiced

  // Relations
  student   Student  @relation(fields: [studentId], references: [id])
  invoice   Invoice? @relation(fields: [invoiceId], references: [id])
}

model Invoice {
  id            String   @id @default(cuid())
  studentId     String
  invoiceNumber String   @unique    // "INV-YYYYMM-STUDENTID"
  month         Int                 // 1-12
  year          Int
  totalHours    Float               // Sum of session durations
  hourlyRate    Float               // From student at time of invoice
  totalAmount   Float               // totalHours × hourlyRate
  status        String   @default("pending")  // pending/sent/paid
  sentAt        DateTime?
  paidAt        DateTime?
  notes         String?

  // Relations
  student       Student   @relation(fields: [studentId], references: [id])
  sessions      Session[] // All sessions linked to this invoice
}

model WorkReview {
  id          String   @id @default(cuid())
  studentId   String
  date        DateTime @default(now())
  imageUrl    String?          // Path to uploaded image
  description String?          // Context from tutor
  aiAnalysis  String?          // Response from GPT-4 Vision
  tutorNotes  String?          // Additional tutor commentary

  // Relations
  student     Student  @relation(fields: [studentId], references: [id])
}
```

---

## User Journey Flows

### Journey 1: First Time Setup

```
Day 1: Tutor sets up the system
  ↓
1. Install app on computer
   npm install
  ↓
2. Configure environment (.env)
   - Set email credentials
   - Set OpenAI API key
  ↓
3. Start server
   npm run dev
  ↓
4. Create admin account
   POST /api/auth/register
  ↓
5. Login
   ↓
6. Add all 20 students
   For each student:
     - Name, contact info
     - Hourly rate
     - Grade, subject
  ↓
7. Start logging sessions daily
```

### Journey 2: Daily Teaching Workflow

```
Morning: Check today's schedule
  ↓
Open app → Dashboard
  ↓
See today's students (if we add calendar view)
  ↓
Teach sessions throughout the day
  ↓
After each session (or at end of day):
  ↓
Click "Sessions" → "Log Session"
  ↓
Fill form:
  - Select student
  - Choose date/time
  - Enter duration
  - Add notes
  ↓
Click "Create"
  ↓
Session saved → will be included in next invoice
```

### Journey 3: Monthly Invoicing

```
End of Month (e.g., October 31st)
  ↓
Open app → "Invoices"
  ↓
Click "Generate Invoice"
  ↓
For each student:
  ↓
  Select student
  ↓
  Select month: October
  ↓
  Select year: 2024
  ↓
  Click "Generate Invoice"
  ↓
  System automatically:
    - Finds all October sessions
    - Calculates total hours
    - Multiplies by hourly rate
    - Creates invoice
    - Links sessions to invoice
  ↓
  Invoice appears in list
  ↓
  Click "Send" button
  ↓
  System:
    - Generates professional email
    - Sends to parent email
    - Marks invoice as "sent"
  ↓
  Parent receives invoice
  ↓
Parent pays
  ↓
Click "Mark as Paid" in app
  ↓
Invoice status → "paid"
```

### Journey 4: Student Work Analysis

```
Student completes homework
  ↓
Tutor takes photo of work
  ↓
Open app → "Work Reviews"
  ↓
Click "Add Work Review"
  ↓
Fill form:
  - Select student
  - Upload image
  - Add description: "Algebra homework on quadratic equations"
  - Add initial notes (optional)
  ↓
Click "Create Review"
  ↓
System:
  1. Saves image to server
  2. Sends to OpenAI GPT-4 Vision
  3. Receives AI analysis
  4. Saves everything to database
  ↓
AI analysis appears:
  "The student demonstrates good understanding of:
   - Factoring basics
   - Setting up equations

   Areas for improvement:
   - Sign errors in step 3
   - Need to check work

   Suggestions:
   - Review negative number rules
   - Practice verification steps"
  ↓
Tutor reviews AI feedback
  ↓
Tutor adds own notes:
  "Great improvement from last week!
   Let's do 5 more practice problems
   focusing on sign rules."
  ↓
History builds over time
  ↓
Can track student progress month-over-month
```

---

## Technology Stack Explained

### Why These Technologies?

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
├─────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router)                               │
│  Why: Full-stack framework, server & client in one     │
│       Fast, SEO-friendly, easy deployment              │
│       App Router = modern, better patterns             │
├─────────────────────────────────────────────────────────┤
│  TypeScript                                            │
│  Why: Type safety, fewer bugs, better IDE support      │
│       Catches errors before runtime                    │
├─────────────────────────────────────────────────────────┤
│  Tailwind CSS                                          │
│  Why: Fast styling, no CSS files, responsive design    │
│       Consistent design system                         │
├─────────────────────────────────────────────────────────┤
│  Lucide React (Icons)                                  │
│  Why: Modern, clean icons, tree-shakeable              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
├─────────────────────────────────────────────────────────┤
│  Next.js API Routes                                    │
│  Why: Backend and frontend in same codebase            │
│       No need for separate Express server              │
│       Automatic routing based on file structure        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    DATABASE                             │
├─────────────────────────────────────────────────────────┤
│  SQLite                                                │
│  Why: Simple, file-based, no server needed             │
│       Perfect for local development                    │
│       Easy backup (just copy file)                     │
│  Con: Not ideal for production cloud hosting           │
│       (Would switch to PostgreSQL for Vercel)          │
├─────────────────────────────────────────────────────────┤
│  Prisma ORM                                            │
│  Why: Type-safe database queries                       │
│       Auto-complete in IDE                             │
│       Easy migrations                                  │
│       Beautiful schema definition                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  AUTHENTICATION                         │
├─────────────────────────────────────────────────────────┤
│  Cookie-based sessions                                 │
│  Why: Simple, no external dependencies                 │
│       HTTP-only cookies = secure                       │
│       Works without JavaScript                         │
├─────────────────────────────────────────────────────────┤
│  bcryptjs                                              │
│  Why: Industry standard password hashing               │
│       Secure, proven, easy to use                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                      │
├─────────────────────────────────────────────────────────┤
│  OpenAI GPT-4 Vision API                               │
│  Why: Best-in-class image understanding                │
│       Excellent at analyzing student work              │
│       Provides educational, constructive feedback      │
│  Cost: ~$0.01-0.05 per image analysis                  │
├─────────────────────────────────────────────────────────┤
│  Nodemailer (SMTP)                                     │
│  Why: Standard email sending library                   │
│       Works with any SMTP provider (Gmail, etc.)       │
│       No external service fees                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  VALIDATION                             │
├─────────────────────────────────────────────────────────┤
│  Zod                                                   │
│  Why: Runtime type validation                          │
│       TypeScript integration                           │
│       Clear error messages                             │
│       Prevents bad data in database                    │
└─────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow Example

### Example: Creating a New Student

```
┌────────────────────────────────────────────────────────┐
│  STEP 1: User fills out form                           │
└────────────────────────────────────────────────────────┘

Browser (React Component)
  ↓
User types:
  firstName: "Sarah"
  lastName: "Johnson"
  email: "parent@email.com"
  hourlyRate: 60
  grade: "8"
  subject: "Math"
  ↓
User clicks "Create"


┌────────────────────────────────────────────────────────┐
│  STEP 2: Frontend sends HTTP request                   │
└────────────────────────────────────────────────────────┘

fetch('/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "parent@email.com",
    hourlyRate: 60,
    grade: "8",
    subject: "Math",
    active: true
  })
})


┌────────────────────────────────────────────────────────┐
│  STEP 3: Request hits Next.js API route                │
└────────────────────────────────────────────────────────┘

File: app/api/students/route.ts

export async function POST(request: Request) {
  // 1. Parse request body
  const body = await request.json()

  // 2. Validate with Zod
  const validatedData = studentSchema.parse(body)
  // If validation fails → throw error → return 400

  // 3. Create in database via Prisma
  const student = await prisma.student.create({
    data: validatedData
  })

  // 4. Return response
  return NextResponse.json(student, { status: 201 })
}


┌────────────────────────────────────────────────────────┐
│  STEP 4: Prisma executes SQL                           │
└────────────────────────────────────────────────────────┘

Prisma translates to SQL:

INSERT INTO Student (
  id, firstName, lastName, email, hourlyRate,
  grade, subject, active, createdAt, updatedAt
) VALUES (
  'cuid123...', 'Sarah', 'Johnson', 'parent@email.com',
  60, '8', 'Math', 1, '2024-11-15 10:30:00', '2024-11-15 10:30:00'
);

Database file: prisma/dev.db
  ↓
SQLite writes to disk


┌────────────────────────────────────────────────────────┐
│  STEP 5: Response flows back                           │
└────────────────────────────────────────────────────────┘

API returns JSON:
{
  "id": "cuid123...",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "parent@email.com",
  "hourlyRate": 60,
  "grade": "8",
  "subject": "Math",
  "active": true,
  "createdAt": "2024-11-15T10:30:00.000Z",
  "updatedAt": "2024-11-15T10:30:00.000Z"
}

  ↓
Frontend receives response
  ↓
React updates state
  ↓
UI refreshes to show new student
  ↓
Modal closes
  ↓
Student appears in table
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                        │
└────────────────────────────────────────────────────────┘

Layer 1: Password Security
  • Passwords hashed with bcrypt (10 rounds)
  • Never stored in plaintext
  • Cannot be reversed

Layer 2: Session Management
  • HTTP-only cookies (not accessible via JavaScript)
  • Secure flag in production (HTTPS only)
  • SameSite: Lax (CSRF protection)
  • 7-day expiration

Layer 3: Route Protection
  • Middleware checks every request
  • Unauthenticated users → redirect to login
  • No direct API access without session

Layer 4: Input Validation
  • Zod schemas validate all inputs
  • Type checking prevents injection
  • Email validation prevents fake emails

Layer 5: Environment Variables
  • Secrets in .env file (not in code)
  • .env gitignored (never committed)
  • Different secrets per environment

Layer 6: Database Security
  • Prisma prevents SQL injection
  • Parameterized queries only
  • No raw SQL strings from user input

Layer 7: File Upload Security
  • Sanitize filenames
  • Limit file sizes
  • Validate file types
  • Store outside public web root (production)
```

---

## Deployment Architecture (Production)

### Current (Local Development)

```
┌──────────────────────────┐
│   Your Computer          │
│                          │
│  ┌────────────────────┐  │
│  │  Next.js Server    │  │
│  │  Port: 3000        │  │
│  └────────────────────┘  │
│           │              │
│  ┌────────▼──────────┐   │
│  │  SQLite Database  │   │
│  │  File: dev.db     │   │
│  └───────────────────┘   │
│                          │
│  ┌───────────────────┐   │
│  │  File Storage     │   │
│  │  public/uploads/  │   │
│  └───────────────────┘   │
└──────────────────────────┘

Access: Only you, only when computer is on
```

### Recommended (Production - Vercel + PostgreSQL)

```
┌────────────────────────────────────────────────────┐
│                   INTERNET                         │
└───────────────────┬────────────────────────────────┘
                    │
                    │ HTTPS
                    │
┌───────────────────▼────────────────────────────────┐
│              VERCEL PLATFORM                       │
│  (Serverless hosting - always online)              │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │  Next.js App (Multiple Edge Instances)   │     │
│  │  Auto-scales based on traffic             │     │
│  └────────┬─────────────────────┬────────────┘     │
│           │                     │                  │
│           │                     │                  │
│  ┌────────▼──────────┐   ┌──────▼─────────────┐   │
│  │ Vercel Postgres   │   │  Vercel Blob       │   │
│  │ (Database)        │   │  (Image Storage)   │   │
│  │ - Managed         │   │  - CDN-backed      │   │
│  │ - Auto backup     │   │  - Fast delivery   │   │
│  └───────────────────┘   └────────────────────┘   │
└────────────────────────────────────────────────────┘
         │
         │ External APIs
         │
┌────────▼──────────┐     ┌───────────────┐
│  OpenAI API       │     │  Gmail SMTP   │
│  (Work Analysis)  │     │  (Invoices)   │
└───────────────────┘     └───────────────┘

Access: Anyone with URL, 24/7, from anywhere
Cost: ~$0-5/month for small tutoring business
```

---

## Performance Considerations

```
┌────────────────────────────────────────────────────┐
│              OPTIMIZATION STRATEGIES               │
└────────────────────────────────────────────────────┘

Database Queries:
  • Indexes on frequently queried fields
    - Student.id, Session.studentId, Invoice.studentId
  • Eager loading related data
    - Include sessions when fetching invoices
  • Limit results with pagination (future)

Frontend:
  • Server-side rendering (Next.js default)
  • Lazy loading images
  • Minimize JavaScript bundle
  • Use Next.js Image component

API:
  • Fast responses (<100ms for most queries)
  • Efficient database queries
  • No N+1 query problems

Caching (Future):
  • Dashboard stats cached for 5 minutes
  • Student list cached until changes
  • React Query for client-side caching
```

---

## Summary: How It All Works Together

```
1. User opens browser → http://localhost:3000
     ↓
2. Middleware checks if logged in
     ↓ (if not logged in)
3. Redirect to /login
     ↓
4. User enters credentials
     ↓
5. POST /api/auth/login
     ↓
6. Verify password (bcrypt)
     ↓
7. Set session cookie
     ↓
8. Redirect to dashboard
     ↓
9. Dashboard fetches data from API
     ↓
10. API queries database via Prisma
     ↓
11. Returns JSON to frontend
     ↓
12. React renders UI
     ↓
13. User can now:
      - Add students
      - Log sessions
      - Generate invoices
      - Send emails
      - Analyze student work with AI
```

---

## Key Takeaways

**What makes this architecture good:**

1. **Separation of Concerns**
   - Frontend (UI) separate from backend (API)
   - Database logic in Prisma models
   - Validation in Zod schemas
   - Email logic in separate files

2. **Type Safety**
   - TypeScript catches errors at compile time
   - Prisma generates types from database schema
   - Zod validates runtime data

3. **Security**
   - Passwords hashed
   - Sessions protected
   - Input validated
   - Routes protected by middleware

4. **Maintainability**
   - Clear folder structure
   - Consistent patterns
   - Self-documenting code
   - Easy to extend

5. **Scalability**
   - Can migrate to PostgreSQL easily
   - Can add features without major refactoring
   - Can deploy to cloud when needed

**What makes this architecture simple:**

1. **All-in-One**
   - Frontend and backend in one codebase
   - No separate servers to manage
   - Single deployment

2. **File-based Database**
   - No database server to set up
   - Just a file on disk
   - Easy backup (copy file)

3. **No External Dependencies**
   - Auth built-in (no Auth0, etc.)
   - File storage local (no AWS S3 needed for dev)
   - Simple email (just SMTP)

---

**End of System Architecture Document**

Questions? Need clarification on any component? Want to dive deeper into any specific flow?
