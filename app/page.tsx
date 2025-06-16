"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  GitBranch,
  BarChart3,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const { user, projects, isAuthenticated, isLoading, logOut } = useUser();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  useEffect(() => {
    setTimeout(() => {
      if (callbackUrl) {
        toast.error("Please log in first to access project routes");
      }
    }, 1000);
  }, [callbackUrl]);

  // Removed redundant authentication check as we're using UserContext

  const debugContext = () => {
    console.log("=== UserContext Debug ===");
    console.log("Session:", session);
    console.log("Session Status:", status);
    console.log("User:", user);
    console.log("Projects:", projects);
    console.log("IsAuthenticated:", isAuthenticated);
    console.log("IsLoading:", isLoading);
    console.log("========================");
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    logOut(); // Call the logOut function from UserContext
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-900/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-7 h-7 bg-[#780000] rounded-md"></div>
              <span className="text-lg font-extralight tracking-wider">
                flow
              </span>
            </motion.div>

            <motion.div
              className="flex items-center space-x-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href="#features"
                className="text-gray-300 hover:text-white transition-all duration-300 font-normal text-sm"
              >
                features
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={debugContext}
                className="text-yellow-400 hover:text-yellow-300 text-xs"
              >
                Debug
              </Button>
              <Link
                href="#about"
                className="text-gray-300 hover:text-white transition-all duration-300 font-normal text-sm"
              >
                about
              </Link>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 bg-[#00607a] rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.6, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-[#00607a] rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.6, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-[#00607a] rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.6, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                  />
                </div>
              ) : !isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-gray-900/50 font-normal text-sm transition-all duration-300 hover:px-6"
                    onClick={() => signIn("github", { redirect: false })}
                  >
                    sign in
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-gradient-to-r from-[#00607a] to-[#007a9a] hover:from-[#007a9a] hover:to-[#00a0ca] text-white font-normal text-sm transition-all duration-300 hover:px-6 hover:shadow-lg hover:shadow-[#00607a]/20"
                    onClick={() => signIn("github", { redirect: false })}
                  >
                    get started
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#00607a] to-[#007a9a] hover:from-[#007a9a] hover:to-[#00a0ca] text-white font-normal text-sm transition-all duration-300 hover:px-6 hover:shadow-lg hover:shadow-[#00607a]/20"
                  >
                    <Link href="/dashboard">dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white hover:bg-gray-900/50 font-normal text-sm transition-all duration-300 hover:px-6"
                  >
                    sign out
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#780000]/3 to-[#00607a]/3"></div>
        <div className="relative max-w-5xl mx-auto px-8 pt-32 pb-40">
          <div className="text-center">
            <motion.h1
              className="text-6xl md:text-8xl font-extralight tracking-tight mb-12 leading-none"
              initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              Build Together.{" "}
              <motion.span
                className="bg-gradient-to-r from-[#9a0000] to-[#00607a] bg-clip-text text-transparent"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              >
                Ship Faster.
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg text-gray-300 font-normal leading-relaxed mb-16 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              minimal project management for modern teams. connect repositories,
              manage tasks, collaborate seamlessly.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#00607a] to-[#007a9a] hover:from-[#007a9a] hover:to-[#00a0ca] text-white font-normal px-10 py-6 text-base transition-all duration-300 hover:px-12 hover:shadow-lg hover:shadow-[#00607a]/20"
              >
                <Link href="/dashboard">
                  start building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-800 text-gray-300 hover:bg-gray-900/50 hover:text-white hover:border-gray-700 font-normal px-10 py-6 text-base transition-all duration-300 hover:px-12"
              >
                view demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-extralight tracking-tight mb-8 leading-tight">
              Everything You Need.{" "}
              <span className="text-[#9a0000]">Nothing More.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "team collaboration",
                desc: "add members, assign roles, collaborate in real-time",
                color: "#9a0000",
              },
              {
                icon: GitBranch,
                title: "repository sync",
                desc: "connect github, gitlab, bitbucket repositories seamlessly",
                color: "#00607a",
              },
              {
                icon: BarChart3,
                title: "project insights",
                desc: "track progress, monitor performance, gain insights",
                color: "#9a0000",
              },
              {
                icon: Zap,
                title: "lightning fast",
                desc: "built for speed with modern architecture",
                color: "#00607a",
              },
              {
                icon: Shield,
                title: "secure & private",
                desc: "enterprise-grade security, privacy-first design",
                color: "#9a0000",
              },
              {
                icon: Globe,
                title: "global access",
                desc: "access projects anywhere with cloud sync",
                color: "#00607a",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gray-900/30 border-gray-800/30 p-8 hover:bg-gray-900/50 hover:border-gray-700/50 transition-all duration-500 group h-full min-h-[200px] flex flex-col">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-8 transition-transform duration-300"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon
                      className="h-5 w-5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-lg font-normal mb-4 text-white capitalize">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 font-normal leading-relaxed text-sm flex-1">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <motion.div
          className="max-w-4xl mx-auto text-center px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-extralight tracking-tight mb-12 leading-tight">
            Ready To <span className="text-[#00607a]">Build</span>?
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#00607a] to-[#007a9a] hover:from-[#007a9a] hover:to-[#00a0ca] text-white font-normal px-12 py-6 text-base transition-all duration-300 hover:px-16 hover:shadow-xl hover:shadow-[#00607a]/20"
          >
            <Link href="/dashboard">
              start free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900/30 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <div className="w-6 h-6 bg-[#780000] rounded-md"></div>
              <span className="text-lg font-extralight tracking-wider">
                flow
              </span>
            </div>

            <div className="flex space-x-12 text-gray-300 font-normal text-sm">
              <Link
                href="#"
                className="hover:text-white transition-colors duration-300"
              >
                privacy
              </Link>
              <Link
                href="#"
                className="hover:text-white transition-colors duration-300"
              >
                terms
              </Link>
              <Link
                href="#"
                className="hover:text-white transition-colors duration-300"
              >
                support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
