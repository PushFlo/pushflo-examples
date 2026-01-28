'use client'

import type { ConnectionState } from '@pushflo/sdk'

interface ConnectionStatusProps {
  state: ConnectionState
}

const stateConfig: Record<
  ConnectionState,
  { label: string; color: string; bg: string }
> = {
  disconnected: {
    label: 'Disconnected',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  connecting: {
    label: 'Connecting...',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  connected: {
    label: 'Connected',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  error: {
    label: 'Error',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const config = stateConfig[state]

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          state === 'connected'
            ? 'bg-green-500'
            : state === 'connecting'
              ? 'bg-yellow-500 animate-pulse'
              : state === 'error'
                ? 'bg-red-500'
                : 'bg-gray-400'
        }`}
      />
      {config.label}
    </div>
  )
}
