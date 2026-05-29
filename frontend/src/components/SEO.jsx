import { Helmet } from 'react-helmet-async'
import { SITE } from '../seo.config'

/**
 * Usage:
 *   import SEO from '../components/SEO'
 *   import { PAGES } from '../seo.config'
 *
 *   <SEO page={PAGES.home} />
 */
export default function SEO({ page }) {
  const title       = page.title       || SITE.tagline
  const description = page.description || ''
  const keywords    = (page.keywords   || []).join(', ')
  const ogTitle     = page.og?.title       || title
  const ogDesc      = page.og?.description || description
  const ogImage     = page.og?.image       || SITE.logo
  const canonical   = page.canonical       || ''

  return (
    <Helmet>
      {/* Primary */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={`${SITE.url}${canonical}`} />}

      {/* Open Graph (WhatsApp, Facebook, LinkedIn previews) */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE.name} />
      <meta property="og:title"       content={ogTitle} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:image"       content={ogImage} />

      {/* Twitter card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={SITE.twitterHandle} />
      <meta name="twitter:title"       content={ogTitle} />
      <meta name="twitter:description" content={ogDesc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
    </Helmet>
  )
}
