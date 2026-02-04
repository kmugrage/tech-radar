import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="text-gray-500 dark:text-gray-400">Page not found</p>
      <Link href="/">
        <Button variant="secondary">Go home</Button>
      </Link>
    </div>
  );
}
