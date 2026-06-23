import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

/**
 * Scroll-triggered reveal. Subtle y-rise + fade as the element enters the
 * viewport — premium, restrained, once per element. Respects reduced-motion
 * automatically because Framer Motion reads the OS setting when configured.
 */

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds for sequential reveals. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Reveal({ children, delay = 0, y = 28, className, style }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
