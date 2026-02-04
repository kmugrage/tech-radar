export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
        Technology Radar &mdash; Inspired by{" "}
        <a
          href="https://www.thoughtworks.com/radar"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Thoughtworks Technology Radar
        </a>
      </div>
    </footer>
  );
}
