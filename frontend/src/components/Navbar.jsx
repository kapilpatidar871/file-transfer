import { Link } from 'react-router-dom'
import { Share2 } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <Share2 className="text-cyan-400" size={22} />
          FileShare
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/receive" className="text-gray-400 hover:text-white transition">Receive</Link>
          <Link to="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
          <Link
            to="/pricing"
            className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
          >
            Go Premium
          </Link>
        </div>
      </div>
    </nav>
  )
}
