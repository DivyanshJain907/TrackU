'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card, CardContent } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export default function SplineIntegrationExample() {
  return (
    <div className="min-h-screen bg-[#f3fff9]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_12px_36px_rgba(0,0,0,0.07)]">
          <h1 className="text-4xl font-bold text-[#1d2623] md:text-5xl">3D Interactive Showcase</h1>
          <p className="mt-3 text-sm font-semibold text-[#5f6a66] md:text-base">
            Experience immersive 3D scenes with Spline
          </p>
        </div>

        <div>
          {/* Section 1: Basic Spline Scene */}
          <section className="mb-12">
            <h2 className="mb-8 text-3xl font-bold text-[#1d2623]">Basic 3D Scene</h2>
            <Card className="relative h-125 w-full overflow-hidden border-[#d7e9e1] bg-[#0f1513]">
              <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
              />
              
              <div className="flex h-full">
                {/* Left content */}
                <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                  <h3 className="bg-linear-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
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
            <h2 className="mb-8 text-3xl font-bold text-[#1d2623]">Scene Variations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Scene 1 */}
              <Card className="relative h-87.5 overflow-hidden border-[#d7e9e1] bg-[#0f1513]">
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
              <Card className="relative h-87.5 overflow-hidden border-[#d7e9e1] bg-[#0f1513]">
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
            <h2 className="mb-8 text-3xl font-bold text-[#1d2623]">How It Works</h2>
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
                <Card key={i} className="border-[#d7e9e1] bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
                  <h3 className="mb-2 text-xl font-bold text-[#1d2623]">{item.title}</h3>
                  <p className="text-[#5f6a66]">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Section 4: Code Example */}
          <section className="mb-12">
            <h2 className="mb-8 text-3xl font-bold text-[#1d2623]">Usage Example</h2>
            <Card className="border-[#d7e9e1] bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
              <pre className="overflow-x-auto text-sm text-[#40504b]">
{`import { SplineScene } from "@/components/ui/splite";

export function MyComponent() {
  return (
    <SplineScene 
      scene="https://prod.spline.design/YOUR_SCENE/scene.splinecode"
      className="w-full h-125"
    />
  );
}`}
              </pre>
            </Card>
          </section>

          {/* Call to Action */}
          <section className="mb-12">
            <Card className="border-[#d7e9e1] bg-white p-12 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <h2 className="mb-4 text-3xl font-bold text-[#1d2623]">Ready to Add 3D?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-[#5f6a66]">
                Create your own 3D scenes at Spline.design and integrate them into your TrackU application
                using the SplineScene component.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="https://spline.design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#49c89f] px-8 py-3 font-semibold text-white transition hover:bg-[#3fb18d]"
                >
                  Visit Spline
                </a>
                <a
                  href="#"
                  className="rounded-lg border border-[#cfe5dc] bg-[#f8fffb] px-8 py-3 font-semibold text-[#1d2623] transition hover:bg-[#eefcf5]"
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
