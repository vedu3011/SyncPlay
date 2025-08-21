import { useState } from "react"

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">🎵 JamSocial</h1>
      <p className="mb-4">Phase 0 Frontend Setup Working!</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        onClick={() => setCount(count + 1)}
      >
        Count: {count}
      </button>
    </div>
  )
}
