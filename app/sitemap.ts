import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const routes = [
    '',
    '/about',
    '/attendance',
    '/blog',
    '/company',
    '/contact',
    '/dashboard',
    '/features',
    '/login',
    '/performers',
    '/pricing',
    '/privacy',
    '/product',
    '/register',
    '/security',
    '/terms',
    '/legal',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
