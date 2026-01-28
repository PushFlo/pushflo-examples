'use client'

/**
 * React hook for PushFlo real-time messaging
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { PushFloClient, type Message, type ConnectionState } from '@pushflo/sdk'

interface UsePushFloOptions {
  /** Enable debug logging */
  debug?: boolean
  /** Auto-connect on mount */
  autoConnect?: boolean
}

interface UsePushFloReturn {
  /** Current connection state */
  connectionState: ConnectionState
  /** Connect to PushFlo */
  connect: () => Promise<void>
  /** Disconnect from PushFlo */
  disconnect: () => void
  /** Subscribe to a channel */
  subscribe: (
    channel: string,
    onMessage: (message: Message) => void
  ) => () => void
  /** Client instance for advanced usage */
  client: PushFloClient | null
}

export function usePushFlo(options: UsePushFloOptions = {}): UsePushFloReturn {
  const { debug = false, autoConnect = true } = options

  const clientRef = useRef<PushFloClient | null>(null)
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected')

  // Initialize client
  useEffect(() => {
    const publishKey = process.env.NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY
    const baseUrl = process.env.NEXT_PUBLIC_PUSHFLO_BASE_URL

    if (!publishKey) {
      console.error(
        'NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY is required. Get your key at https://console.pushflo.dev/credentials'
      )
      return
    }

    const client = new PushFloClient({
      publishKey,
      baseUrl,
      debug,
    })

    clientRef.current = client

    // Listen for connection state changes
    const unsubscribe = client.onConnectionChange((state) => {
      setConnectionState(state)
    })

    // Auto-connect if enabled
    if (autoConnect) {
      client.connect().catch((error) => {
        console.error('Failed to connect to PushFlo:', error)
      })
    }

    // Cleanup on unmount
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

      const subscription = clientRef.current.subscribe(channel, {
        onMessage,
      })

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

/**
 * Hook for subscribing to a specific channel
 */
export function useChannel(
  channel: string,
  onMessage: (message: Message) => void
) {
  const { connectionState, subscribe, client } = usePushFlo()

  useEffect(() => {
    if (connectionState !== 'connected') {
      return
    }

    const unsubscribe = subscribe(channel, onMessage)
    return unsubscribe
  }, [channel, connectionState, onMessage, subscribe])

  return { connectionState, client }
}
