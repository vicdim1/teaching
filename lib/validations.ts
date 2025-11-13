import { z } from 'zod'

export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  parentName: z.string().optional(),
  parentEmail: z.string().email().optional().or(z.literal('')),
  parentPhone: z.string().optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  grade: z.string().optional(),
  subject: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true),
})

export const sessionSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  date: z.string().or(z.date()),
  duration: z.number().min(0.25, 'Duration must be at least 15 minutes'),
  subject: z.string().optional(),
  notes: z.string().optional(),
})

export const workReviewSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  description: z.string().optional(),
  tutorNotes: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
