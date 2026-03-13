import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="after-dark-shell min-h-screen w-full flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-4 border-red-900/40 bg-zinc-950/85 text-slate-200">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-3 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-black uppercase tracking-[0.08em] text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            The route you entered does not exist or has moved.
          </p>

          <Button asChild className="mt-6 w-full bg-red-900 hover:bg-red-800 text-white font-black uppercase tracking-[0.1em]">
            <Link href="/">
              <Home size={16} className="mr-2" />
              Return to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
