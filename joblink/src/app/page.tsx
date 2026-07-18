import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="px-6 lg:px-14 h-20 flex items-center border-b bg-white dark:bg-black sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-2xl tracking-tighter text-primary">Joblink</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Find the Perfect Job, <br className="hidden sm:block" />
            or Hire the Best Talent.
          </h1>
          <p className="mx-auto max-w-xl text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
            Joblink connects top-tier candidates with world-class companies. 
            Create your profile, post a job, and start connecting today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup?role=candidate" className={buttonVariants({ size: "lg", className: "px-8" })}>
              Find a Job
            </Link>
            <Link href="/signup?role=employer" className={buttonVariants({ size: "lg", variant: "outline", className: "px-8" })}>
              Post a Job
            </Link>
          </div>
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 border-t items-center justify-center flex flex-col px-4 md:px-6 bg-white dark:bg-black">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">© 2026 Joblink Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
