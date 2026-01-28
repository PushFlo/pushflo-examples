'use client'

import { useState, useTransition } from 'react'

interface PublishFormProps {
  onPublish: (data: {
    channel: string
    content: string
    eventType: string
  }) => Promise<void>
}

export function PublishForm({ onPublish }: PublishFormProps) {
  const [channel, setChannel] = useState('notifications')
  const [content, setContent] = useState('{"message": "Hello from Next.js!"}')
  const [eventType, setEventType] = useState('message')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate JSON
    try {
      JSON.parse(content)
    } catch {
      setError('Invalid JSON content')
      return
    }

    startTransition(async () => {
      try {
        await onPublish({ channel, content, eventType })
        setSuccess('Message published successfully!')
        setTimeout(() => setSuccess(null), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to publish message')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="channel"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Channel
        </label>
        <input
          id="channel"
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="notifications"
          required
        />
      </div>

      <div>
        <label
          htmlFor="eventType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Type
        </label>
        <input
          id="eventType"
          type="text"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="message"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Content (JSON)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder='{"message": "Hello!"}'
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Publishing...' : 'Publish Message'}
      </button>
    </form>
  )
}
