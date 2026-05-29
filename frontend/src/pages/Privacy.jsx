import SEO from '../components/SEO'
import { SITE } from '../seo.config'

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <SEO page={{
        title: `Privacy Policy — ${SITE.name}`,
        description: 'Privacy policy for FileShare P2P file transfer service.',
      }} />

      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="text-gray-400 text-sm">Last updated: May 2026</p>

      {[
        {
          title: 'No File Storage',
          body: 'FileShare uses peer-to-peer (WebRTC) technology. Your files are transferred directly between devices and never uploaded to or stored on our servers. We have no access to your file content.',
        },
        {
          title: 'Signaling Data',
          body: 'To establish a P2P connection, our signaling server temporarily processes connection metadata (not file content). This data is discarded immediately after the connection is established.',
        },
        {
          title: 'Cookies & Analytics',
          body: 'We use Google Analytics to understand how users interact with the site (page views, session duration). No personally identifiable information is collected. We also use Google AdSense to display advertisements, which may use cookies.',
        },
        {
          title: 'Google AdSense',
          body: 'We use Google AdSense to show advertisements. Google may use cookies to show personalized ads based on your browsing history. You can opt out at https://www.google.com/settings/ads.',
        },
        {
          title: 'No Account Required',
          body: 'FileShare does not require registration or account creation. We do not collect your name, email, or any personal information for basic usage.',
        },
        {
          title: 'Contact',
          body: `For privacy questions, contact us at privacy@yourdomain.com`,
        },
      ].map(({ title, body }) => (
        <section key={title} className="space-y-2">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-gray-400 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  )
}
