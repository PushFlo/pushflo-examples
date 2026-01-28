import type { Message } from '@pushflo/sdk'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        No messages yet. Waiting for real-time messages...
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className="message-item">
          <div className="message-header">
            <span className="message-type">{message.eventType}</span>
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content">
            {JSON.stringify(message.content, null, 2)}
          </div>
          <div className="message-footer">
            From: {message.clientId} | ID: {message.id}
          </div>
        </div>
      ))}
    </div>
  )
}
