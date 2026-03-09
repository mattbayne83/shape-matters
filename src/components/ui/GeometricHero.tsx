import { useEffect, useState, useRef } from 'react';

function PyramidGraphic({ isPressed, pBackX, pBackY }: any) {
    const [time, setTime] = useState(0);
    const [morph, setMorph] = useState(0); // 0 is pyramid, 1 is straight line
    const rp = useRef<number>(0);
    const pressedRef = useRef(isPressed);

    // Sync ref with prop
    pressedRef.current = isPressed;

    useEffect(() => {
        let t = 0;
        let m = pressedRef.current ? 1 : 0;
        let lastTimestamp = performance.now();

        const tick = (timestamp: number) => {
            const dt = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // Advance time for wave. Constant speed regardless of framerate
            t += (dt * 0.002);
            setTime(t);

            // Smooth lerp for morph
            const targetM = pressedRef.current ? 1 : 0;
            // adjust lerp speed to take roughly 700ms (0.008 per ms)
            m += (targetM - m) * (dt * 0.008);

            // snap to exact values to avoid endless tiny updates
            if (Math.abs(targetM - m) < 0.001) m = targetM;

            setMorph(m);
            rp.current = requestAnimationFrame(tick);
        };
        rp.current = requestAnimationFrame(tick);

        return () => {
            if (rp.current) cancelAnimationFrame(rp.current);
        };
    }, []);

    const layers = [
        { width: 35, y: 20 },
        { width: 55, y: 35 },
        { width: 75, y: 50 },
        { width: 95, y: 65 },
        { width: 115, y: 80 }
    ];

    const generateWavePath = (layerId: number, width: number, y: number, amplitude: number, morph: number, t: number) => {
        const points = 21;
        let path = '';

        // Custom ease function for pleasing morph
        const easeMorph = morph < 0.5 ? 2 * morph * morph : 1 - Math.pow(-2 * morph + 2, 2) / 2;

        for (let i = 0; i < points; i++) {
            const pct = i / (points - 1);

            // Unpressed
            const unpressedX = (50 - width / 2) + pct * width;
            const distFromCenter = Math.abs(unpressedX - 50) / (width / 2);
            const taper = Math.max(0, 1 - distFromCenter * distFromCenter);

            // The wave equation with slight offset per layer for visual interest
            const freq1 = 8 + layerId * 1.5;
            const freq2 = 12 - layerId;
            const speedVar = 1 + layerId * 0.1;
            const wave = Math.sin(pct * freq1 - t * speedVar + layerId) + Math.cos(pct * freq2 + t * 0.8 + layerId);

            const unpressedY = y + wave * amplitude * taper;

            // Pressed
            const pressedX = -20 + pct * 140;
            const pressedY = 50;

            // Interpolate
            const currentX = unpressedX + (pressedX - unpressedX) * easeMorph;
            const currentY = unpressedY + (pressedY - unpressedY) * easeMorph;

            if (i === 0) {
                path += `M ${currentX},${currentY}`;
            } else {
                path += ` L ${currentX},${currentY}`;
            }
        }
        return path;
    };

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full overflow-visible"
        >
            <g style={{ transform: `translate3d(${pBackX}px, ${pBackY}px, 0)` }} className="transition-transform duration-75 ease-out origin-center">
                <rect x="-10" y="40" width="120" height="20" rx="10" fill={isPressed ? "rgba(184, 69, 21, 0.05)" : "rgba(28, 25, 23, 0.02)"} className="transition-colors duration-700" />
            </g>

            <g className="origin-center">
                {layers.map((layer, i) => (
                    <path
                        key={i}
                        d={generateWavePath(i, layer.width, layer.y, 4, morph, time)}
                        stroke={isPressed ? "#B84515" : "#1C1917"}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth={isPressed && i === 2 ? "3" : "1.5"}
                        fill="none"
                        style={{
                            transition: 'stroke 700ms, stroke-width 700ms, opacity 700ms',
                            opacity: isPressed ? (i === 2 ? 1 : 0) : Math.max(0.3, 1 - Math.abs(2 - i) * 0.25)
                        }}
                    />
                ))}

                <circle cx="50" cy="50" r={isPressed ? 5 : 0} fill="#B84515" className="transition-all duration-700" />
                {isPressed && (
                    <circle cx="50" cy="50" r={16} fill="none" stroke="#B84515" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '2s' }} />
                )}

                {isPressed && (
                    <>
                        <circle cx="0" cy="50" r="2.5" fill="#f97316">
                            <animate attributeName="cx" from="-20" to="120" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="50" r="2" fill="#f97316" opacity="0.6">
                            <animate attributeName="cx" from="-20" to="120" dur="1s" begin="0.4s" repeatCount="indefinite" />
                        </circle>
                    </>
                )}
            </g>
        </svg>
    );
}

