import { Check } from 'lucide-react'
import SEO from '../components/SEO'
import { PAGES } from '../seo.config'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'border-gray-700',
    btnClass: 'bg-gray-800 hover:bg-gray-700 text-white',
    features: [
      'Unlimited P2P transfers',
      'Up to 4 GB per file',
      '6-digit code + QR + link',
      'All devices supported',
      'Files never stored on server',
    ],
    missing: ['Ad-free experience', 'Transfer history', 'Priority relay servers'],
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: 'per month',
    color: 'border-cyan-500',
    badge: 'Most Popular',
    btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold',
    features: [
      'Everything in Free',
      'Unlimited file size',
      'Ad-free experience',
      '30-day transfer history',
      'Priority relay servers',
      'Faster transfers',
      'Email support',
    ],
    missing: [],
  },
]

export default function Pricing() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <SEO page={PAGES.pricing} />
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold">Simple, honest pricing</h1>
        <p className="text-gray-400">Start free. Upgrade only when you need more.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div key={plan.name} className={`relative rounded-2xl border-2 ${plan.color} bg-gray-900 p-8 space-y-6`}>
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-black text-xs font-bold">
                {plan.badge}
              </span>
            )}
            <div>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-gray-400 text-sm mb-1">/{plan.period}</span>
              </div>
            </div>

            <button className={`w-full py-3 rounded-xl transition ${plan.btnClass}`}>
              {plan.name === 'Free' ? 'Start for Free' : 'Get Premium'}
            </button>

            <ul className="space-y-2.5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={15} className="text-green-400 shrink-0" /> {f}
                </li>
              ))}
              {plan.missing.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 line-through">
                  <Check size={15} className="shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-600 text-sm">
        No credit card required for free plan · Cancel anytime · 7-day money back guarantee
      </p>
    </div>
  )
}
