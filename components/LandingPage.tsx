"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Github, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn, signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AnimatedLink } from "@/components/AnimatedLink";
import LoadingScreen from "./LoadingPage";

export default function LandingPage() {
  // const { data: session, status } = useSession();
  const { isAuthenticated, isLoading, logOut } = useUser();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  useEffect(() => {
    setTimeout(() => {
      if (callbackUrl) {
        toast.error("Please log in first to access project routes");
      }
    }, 1000);
  }, [callbackUrl]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    logOut(); // Call the logOut function from UserContext
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="border-b border-b-gray-500 border-dashed backdrop-blur-md sticky top-0 z-50 rounded-b-3xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-7 h-7 bg-[#780000] rounded-md" />
              <span className="text-lg font-extralight tracking-wider font-darker text-gray-200">
                Cokaam
              </span>
            </motion.div>

            {/* Links + Buttons */}
            <motion.div
              className="flex items-center gap-6 font-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedLink href="#features" title="features" />
              {/* Auth Area */}
              {isLoading ? (
                <div className="flex items-center gap-2">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-[#780000] rounded-full" // Changed color to match theme
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay,
                      }}
                    />
                  ))}
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <AnimatedLink href="/dashboard" title="dashboard" />
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="bg-[#08090a] text-gray-200 hover:text-white hover:bg-[#1a1b1e] font-normal text-sm px-4 transition-all duration-300 cursor-pointer border-dashed border-1 border-gray-500 "
                  >
                    <AnimatedLink href="" title="sign out" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className="bg-[#08090a] text-gray-200 hover:text-white hover:bg-[#1a1b1e] font-normal text-sm px-4 transition-all duration-300 cursor-pointer border-dashed border-1 border-gray-500"
                    onClick={() => signIn("github", { redirect: false })}
                  >
                    <AnimatedLink href="" title="sign in" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 lg:pb-25">
          <div className="text-left">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-darker font-bold tracking-tight leading-none scale-y-90 scale-x-90 origin-left"
              initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              BUILD. TRACK. SHIP
            </motion.h1>

            <motion.p
              className="font-primary text-sm sm:text-base md:text-md text-gray-400 font-normal leading-relaxed mb-8 sm:mb-12 lg:mb-16 max-w-xl sm:max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Project management without the bloat. Paste repo url, add members,
              and get real-time project tracking in under 5 minutes.{" "}
              <br className="hidden sm:block" />
              While others make you configure, we make it work.
            </motion.p>
          </div>

          <div className="relative">
            {/* Background glow only behind this block */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
              <div className="w-[75%] h-[300px] sm:h-[400px] lg:h-[500px] bg-white rounded-3xl blur-[60px] sm:blur-[80px] opacity-[0.17]" />
            </div>

            <div
              className="relative z-10 w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl sm:rounded-3xl lg:rounded-4xl p-[1px]"
              style={{
                backgroundImage:
                  "linear-gradient(85deg, #7B7B80 0%, rgba(8,9,10,0) 65%)",
              }}
            >
              <div className="w-full h-full rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-black">
                <video
                  className="h-full w-full object-cover rounded-2xl sm:rounded-3xl lg:rounded-4xl opacity-85"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/dashboard.webm" type="video/webm" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="h-12 sm:h-18" id="features" />

      {/* Features Section */}
      <section>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 font-darker">
            JUST THE GOOD STUFF
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-1 auto-rows-[minmax(120px,_auto)]">
            <div className="bg-[#08090a] rounded-xl p-4 sm:p-6 lg:row-span-2 border-dashed border-gray-500 border-1 relative overflow-hidden group">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 font-darker transition-all duration-300 ease-out group-hover:text-lg sm:group-hover:text-xl lg:group-hover:text-2xl">
                GitHub Integration
              </h3>
              <p className="text-sm sm:text-base text-gray-400 font-primary transition-all duration-300 ease-out group-hover:text-xs sm:group-hover:text-sm">
                Paste a repo URL and get going. Setup? Already done.
              </p>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-11/12 h-3/5 bg-[08090a] border-1 border-gray-500 border-dashed rounded-t-lg opacity-0 blur-lg translate-y-full transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-70 group-hover:blur-none pt-3 sm:pt-4 px-2 sm:px-3">
                <div className="text-xs sm:text-sm font-primary text-gray-400 space-y-1">
                  <Github className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                  <div>
                    No need to leave the app, just enter the repo url and the
                    webhook will be automatically configured with the website.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#140e0ec2] rounded-xl p-4 sm:p-6 border-dashed border-gray-500 border-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 font-darker">
                Live Feed
              </h3>
              <p className="text-sm sm:text-base text-gray-400 font-primary">
                Commits, pushes, merges—automatically shown live.
              </p>
            </div>

            <div className="bg-[#08090a] rounded-xl p-4 sm:p-6 lg:row-span-2 border-dashed border-gray-500 border-1 relative overflow-hidden group">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 font-darker transition-all duration-300 ease-out group-hover:text-lg sm:group-hover:text-xl lg:group-hover:text-2xl">
                Project Members
              </h3>
              <p className="text-sm sm:text-base text-gray-400 font-primary transition-all duration-300 ease-out group-hover:text-xs sm:group-hover:text-sm">
                Add, remove, and collaborate with your team seamlessly.
              </p>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-11/12 h-3/5 bg-[08090a] border-1 border-gray-500 border-dashed rounded-t-lg opacity-0 blur-lg translate-y-full transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-70 group-hover:blur-none pt-3 sm:pt-4 px-2 sm:px-3">
                <div className="text-xs sm:text-sm font-primary text-gray-400 space-y-1">
                  <UserRoundCheck className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                  <div>
                    Simply enter the email of an authenticated user, add them to
                    your project and start giving out tasks.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#140e0ec2] rounded-xl p-4 sm:p-6 lg:row-span-1 border-dashed border-gray-500 border-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 font-darker">
                Auto Task Completion
              </h3>
              <p className="text-sm sm:text-base text-gray-400 font-primary">
                Mark tasks as done by just committing the task title.
              </p>
            </div>

            <div className="bg-[#08090a] rounded-xl p-4 sm:p-6 col-span-1 lg:col-span-2 border-dashed border-gray-500 border-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 font-darker">
                Smart Assignment
              </h3>
              <p className="text-sm sm:text-base text-gray-400 font-primary">
                Commits auto-assign tasks to the right person—no manual tracking
                required.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <motion.div
          className="max-w-lg mx-auto text-center px-8 border-1 border-gray-500 border-dashed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-7xl font-darker font-bold mb-4 leading-tight scale-y-90 scale-x-90 ">
            START NOW
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-[#08090a] text-white font-primary px-12 py-6 text-base rounded-none border-dashed border-1 border-gray-500 group"
            style={{ borderRadius: "none" }}
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-all duration-300 ease-out"
            >
              <span className="transition-all duration-300 group-hover:scale-90">
                JUMP IN
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative w-full h-[60vh] bg-none overflow-hidden mt-16">
        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black to-transparent" />

        {/* Brand Name */}
        <h1 className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[25.5vw] font-primary font-bold tracking-tighter scale-y-90 scale-x-90 text-white opacity-50 z-0 leading-none select-none -my-8">
          COKAAM
        </h1>
      </footer>
    </div>
  );
}
