import React, { memo } from 'react';
import { motion } from 'framer-motion';

// Memoized inline badge used for category labels and similar tags.
export const Badge = memo(({ children, color, onClick }) => (
  <motion.span
    initial={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${color}`}
    onClick={onClick}
  >
    {children}
  </motion.span>
));

export default Badge;
