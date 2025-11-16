import OpenAI from 'openai'

// Check if API key is available
const apiKey = process.env.OPENAI_API_KEY

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
}) : null

export async function analyzeStudentWork(
  imageBase64: string,
  description: string
): Promise<string> {
  if (!openai) {
    return 'AI analysis is not available. Please add an OpenAI API key to enable this feature.'
  }

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
