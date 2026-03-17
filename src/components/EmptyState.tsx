import { ArrowUpRightIcon } from "@phosphor-icons/react"

type EmptyStateProps = {
  onEditClick?: () => void
}

export function EmptyState({ onEditClick }: EmptyStateProps) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 px-6">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Your command center is empty. Click Edit to add your first section.
      </p>
      <div className="flex flex-col items-center gap-4">
        <ArrowUpRightIcon
          className="size-12 text-muted-foreground"
          weight="bold"
          aria-hidden
        />
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}
