import type { ConnectionState } from '@pushflodev/sdk'

interface ConnectionStatusProps {
  state: ConnectionState
}

const stateLabels: Record<ConnectionState, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  connected: 'Connected',
  error: 'Error',
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  return (
    <div className={`status ${state}`}>
      <span className="status-dot" />
      {stateLabels[state]}
    </div>
  )
}