export function GeometricHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [isHovering, setIsHovering] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            setMousePos({ x, y });
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => {
            setIsHovering(false);
            setMousePos({ x: 0.5, y: 0.5 });
        };

        const el = containerRef.current;
        if (el) {
            el.addEventListener('mousemove', handleMouseMove);
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                el.removeEventListener('mousemove', handleMouseMove);
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, []);

    const maxOffset = 20;

    const dx = (mousePos.x - 0.5) * 2;
    const dy = (mousePos.y - 0.5) * 2;

    const pFrontX = dx * maxOffset * -1;
    const pFrontY = dy * maxOffset * -1;
    const pMidX = dx * maxOffset * -0.5;
    const pMidY = dy * maxOffset * -0.5;
    const pBackX = dx * maxOffset * -0.2;
    const pBackY = dy * maxOffset * -0.2;

    const renderWord = (word: string, startIndex: number) => {
        return word.split('').map((char, i) => {
            const charIndex = startIndex + i;
            const blurAmount = !isPressed ? (charIndex / 11) * 8 : 0;
            const transitionDelay = isPressed ? `${charIndex * 40}ms` : '0ms';

            return (
                <span
                    key={i}
                    className="inline-block transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        filter: `blur(${blurAmount}px)`,
                        transitionDelay,
                        // Opacity scaling optional, but makes the progressive blur look gentler
                        opacity: !isPressed ? Math.max(0.4, 1 - (charIndex / 11) * 0.4) : 1,
                    }}
                >
                    {char}
                </span>
            );
        });
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full min-h-[120px] md:min-h-[160px] flex items-center justify-center transition-opacity duration-1000 overflow-visible cursor-pointer select-none`}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => { setIsHovering(false); setIsPressed(false); }}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
        >
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-[10px] tracking-widest uppercase font-bold text-stone-400 transition-opacity duration-300 pointer-events-none"
                style={{ opacity: isHovering && !isPressed ? 1 : 0 }}
            >
                Press & Hold to Clarify
            </div>

            <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-6 relative z-10 w-full group">
                <div
                    className="flex text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-stone-900 tracking-tight z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        transform: `translate3d(${pFrontX * 0.2}px, ${pFrontY * 0.2}px, 0) scale(${isPressed ? 1.05 : 1})`,
                        color: isPressed ? '#1C1917' : '#44403C'
                    }}
                >
                    {renderWord('shape', 0)}
                </div>

                {/* Animated Relay Centerpiece */}
                <div className="relative w-28 h-20 md:w-48 md:h-28 flex items-center justify-center z-10"
                    style={{
                        transition: isHovering && !isPressed ? 'none' : 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        transform: `scale(${isPressed ? 1.05 : 1}) translate3d(${pMidX * 0.5}px, ${pMidY * 0.5}px, 0)`,
                    }}>
                    <PyramidGraphic
                        isPressed={isPressed}
                        pBackX={pBackX}
                        pBackY={pBackY}
                    />
                </div>

                <div
                    className="flex text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-stone-900 tracking-tight z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        transform: `translate3d(${pFrontX * 0.2}px, ${pFrontY * 0.2}px, 0) scale(${isPressed ? 1.05 : 1})`,
                        color: isPressed ? '#1C1917' : '#44403C'
                    }}
                >
                    {renderWord('matters', 5)}
                </div>
            </div>

            {/* Subtle background connecting lines behind the text that moves with the mouse */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-10 transition-transform duration-75 ease-out"
                style={{ transform: `translate3d(${pBackX * 1.5}px, ${pBackY * 1.5}px, 0)` }}
            >
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1C1917" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
        </div>
    );
}
