import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-display font-normal tracking-tight text-gray-900 sm:text-6xl">
        Technology Radar
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
        Build and visualize your own technology radar. Track the technologies,
        tools, platforms, and techniques that matter to your team &mdash;
        inspired by the{" "}
        <a
          href="https://www.thoughtworks.com/radar"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#bd4257] hover:text-[#9a3546] transition-colors"
        >
          Thoughtworks Technology Radar
        </a>
        .
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/register">
          <Button size="lg">Get started</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">
            Sign in
          </Button>
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="mt-20 grid max-w-4xl gap-8 sm:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-6 text-left">
          <h3 className="font-semibold text-gray-900">
            Custom Radars
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Create multiple radars with custom quadrants, rings, and themes
            to match your team&apos;s needs.
          </p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-6 text-left">
          <h3 className="font-semibold text-gray-900">
            Interactive Visualization
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Explore your radar with an interactive SVG visualization. Hover and
            click blips to see details.
          </p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-6 text-left">
          <h3 className="font-semibold text-gray-900">
            Track Changes
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Mark technologies as new or existing. See at a glance what&apos;s
            changed since your last radar update.
          </p>
        </div>
      </div>
    </div>
  );
}
