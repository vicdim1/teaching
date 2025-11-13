# Tutor CRM - Private Tutoring Management System

A comprehensive CRM system designed for private tutors to manage students, teaching sessions, invoices, and student work reviews with AI-powered analysis.

## Features

### 📚 Student Management
- Maintain detailed student records
- Track contact information (student and parent)
- Set individual hourly rates
- Manage student status (active/inactive)
- View student history and statistics

### 📅 Session Management
- Log teaching sessions with date, time, and duration
- Add notes and subject information for each session
- Filter sessions by month and year
- Automatic calculation of session revenue
- Track all sessions per student

### 💰 Automated Invoicing
- Generate invoices automatically from logged sessions
- Calculate hours and totals per student per month
- Send invoices directly by email
- Track invoice status (pending, sent, paid)
- Professional invoice formatting
- Unique invoice numbers

### 📸 Work Review & AI Analysis
- Upload images of student work
- Automatic AI-powered analysis using GPT-4 Vision
- Add context and description for better analysis
- Keep tutor notes alongside AI feedback
- Build a history of student progress

### 📊 Dashboard
- Overview of active students
- Current month revenue tracking
- Pending invoices summary
- Recent session history
- Quick access to all features

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Vision API
- **Email**: Nodemailer
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (for work analysis feature)
- Email account for sending invoices (Gmail recommended)

## Installation & Setup

### 1. Install Dependencies (Already Done)

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and configure the following:

```env
# Database (already configured)
DATABASE_URL="file:./dev.db"

# OpenAI API Key (required for work analysis)
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY="your-openai-api-key-here"

# Email Configuration for Gmail
# Note: For Gmail, you need to create an App Password
# Instructions: https://support.google.com/accounts/answer/185833
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
EMAIL_FROM="your-email@gmail.com"

# NextAuth Secret (generate a random string)
# You can generate one using: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup (Already Migrated)

The database is already set up and migrated. If you need to reset it:

```bash
npx prisma migrate reset
```

### 4. Create Your Admin Account

Start the development server first:

```bash
npm run dev
```

Then create your account using the API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your-email@example.com",
    "password": "your-secure-password"
  }'
```

### 5. Access the Application

Open [http://localhost:3000](http://localhost:3000) and login with your credentials.

## Usage Guide

### First-Time Setup

1. **Login** with the credentials you created
2. **Add Students**: Click "Students" → "Add Student"
   - Enter student details, parent info, and hourly rate
3. **Log Sessions**: Click "Sessions" → "Log Session"
   - Select student, date, duration, and add notes
4. **Generate Invoices**: Click "Invoices" → "Generate Invoice"
   - Select student and month to automatically create invoice
5. **Review Work**: Click "Work Reviews" → "Add Work Review"
   - Upload student work images for AI analysis

### Gmail Setup for Invoices

To send invoices via Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Use this app password in your `.env` file (not your regular password)

### OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Add the key to your `.env` file

Note: The work analysis feature uses GPT-4 Vision which has associated costs. Check [OpenAI Pricing](https://openai.com/pricing) for current rates.

## Project Structure

```
teaching/
├── app/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── page.tsx         # Dashboard home
│   │   ├── students/        # Student management
│   │   ├── sessions/        # Session logging
│   │   ├── invoices/        # Invoice management
│   │   └── work-reviews/    # Work analysis
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── students/        # Student CRUD
│   │   ├── sessions/        # Session CRUD
│   │   ├── invoices/        # Invoice operations
│   │   └── work-reviews/    # Work review CRUD
│   ├── login/               # Login page
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Auth utilities
│   ├── email/              # Email templates
│   ├── openai.ts           # AI integration
│   ├── validations.ts      # Zod schemas
│   └── utils.ts            # Helper functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── public/
│   └── uploads/            # Student work images
└── .env                    # Environment variables
```

## Key Features Explained

### Invoice Generation

Invoices are automatically generated from uninvoiced sessions:

1. Select a student and month
2. System finds all sessions for that period
3. Calculates total hours × hourly rate
4. Creates invoice with unique number
5. Links sessions to invoice
6. Ready to send by email

### AI Work Analysis

When you upload student work:

1. Image is saved securely
2. Sent to GPT-4 Vision API with your context
3. AI provides constructive feedback:
   - What the student did well
   - Areas for improvement
   - Specific suggestions
   - Concepts to reinforce
4. You can add your own notes alongside AI analysis

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate Prisma client
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Note: For production, consider switching from SQLite to PostgreSQL.

## Troubleshooting

### Database Issues

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Email Not Sending

- Verify Gmail app password is correct
- Check 2FA is enabled on Google account
- Ensure EMAIL_HOST and EMAIL_PORT are correct

### AI Analysis Not Working

- Verify OPENAI_API_KEY is set correctly
- Check you have credits in your OpenAI account
- Ensure images are valid formats (JPG, PNG)

## License

This project is for personal use. Modify as needed for your tutoring business.

---

Built with ❤️ for private tutors
