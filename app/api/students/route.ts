import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { studentSchema } from '@/lib/validations'

// GET all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { active: 'desc' },
        { firstName: 'asc' },
      ],
      include: {
        _count: {
          select: {
            sessions: true,
            invoices: true,
          },
        },
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST create new student
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = studentSchema.parse(body)

    const student = await prisma.student.create({
      data: validatedData,
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
