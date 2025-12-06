import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = ({ isDarkMode, onToggle, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onToggle}
    aria-label={label}
    className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-lg shadow-md transition-all duration-200"
  >
    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
  </motion.button>
);

export default ThemeToggle;
