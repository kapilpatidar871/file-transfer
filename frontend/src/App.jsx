import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Receive from './pages/Receive'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Privacy from './pages/Privacy'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/receive"         element={<Receive />} />
          <Route path="/receive/:code"   element={<Receive />} />
          <Route path="/pricing"         element={<Pricing />} />
          <Route path="/about"           element={<About />} />
          <Route path="/privacy"         element={<Privacy />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-800 py-6 text-sm text-gray-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 FileShare · Free P2P File Transfer</span>
          <div className="flex gap-5">
            <Link to="/about"   className="hover:text-gray-400 transition">About</Link>
            <Link to="/pricing" className="hover:text-gray-400 transition">Pricing</Link>
            <Link to="/privacy" className="hover:text-gray-400 transition">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
