import { useEffect, useRef, useState, useCallback } from 'react'
import { PushFloClient, type Message, type ConnectionState } from '@pushflodev/sdk'

interface UsePushFloOptions {
  debug?: boolean
  autoConnect?: boolean
}

interface UsePushFloReturn {
  connectionState: ConnectionState
  connect: () => Promise<void>
  disconnect: () => void
  subscribe: (channel: string, onMessage: (message: Message) => void) => () => void
  client: PushFloClient | null
}

export function usePushFlo(options: UsePushFloOptions = {}): UsePushFloReturn {
  const { debug = false, autoConnect = true } = options

  const clientRef = useRef<PushFloClient | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')

  useEffect(() => {
    const publishKey = import.meta.env.VITE_PUSHFLO_PUBLISH_KEY
    const baseUrl = import.meta.env.VITE_PUSHFLO_BASE_URL

    if (!publishKey) {
      console.error(
        'VITE_PUSHFLO_PUBLISH_KEY is required. Get your key at https://console.pushflo.dev/credentials'
      )
      return
    }

    const client = new PushFloClient({
      publishKey,
      baseUrl,
      debug,
    })

    clientRef.current = client

    const unsubscribe = client.onConnectionChange((state) => {
      setConnectionState(state)
    })

    // Workaround for SDK bug: SDK expects message.message but server sends flat structure
    // Listen to raw WebSocket messages via wsManager
    const wsManager = (client as any).wsManager
    if (wsManager) {
      wsManager.on('message', (rawMsg: any) => {
        // Handle the flat message format that the SDK doesn't handle correctly
        if (rawMsg.type === 'message' && rawMsg.channel && !rawMsg.message) {
          // Server sends: { type, channel, messageId, data, eventType, clientId, timestamp }
          // SDK expects: { type, channel, message: { id, content, eventType, clientId, timestamp } }
          const normalizedMessage = {
            id: rawMsg.messageId || rawMsg.id,
            channel: rawMsg.channel,
            eventType: rawMsg.eventType,
            clientId: rawMsg.clientId,
            content: rawMsg.data || rawMsg.content,
            timestamp: rawMsg.timestamp,
          }
          // Manually dispatch to subscriptions
          const subscriptions = (client as any).subscriptions
          if (subscriptions) {
            subscriptions.handleMessage(normalizedMessage)
          }
          const emitter = client as any
          emitter.emit('message', normalizedMessage)
        }
      })
    }

    if (autoConnect) {
      client.connect().catch((error) => {
        console.error('Failed to connect to PushFlo:', error)
      })
    }

    return () => {
      unsubscribe()
      client.disconnect()
      clientRef.current = null
    }
  }, [debug, autoConnect])

  const connect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
    }
  }, [])

  const subscribe = useCallback(
    (channel: string, onMessage: (message: Message) => void) => {
      if (!clientRef.current) {
        console.warn('PushFlo client not initialized')
        return () => {}
      }

      const subscription = clientRef.current.subscribe(channel, { onMessage })
      return subscription.unsubscribe
    },
    []
  )

  return {
    connectionState,
    connect,
    disconnect,
    subscribe,
    client: clientRef.current,
  }
}
