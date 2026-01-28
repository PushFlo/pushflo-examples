'use client'

import type { Message } from '@pushflodev/sdk'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No messages yet. Send one using the form below!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {message.eventType}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <pre className="text-sm text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(message.content, null, 2)}
          </pre>
          <div className="mt-2 text-xs text-gray-400">
            From: {message.clientId} | ID: {message.id}
          </div>
        </div>
      ))}
    </div>
  )
}
