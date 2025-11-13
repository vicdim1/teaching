import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sessionSchema } from '@/lib/validations'

// GET all sessions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        student: true,
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST create new session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = sessionSchema.parse(body)

    const session = await prisma.session.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      },
      include: {
        student: true,
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
