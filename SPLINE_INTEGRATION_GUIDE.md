# Spline 3D Component Integration Guide

## Overview
The Spline 3D component has been successfully integrated into your TrackU project. This allows you to embed interactive 3D scenes from Spline design tool.

## Component Structure

### Files Created:
```
/components/ui/
├── splite.tsx              # Main Spline wrapper component
├── spline-demo.tsx         # Example implementation
├── spotlight.tsx           # Spotlight effect component
└── card.tsx               # Card wrapper component
```

## Installation Summary
✅ **Installed Dependencies:**
- `@splinetool/react-spline` - React component wrapper for Spline
- `@splinetool/runtime` - Spline runtime engine
- `framer-motion` - Animation library for spotlight effects

## Usage Examples

### Basic SplineScene Component
```tsx
import { SplineScene } from "@/components/ui/splite";

export function MyComponent() {
  return (
    <SplineScene 
      scene="https://prod.spline.design/YOUR_SCENE_URL/scene.splinecode"
      className="w-full h-[500px]"
    />
  );
}
```

### With Card and Spotlight (Demo Component)
```tsx
import { SplineSceneBasic } from "@/components/ui/spline-demo";

export default function Page() {
  return (
    <div className="p-8">
      <SplineSceneBasic />
    </div>
  );
}
```

### Custom Implementation
```tsx
'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export function CustomSplineIntegration() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="h-[500px] bg-black relative">
        <Spotlight className="-top-40 left-0" fill="white" />
        <div className="p-8 relative z-10">
          <h2 className="text-2xl font-bold text-white">Your Content</h2>
          <p className="text-gray-300 mt-4">Description here</p>
        </div>
      </Card>
      
      <div className="h-[500px]">
        <SplineScene 
          scene="https://prod.spline.design/YOUR_SCENE/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
```

## Props Reference

### SplineScene Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `scene` | string | Yes | Spline scene URL from spline.design |
| `className` | string | No | Tailwind CSS classes for styling |

### Spotlight Props (Aceternity)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | - | Additional CSS classes |
| `fill` | string | "white" | SVG fill color |

### Card Props
Standard HTML div attributes. Components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

## Getting a Spline Scene URL

1. Go to [spline.design](https://spline.design)
2. Create or select a 3D scene
3. Click "Share" → "Generate Link"
4. Copy the `.splinecode` URL
5. Use it in the `scene` prop

### Example URLs:
- `https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode` (Current demo)

## Responsive Behavior
All components are fully responsive:
- Mobile: Single column, full width
- Tablet: Adjusted spacing and sizing
- Desktop: Multi-column layouts with optimized sizing

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Next.js 16+ client components
- Requires JavaScript enabled

## Performance Tips
1. **Lazy Loading**: SplineScene uses React Suspense for lazy loading
2. **Fallback Loading**: Spinner shown while scene loads
3. **Memoization**: Consider using `memo()` for heavy components
4. **Image Optimization**: Keep Spline scene files under 50MB

## Styling Integration with Tailwind
- Uses Tailwind CSS utility classes
- Dark theme by default (bg-black/[0.96])
- Full gradient support for text and backgrounds
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

## Common Customization
```tsx
// Different spotlight color
<Spotlight className="-top-40 left-0" fill="#3B82F6" />

// Different card styling
<Card className="bg-gray-950 border-purple-500/50">

// Custom scene dimensions
<SplineScene scene="..." className="h-screen w-full" />
```

## Troubleshooting

### Scene Not Loading?
- Verify Spline scene URL is correct and accessible
- Check browser console for CORS errors
- Ensure internet connection is stable

### Performance Issues?
- Reduce scene complexity in Spline editor
- Optimize texture sizes
- Use `className` to limit dimensions

### Styling Issues?
- Ensure parent container has defined height
- Check z-index conflicts with other components
- Verify Tailwind CSS is properly configured

## Integration Points in TrackU

### Suggested Pages for Integration:
1. **Dashboard** (`/dashboard`) - 3D stats visualization in hero section
2. **Features Page** (`/features`) - Showcase features with 3D scenes
3. **About Page** (`/about`) - Team/company 3D visualization
4. **Product Page** (`/product`) - Product showcase

### Example: Adding to Dashboard
```tsx
// In app/dashboard/page.tsx
import { SplineSceneBasic } from "@/components/ui/spline-demo";

// Add to your dashboard content
<section className="py-12">
  <SplineSceneBasic />
</section>
```

## Next Steps
1. ✅ Create/get a Spline scene at [spline.design](https://spline.design)
2. ✅ Copy the `.splinecode` URL
3. ✅ Update the `scene` prop in components
4. ✅ Customize styling with Tailwind classes
5. ✅ Deploy and enjoy!

---
**Last Updated:** March 7, 2026
**Component Version:** 1.0.0
**Dependencies:** framer-motion ^12, @splinetool/react-spline ^4
