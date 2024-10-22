import { Duration } from '@/lib/duration'
import { getModelClient, getDefaultMode } from '@/lib/models'
import { LLMModel, LLMModelConfig } from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import ratelimit from '@/lib/ratelimit'
import { fragmentSchema as schema } from '@/lib/schema'
import { Templates } from '@/lib/templates'
import { streamObject, LanguageModel, CoreMessage } from 'ai'

export const maxDuration = 60

const rateLimitMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 10
const ratelimitWindow = process.env.RATE_LIMIT_WINDOW
  ? (process.env.RATE_LIMIT_WINDOW as Duration)
  : '1d'

export async function POST(req: Request) {
  const {
    messages,
    userID,
    template,
    modelConfigs,
  }: {
    messages: CoreMessage[]
    userID: string
    template: Templates
    modelConfigs: Array<{
      model: LLMModel
      config: LLMModelConfig
    }>
  } = await req.json()

  console.log('modelConfigs', modelConfigs)
  // Check rate limit using the most permissive config
  const shouldCheckRateLimit = modelConfigs.every((mc) => !mc.config.apiKey)
  const limit = shouldCheckRateLimit
    ? await ratelimit(
        userID,
        rateLimitMaxRequests,
        ratelimitWindow,
      )
    : false

  if (limit) {
    return new Response('You have reached your request limit for the day.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.amount.toString(),
        'X-RateLimit-Remaining': limit.remaining.toString(),
        'X-RateLimit-Reset': limit.reset.toString(),
      },
    })
  }

  // Validate all models have a default mode
  for (const { model } of modelConfigs) {
    const mode = getDefaultMode(model)
    console.log('model', model)
    console.log('mode', mode)

    if (!mode) {
      console.error(`Model ${model.id} does not have a default generation mode.`)
      return new Response(`Model ${model.name} is misconfigured. Please contact support.`, {
        status: 500,
      })
    }
  }

  const responses = await Promise.all(
    modelConfigs.map(async ({ model, config }) => {
      const modelClient = getModelClient(model, config)
      const mode = getDefaultMode(model)!

      const stream = await streamObject({
        model: modelClient as LanguageModel,
        schema,
        system: toPrompt(template),
        messages,
        mode,
        ...config,
      })

      const response = await stream.toTextStreamResponse()
      const result = await response.json()

      return {
        modelId: model.id,
        ...result,
      }
    })
  )

  return new Response(JSON.stringify(responses), {
    headers: { 'Content-Type': 'application/json' },
  })
}
