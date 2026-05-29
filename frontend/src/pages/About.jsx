import SEO from '../components/SEO'
import { SITE } from '../seo.config'
import { Share2, Shield, Zap, Globe } from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <SEO page={{
        title: `About ${SITE.name} — Free P2P File Transfer`,
        description: 'FileShare is a free, browser-based P2P file transfer service. No signup, no cloud, no limits.',
      }} />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Share2 className="text-cyan-400" size={32} />
          <h1 className="text-3xl font-bold text-white">About FileShare</h1>
        </div>
        <p className="text-gray-400 leading-relaxed">
          FileShare is a free, browser-based peer-to-peer file transfer service.
          Send files of any size directly between devices — no account, no cloud upload,
          no file size limits on the free tier.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {[
          { icon: Shield, color: 'text-cyan-400',   title: 'Private by Design',  desc: 'Files never touch our servers. Pure P2P via WebRTC.' },
          { icon: Zap,    color: 'text-yellow-400', title: 'No Signup Needed',   desc: 'Open the site, drop your file, share the code. Done.' },
          { icon: Globe,  color: 'text-purple-400', title: 'Works Everywhere',   desc: 'Any browser, any OS, any device. No app required.' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 space-y-2">
            <Icon className={color} size={24} />
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">How it works</h2>
        {[
          'Sender selects files and clicks Send — gets a 6-digit code',
          'Receiver enters the code at fileshare.com/receive',
          'A direct WebRTC connection is established between both devices',
          'Files transfer device-to-device at full speed — server never sees your data',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-gray-400">{step}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p className="text-gray-400">Questions or feedback? Email us at <span className="text-cyan-400">hello@yourdomain.com</span></p>
      </section>
    </div>
  )
}
