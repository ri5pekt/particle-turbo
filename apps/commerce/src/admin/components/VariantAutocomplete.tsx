import { Text } from "@medusajs/ui"
import type { ReactElement } from "react"
import { useState } from "react"

export type VariantOption = {
  id: string
  label: string
}

type VariantAutocompleteProps = {
  label: string
  helperText?: string
  options: VariantOption[]
  selectedIds: string[]
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  emptySelectionLabel?: string
  onChange: (ids: string[]) => void
}

const labelClassName = "grid gap-1 text-ui-fg-subtle"

export const VariantAutocomplete = ({
  label,
  helperText,
  options,
  selectedIds,
  multiple = false,
  disabled = false,
  placeholder = "Search products...",
  emptySelectionLabel = "No products selected",
  onChange,
}: VariantAutocompleteProps): ReactElement => {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const selectedOptions = selectedIds
    .map((id) => options.find((option) => option.id === id) || { id, label: id })
  const normalizedSearch = search.trim().toLowerCase()
  const filteredOptions = options
    .filter((option) => {
      if (!normalizedSearch) {
        return true
      }

      return option.label.toLowerCase().includes(normalizedSearch)
        || option.id.toLowerCase().includes(normalizedSearch)
    })
    .slice(0, 30)

  const toggleOption = (optionId: string) => {
    if (!multiple) {
      onChange([optionId])
      setSearch("")
      setIsOpen(false)
      return
    }

    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId))
      return
    }

    onChange([...selectedIds, optionId])
    setSearch("")
  }

  const removeOption = (optionId: string) => {
    onChange(selectedIds.filter((id) => id !== optionId))
  }

  return (
    <div className={labelClassName} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setIsOpen(false)
      }
    }}>
      <div>{label}</div>

      <div className="rounded-md border border-ui-border-base bg-ui-bg-base">
        <div className="flex flex-wrap gap-2 border-b border-ui-border-base p-2">
          {selectedOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="rounded-full bg-ui-bg-subtle px-3 py-1 text-left text-ui-fg-base"
              onClick={() => removeOption(option.id)}
            >
              {option.label} x
            </button>
          ))}
          {!selectedOptions.length && (
            <Text className="px-1 py-1 text-ui-fg-muted">{emptySelectionLabel}</Text>
          )}
        </div>

        <input
          className="w-full border-0 bg-ui-bg-field px-3 py-2 text-ui-fg-base outline-none"
          value={search}
          disabled={disabled}
          placeholder={disabled ? "Loading products..." : placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value)
            setIsOpen(true)
          }}
        />

        {isOpen && (
          <div className="max-h-60 overflow-y-auto border-t border-ui-border-base">
            {filteredOptions.map((option) => {
              const isSelected = selectedIds.includes(option.id)

              return (
                <button
                  key={option.id}
                  type="button"
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-ui-fg-base hover:bg-ui-bg-subtle",
                    isSelected ? "bg-ui-bg-subtle" : "",
                  ].join(" ")}
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => toggleOption(option.id)}
                >
                  <span>{option.label}</span>
                  {isSelected && <span className="text-ui-fg-interactive">Selected</span>}
                </button>
              )
            })}

            {!filteredOptions.length && (
              <Text className="px-3 py-3 text-ui-fg-muted">No matching products found.</Text>
            )}
          </div>
        )}
      </div>

      {helperText && <Text className="text-ui-fg-muted">{helperText}</Text>}
    </div>
  )
}
