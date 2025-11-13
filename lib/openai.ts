import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeStudentWork(
  imageBase64: string,
  description: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an experienced tutor analyzing student work. Provide constructive feedback including:
- What the student did well
- Areas for improvement
- Specific suggestions for next steps
- Concepts that may need reinforcement

Be encouraging, specific, and educational in your analysis.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this student work. ${description ? `Context: ${description}` : ''}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    return response.choices[0]?.message?.content || 'Unable to analyze the image.'
  } catch (error) {
    console.error('Error analyzing student work:', error)
    throw new Error('Failed to analyze student work')
  }
}
