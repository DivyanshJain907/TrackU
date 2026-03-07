'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card, CardContent } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export default function SplineIntegrationExample() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-black to-purple-950"></div>
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', opacity: Math.random() * 0.7 + 0.3, animation: `twinkle ${Math.random() * 3 + 2}s infinite`}}></div>
          ))}
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-5xl font-bold bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              3D Interactive Showcase
            </h1>
            <p className="text-purple-200 text-sm font-semibold mt-2">
              Experience immersive 3D scenes with Spline
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Section 1: Basic Spline Scene */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Basic 3D Scene</h2>
            <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
              <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
              />
              
              <div className="flex h-full">
                {/* Left content */}
                <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                  <h3 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                    Interactive 3D
                  </h3>
                  <p className="mt-4 text-neutral-300 max-w-lg">
                    Bring your UI to life with beautiful 3D scenes. Create immersive experiences 
                    that capture attention and enhance your design.
                  </p>
                </div>

                {/* Right content - 3D Scene */}
                <div className="flex-1 relative">
                  <SplineScene 
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Section 2: Multiple Scenes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Scene Variations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Scene 1 */}
              <Card className="h-[350px] bg-black/[0.96] relative overflow-hidden">
                <Spotlight className="-top-20 left-0" fill="white" />
                <div className="p-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white">Scene 1</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Your custom 3D scene goes here
                  </p>
                </div>
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="absolute inset-0"
                />
              </Card>

              {/* Scene 2 */}
              <Card className="h-[350px] bg-black/[0.96] relative overflow-hidden">
                <Spotlight className="-top-20 right-0" fill="white" />
                <div className="p-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white">Scene 2</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Another interactive 3D moment
                  </p>
                </div>
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="absolute inset-0"
                />
              </Card>
            </div>
          </section>

          {/* Section 3: Information Cards */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Design with Spline",
                  description: "Create beautiful 3D scenes using Spline's intuitive design tool"
                },
                {
                  title: "Get Scene URL",
                  description: "Export your scene and get the unique splinecode URL"
                },
                {
                  title: "Integrate to React",
                  description: "Use the SplineScene component to embed 3D in your app"
                }
              ].map((item, i) => (
                <Card key={i} className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Section 4: Code Example */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Usage Example</h2>
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 p-6">
              <pre className="text-gray-300 text-sm overflow-x-auto">
{`import { SplineScene } from "@/components/ui/splite";

export function MyComponent() {
  return (
    <SplineScene 
      scene="https://prod.spline.design/YOUR_SCENE/scene.splinecode"
      className="w-full h-[500px]"
    />
  );
}`}
              </pre>
            </Card>
          </section>

          {/* Call to Action */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Add 3D?</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Create your own 3D scenes at Spline.design and integrate them into your TrackU application
                using the SplineScene component.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="https://spline.design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Visit Spline
                </a>
                <a
                  href="#"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Learn More
                </a>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
