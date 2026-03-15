import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          EazeCad License Server
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Manage user accounts and software licenses with our comprehensive admin dashboard
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
