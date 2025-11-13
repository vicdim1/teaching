import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeStudentWork } from '@/lib/openai'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// GET all work reviews
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    const where = studentId ? { studentId } : {}

    const workReviews = await prisma.workReview.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        student: true,
      },
    })

    return NextResponse.json(workReviews)
  } catch (error) {
    console.error('Error fetching work reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work reviews' },
      { status: 500 }
    )
  }
}

// POST create new work review with AI analysis
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const studentId = formData.get('studentId') as string
    const description = formData.get('description') as string || ''
    const tutorNotes = formData.get('tutorNotes') as string || ''
    const image = formData.get('image') as File | null

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    let imageUrl: string | null = null
    let aiAnalysis: string | null = null

    if (image) {
      // Save image
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = join(process.cwd(), 'public', 'uploads', filename)
      await writeFile(filepath, buffer)
      imageUrl = `/uploads/${filename}`

      // Get AI analysis
      try {
        const base64 = buffer.toString('base64')
        aiAnalysis = await analyzeStudentWork(base64, description)
      } catch (error) {
        console.error('Error analyzing work:', error)
        aiAnalysis = 'Unable to analyze the image at this time.'
      }
    }

    const workReview = await prisma.workReview.create({
      data: {
        studentId,
        description: description || null,
        tutorNotes: tutorNotes || null,
        imageUrl,
        aiAnalysis,
      },
      include: {
        student: true,
      },
    })

    return NextResponse.json(workReview, { status: 201 })
  } catch (error) {
    console.error('Error creating work review:', error)
    return NextResponse.json(
      { error: 'Failed to create work review' },
      { status: 500 }
    )
  }
}
