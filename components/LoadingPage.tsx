"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Logo with pulse animation */}
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-12 h-12 bg-[#780000] rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(120, 0, 0, 0.4)",
                "0 0 0 20px rgba(120, 0, 0, 0)",
                "0 0 0 0 rgba(120, 0, 0, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-2xl font-extralight tracking-wider font-darker text-gray-200">
            flow
          </span>
        </motion.div>

        {/* Loading text with typing effect */}
        <motion.div
          className="text-gray-400 font-primary text-sm tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
            className="inline-block overflow-hidden whitespace-nowrap"
          >
            Preparing your dashboard...
          </motion.span>
        </motion.div>
      </div>

      {/* Background subtle animation */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#780000] rounded-full blur-3xl opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00607a] rounded-full blur-3xl opacity-5"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
    </div>
  );
}
