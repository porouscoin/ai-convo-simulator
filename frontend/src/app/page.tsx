import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase">
            AI Conversation Simulator
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            A flight simulator
            <br />
            <span className="text-indigo-400">for real-life conversations.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Practice salary negotiations, job interviews, sales calls, and
            difficult conversations with realistic AI personalities before they happen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Start Practicing Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-2xl mb-3">??</div>
            <h3 className="font-semibold text-white mb-2">Realistic AI Personas</h3>
            <p className="text-gray-400 text-sm">
              The AI plays the other person with their personality, emotional
              reactions, and resistance level.
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-2xl mb-3">?</div>
            <h3 className="font-semibold text-white mb-2">Real-Time Pushback</h3>
            <p className="text-gray-400 text-sm">
              The AI adapts dynamically to your responses � challenges weak
              arguments and rewards strong ones.
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-2xl mb-3">??</div>
            <h3 className="font-semibold text-white mb-2">Actionable Feedback</h3>
            <p className="text-gray-400 text-sm">
              After each session, get specific feedback on what worked, what
              did not, and better responses you could have used.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
