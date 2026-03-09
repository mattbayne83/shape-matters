import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxBackground() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll();

    // Calculate parallax offset.
    // The background will rise slower than the page scroll,
    // creating an illusion of depth.
    const yPos = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

    return (
        <div
            ref={ref}
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-20"
            aria-hidden="true"
        >
            <motion.div
                style={{ y: yPos }}
                className="absolute inset-x-0 w-[200vw] h-[200vh] -left-[50vw] -top-[50vh]"
            >
                <svg fill="none" width="100%" height="100%" className="w-full h-full">
                    {/* Base Grid */}
                    <pattern
                        id="parallax-grid"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 60 0 L 0 0 0 60"
                            fill="none"
                            stroke="#d6d3d1"
                            strokeWidth="0.5"
                        />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#parallax-grid)" />

                    {/* Subtle floating geometry that scrolls with the grid */}
                    <svg viewBox="0 0 2000 2000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" opacity="0.4">
                        <polygon points="400,400 500,200 500,600" fill="#a8a29e" />
                        <polygon points="1400,800 1600,700 1500,1000" fill="#d6d3d1" />
                        <polygon points="800,1400 900,1200 1000,1500" fill="none" stroke="#a8a29e" strokeWidth="4" />
                        <circle cx="1700" cy="1700" r="80" fill="none" stroke="#e7e5e4" strokeWidth="4" />
                        <circle cx="300" cy="1800" r="160" fill="none" stroke="#f5f5f4" strokeWidth="4" />
                    </svg>
                </svg>
            </motion.div>

            {/* Top gradients to ensure background doesn't overwhelm the text at edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
        </div>
    );
}
