import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxBackground() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end end']
    });

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
                            stroke="#cbd5e1"
                            strokeWidth="0.5"
                        />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#parallax-grid)" />

                    {/* Subtle floating geometry that scrolls with the grid */}
                    <g opacity="0.4">
                        <polygon points="20vw,20vh 25vw,10vh 25vw,30vh" fill="#94a3b8" />
                        <polygon points="70vw,40vh 80vw,35vh 75vw,50vh" fill="#cbd5e1" />
                        <polygon points="40vw,70vh 45vw,60vh 50vw,75vh" fill="none" stroke="#94a3b8" strokeWidth="2" />
                        <circle cx="85vw" cy="85vh" r="4vw" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                        <circle cx="15vw" cy="90vh" r="8vw" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                    </g>
                </svg>
            </motion.div>

            {/* Top gradients to ensure background doesn't overwhelm the text at edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
        </div>
    );
}
