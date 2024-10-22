import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useState } from "react"
import { LLMModelConfig } from "@/lib/models"

export function CustomModelDialog({
  open,
  onOpenChange,
  onSave,
  existingConfig,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: LLMModelConfig) => void
  existingConfig?: LLMModelConfig
}) {
  const [config, setConfig] = useState<LLMModelConfig>(existingConfig || {
    model: "",
    provider: "",
    baseURL: "",
    apiKey: "",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Model Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              placeholder="Model Name"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
            />
            <Input
              placeholder="Provider"
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
            />
            <Input
              placeholder="Base URL"
              value={config.baseURL}
              onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
            />
            <Input
              type="password"
              placeholder="API Key"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={() => {
          onSave(config)
          onOpenChange(false)
        }}>
          Save Configuration
        </Button>
      </DialogContent>
    </Dialog>
  )
}
