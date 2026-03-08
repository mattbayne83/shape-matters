import { useEffect, useState } from 'react';
import { animate, useMotionValue, motion } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    decimals?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function AnimatedCounter({ value, decimals = 1, className, style }: AnimatedCounterProps) {
    const motionValue = useMotionValue(value);
    const [displayValue, setDisplayValue] = useState(value.toFixed(decimals));

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration: 0.4,
            ease: 'easeOut',
            onUpdate: (latest) => {
                setDisplayValue(latest.toFixed(decimals));
            },
        });

        return controls.stop;
    }, [value, motionValue, decimals]);

    return (
        <motion.span className={className} style={style}>
            {displayValue}
        </motion.span>
    );
}
