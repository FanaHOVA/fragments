import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LLMModel, LLMModelConfig } from '@/lib/models'
import { TemplateId, Templates } from '@/lib/templates'
import 'core-js/features/object/group-by.js'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { CustomModelDialog } from './custom-model-dialog'

export function ChatPicker({
  templates,
  selectedTemplate,
  onSelectedTemplateChange,
  models,
  primaryModel,
  secondaryModel,
  onModelChange,
}: {
  templates: Templates
  selectedTemplate: 'auto' | TemplateId
  onSelectedTemplateChange: (template: 'auto' | TemplateId) => void
  models: LLMModel[]
  primaryModel: LLMModelConfig
  secondaryModel: LLMModelConfig
  onModelChange: (config: LLMModelConfig, isPrimary: boolean) => void
}) {
  const [customModelOpen, setCustomModelOpen] = useState(false)
  const [isCustomizingPrimary, setIsCustomizingPrimary] = useState(true)

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex flex-col">
          <Select
            name="template"
            defaultValue={selectedTemplate}
            onValueChange={onSelectedTemplateChange}
          >
            <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
              <SelectValue placeholder="Select a persona" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                <SelectLabel>Persona</SelectLabel>
                <SelectItem value="auto">
                  <div className="flex items-center space-x-2">
                    <Sparkles
                      className="flex text-[#a1a1aa]"
                      width={14}
                      height={14}
                    />
                    <span>Auto</span>
                  </div>
                </SelectItem>
                {Object.entries(templates).map(([templateId, template]) => (
                  <SelectItem key={templateId} value={templateId}>
                    <div className="flex items-center space-x-2">
                      <Image
                        className="flex"
                        src={`/thirdparty/templates/${templateId}.svg`}
                        alt={templateId}
                        width={14}
                        height={14}
                      />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Model Selector */}
        <div className="flex flex-col">
          <Select
            name="primaryModel"
            defaultValue={primaryModel.model}
            onValueChange={(e) => {
              const selectedModel = models.find(m => m.id === e)
              if (selectedModel?.isCustom) {
                setIsCustomizingPrimary(true)
                setCustomModelOpen(true)
              } else {
                onModelChange({ ...primaryModel, model: e }, true)
              }
            }}
          >
            <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
              <SelectValue placeholder="Primary Model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                Object.groupBy(models, ({ provider }) => provider),
              ).map(([provider, modelsGroup]) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {modelsGroup?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center space-x-2">
                        <Image
                          className="flex"
                          src={`/thirdparty/logos/${model.providerId}.svg`}
                          alt={model.provider}
                          width={14}
                          height={14}
                        />
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Secondary Model Selector */}
        <div className="flex flex-col">
          <Select
            name="secondaryModel"
            defaultValue={secondaryModel.model}
            onValueChange={(e) => {
              const selectedModel = models.find(m => m.id === e)
              if (selectedModel?.isCustom) {
                setIsCustomizingPrimary(false)
                setCustomModelOpen(true)
              } else {
                onModelChange({ ...secondaryModel, model: e }, false)
              }
            }}
          >
            <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
              <SelectValue placeholder="Secondary Model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                Object.groupBy(models, ({ provider }) => provider),
              ).map(([provider, modelsGroup]) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {modelsGroup?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center space-x-2">
                        <Image
                          className="flex"
                          src={`/thirdparty/logos/${model.providerId}.svg`}
                          alt={model.provider}
                          width={14}
                          height={14}
                        />
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CustomModelDialog
        open={customModelOpen}
        onOpenChange={setCustomModelOpen}
        onSave={(config) => {
          onModelChange(config, isCustomizingPrimary)
        }}
        existingConfig={isCustomizingPrimary ? primaryModel : secondaryModel}
      />
    </>
  )
}
