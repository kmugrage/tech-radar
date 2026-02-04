import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
        Technology Radar
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
        Build and visualize your own technology radar. Track the technologies,
        tools, platforms, and techniques that matter to your team &mdash;
        inspired by the{" "}
        <a
          href="https://www.thoughtworks.com/radar"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline hover:text-blue-500"
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
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-left dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Custom Radars
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create multiple radars with custom quadrants, rings, and color
            schemes to match your team&apos;s needs.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-left dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Interactive Visualization
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Explore your radar with an interactive SVG visualization. Hover and
            click blips to see details.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-left dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Track Changes
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Mark technologies as new or existing. See at a glance what&apos;s
            changed since your last radar update.
          </p>
        </div>
      </div>
    </div>
  );
}
