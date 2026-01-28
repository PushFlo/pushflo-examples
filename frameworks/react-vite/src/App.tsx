import { useState, useCallback, useEffect } from 'react'
import type { Message } from '@pushflo/sdk'
import { usePushFlo } from './hooks/usePushFlo'
import { ConnectionStatus } from './components/ConnectionStatus'
import { MessageList } from './components/MessageList'

function App() {
  const [channel, setChannel] = useState('notifications')
  const [messages, setMessages] = useState<Message[]>([])
  const { connectionState, subscribe } = usePushFlo({ debug: true })

  const handleMessage = useCallback((message: Message) => {
    setMessages((prev) => [message, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    if (connectionState !== 'connected') {
      return
    }

    const unsubscribe = subscribe(channel, handleMessage)
    return unsubscribe
  }, [channel, connectionState, subscribe, handleMessage])

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannel(e.target.value)
    setMessages([])
  }

  return (
    <div className="container">
      <h1>PushFlo + React + Vite</h1>
      <p className="description">
        Real-time messaging with WebSocket subscriptions. Messages appear
        instantly when published to the channel.
      </p>

      <div className="card">
        <div className="status-bar">
          <ConnectionStatus state={connectionState} />
          <div className="channel-input">
            <label htmlFor="channel">Channel:</label>
            <input
              id="channel"
              type="text"
              value={channel}
              onChange={handleChannelChange}
              placeholder="notifications"
            />
          </div>
        </div>

        <MessageList messages={messages} />
      </div>

      <div className="info-box">
        <h3>How it works</h3>
        <ul>
          <li>
            The <code>usePushFlo</code> hook connects via WebSocket using your
            publish key
          </li>
          <li>
            Subscribe to channels to receive messages in real-time
          </li>
          <li>
            Publish messages from your backend using the secret key
          </li>
          <li>
            All subscribers receive messages instantly
          </li>
        </ul>
      </div>

      <div className="links">
        <a
          href="https://github.com/pushflo/examples/tree/main/frameworks/react-vite"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source
        </a>
        {' | '}
        <a
          href="https://docs.pushflo.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </a>
        {' | '}
        <a
          href="https://console.pushflo.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get API keys
        </a>
      </div>
    </div>
  )
}

export default App
