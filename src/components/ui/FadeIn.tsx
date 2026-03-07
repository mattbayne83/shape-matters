import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{
                duration: 0.7,
                ease: [0.21, 0.47, 0.32, 0.98], // elegant custom easing 
                delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
