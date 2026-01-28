import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PushFlo + Next.js
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time messaging built on Cloudflare&apos;s edge network. This
          example demonstrates WebSocket subscriptions, server-side publishing,
          and React hooks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/messages"
          className="block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Real-time Messages
          </h2>
          <p className="text-gray-600">
            Subscribe to channels and see messages appear in real-time. Publish
            messages using Server Actions.
          </p>
        </Link>

        <a
          href="https://console.pushflo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Get API Keys
          </h2>
          <p className="text-gray-600">
            Sign up at console.pushflo.dev to get your publish and secret keys
            for this example.
          </p>
        </a>
      </div>

      <div className="mt-12 p-6 bg-gray-900 rounded-xl">
        <h3 className="text-white font-semibold mb-3">Quick Setup</h3>
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code>{`# Copy environment template
cp env.example .env.local

# Add your keys to .env.local
PUSHFLO_SECRET_KEY=sec_xxxxxxxxxxxxx
NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx

# Run the development server
npm run dev`}</code>
        </pre>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <a
          href="https://github.com/PushFlo/pushflo-examples/tree/main/frameworks/nextjs"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600"
        >
          View source on GitHub
        </a>
        <span className="mx-2">|</span>
        <a
          href="https://docs.pushflo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600"
        >
          Documentation
        </a>
      </div>
    </main>
  )
}
