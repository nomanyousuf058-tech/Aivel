import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-xl 
        p-6 transition-all duration-200 hover:border-gray-600/50 
        hover:shadow-lg hover:shadow-blue-500/10
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}