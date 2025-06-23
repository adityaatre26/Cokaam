// AnimatedLink.tsx (or place at the top of your page file)
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export const AnimatedLink = ({
  title,
  href,
}: {
  title: string;
  href: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden text-gray-300 hover:text-white transition-colors duration-300 font-normal text-sm"
    >
      {/* The motion.div handles the vertical sliding */}
      <motion.div
        animate={{ y: isHovered ? "-100%" : "0%" }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
        className="flex flex-col"
      >
        {/* The first span is the one you see initially */}
        <span className="py-1">{title}</span>
        {/* The second span is hidden below, ready to slide up */}
        <span className="absolute top-full py-1">{title}</span>
      </motion.div>
    </Link>
  );
};

export const AnimatedSpan = ({ title }: { title: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden text-white hover:text-white transition-colors duration-300 font-primary font-medium text-sm"
    >
      {/* The motion.div handles the vertical sliding */}
      <motion.div
        animate={{ y: isHovered ? "-100%" : "0%" }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
        className="flex flex-col"
      >
        {/* The first span is the one you see initially */}
        <span className="py-1">{title}</span>
        {/* The second span is hidden below, ready to slide up */}
        <span className="absolute top-full py-1">{title}</span>
      </motion.div>
    </span>
  );
};
