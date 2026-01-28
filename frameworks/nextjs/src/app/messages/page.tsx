'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Message } from '@pushflo/sdk'
import { usePushFlo } from '@/hooks/use-pushflo'
import { ConnectionStatus } from '@/components/connection-status'
import { MessageList } from '@/components/message-list'
import { PublishForm } from '@/components/publish-form'
import { publishMessageAction } from './actions'

export default function MessagesPage() {
  const [channel, setChannel] = useState('notifications')
  const [messages, setMessages] = useState<Message[]>([])
  const { connectionState, subscribe } = usePushFlo()

  // Subscribe to channel and handle messages
  const handleMessage = useCallback((message: Message) => {
    setMessages((prev) => [message, ...prev].slice(0, 50)) // Keep last 50 messages
  }, [])

  // Subscribe when connected
  useState(() => {
    if (connectionState === 'connected') {
      return subscribe(channel, handleMessage)
    }
  })

  // Re-subscribe when channel changes
  const handleChannelChange = (newChannel: string) => {
    setChannel(newChannel)
    setMessages([]) // Clear messages when switching channels

    if (connectionState === 'connected') {
      // The old subscription is cleaned up automatically
      subscribe(newChannel, handleMessage)
    }
  }

  // Handle publish via server action
  const handlePublish = async (data: {
    channel: string
    content: string
    eventType: string
  }) => {
    await publishMessageAction(data.channel, data.content, data.eventType)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Real-time Messages
          </h1>
        </div>
        <ConnectionStatus state={connectionState} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Incoming Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Incoming Messages
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="subscribe-channel" className="text-sm text-gray-600">
                Channel:
              </label>
              <input
                id="subscribe-channel"
                type="text"
                value={channel}
                onChange={(e) => handleChannelChange(e.target.value)}
                className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            <MessageList messages={messages} />
          </div>
        </div>

        {/* Right: Publish Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Publish Message
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Messages are published via a Server Action and broadcast to all
            subscribers.
          </p>
          <PublishForm onPublish={handlePublish} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            1. The <code className="bg-blue-100 px-1 rounded">usePushFlo</code>{' '}
            hook connects via WebSocket using your publish key
          </li>
          <li>
            2. Subscribe to channels to receive real-time messages
          </li>
          <li>
            3. Use the Server Action to publish messages securely with your
            secret key
          </li>
          <li>
            4. Messages are broadcast to all connected subscribers instantly
          </li>
        </ul>
      </div>
    </main>
  )
}
