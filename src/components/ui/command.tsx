"use client"

import * as React from "react"
import {
  Command as CommandPrimitive,
  CommandDialog,
} from "cmdk"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentProps<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-none bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName ?? "Command"

const CommandInputWrapper = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentProps<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-border px-3">
    <MagnifyingGlassIcon className="mr-2 size-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))
CommandInputWrapper.displayName = CommandPrimitive.Input.displayName ?? "CommandInput"

const CommandListWrapper = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentProps<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
CommandListWrapper.displayName = CommandPrimitive.List.displayName ?? "CommandList"

const CommandEmptyWrapper = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
))
CommandEmptyWrapper.displayName = CommandPrimitive.Empty.displayName ?? "CommandEmpty"

const CommandGroupWrapper = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentProps<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))
CommandGroupWrapper.displayName = CommandPrimitive.Group.displayName ?? "CommandGroup"

const CommandItemWrapper = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentProps<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-none px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
CommandItemWrapper.displayName = CommandPrimitive.Item.displayName ?? "CommandItem"

const CommandSeparatorWrapper = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentProps<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparatorWrapper.displayName = CommandPrimitive.Separator.displayName ?? "CommandSeparator"

function CommandDialogWrapper({
  children,
  ...props
}: React.ComponentProps<typeof CommandDialog>) {
  return (
    <CommandDialog
      {...props}
      contentClassName="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-popover p-0 shadow-lg"
      overlayClassName="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
    >
      {children}
    </CommandDialog>
  )
}

export {
  Command,
  CommandDialogWrapper as CommandDialog,
  CommandEmptyWrapper as CommandEmpty,
  CommandGroupWrapper as CommandGroup,
  CommandInputWrapper as CommandInput,
  CommandItemWrapper as CommandItem,
  CommandListWrapper as CommandList,
  CommandSeparatorWrapper as CommandSeparator,
}
