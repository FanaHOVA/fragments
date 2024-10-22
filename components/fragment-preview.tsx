'use client'

import { FragmentInterpreter } from './fragment-interpreter'
import { FragmentWeb } from './fragment-web'
import { ExecutionResult } from '@/lib/types'

export function FragmentPreview({ 
  results 
}: { 
  results: { [modelId: string]: ExecutionResult } 
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(results).map(([modelId, result]) => (
        <div key={modelId} className="w-full">
          <div className="text-sm font-medium mb-2">{modelId}</div>
          {result.template === 'code-interpreter-v1' ? (
            <FragmentInterpreter result={result} />
          ) : (
            <FragmentWeb result={result} />
          )}
        </div>
      ))}
    </div>
  )
}
