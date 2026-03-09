import { useEffect, useState, useRef } from 'react';

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
                <span
                    className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-stone-900 tracking-tight z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        transform: `translate3d(${pFrontX * 0.2}px, ${pFrontY * 0.2}px, 0) scale(${isPressed ? 1.05 : 1})`,
                        filter: !isPressed ? 'blur(4px)' : 'blur(0px)',
                        opacity: !isPressed ? 0.6 : 1,
                        color: isPressed ? '#1C1917' : '#44403C'
                    }}
                >
                    shape
                </span>

                {/* Animated Relay Centerpiece */}
                <div className="relative w-28 h-20 md:w-48 md:h-28 flex items-center justify-center z-10">
                    <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-full overflow-visible"
                        style={{
                            transition: isHovering && !isPressed ? 'none' : 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            transform: `scale(${isPressed ? 1.05 : 1}) translate3d(${pMidX * 0.5}px, ${pMidY * 0.5}px, 0)`,
                        }}
                    >
                        {/* Background subtle glow to frame the connection */}
                        <g style={{ transform: `translate3d(${pBackX}px, ${pBackY}px, 0)` }} className="transition-transform duration-75 ease-out origin-center">
                            <rect x="-10" y="40" width="120" height="20" rx="10" fill={isPressed ? "rgba(184, 69, 21, 0.05)" : "rgba(28, 25, 23, 0.02)"} className="transition-colors duration-700" />

                            {/* Noise outline 1 */}
                            <path
                                d={isPressed ? "M20,50 Q35,50 50,50" : "M20,25 Q35,5 50,20"}
                                stroke={isPressed ? "#f97316" : "#1C1917"}
                                strokeWidth="1"
                                strokeDasharray="2 3"
                                fill="none"
                                className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPressed ? 'opacity-0' : 'opacity-30'}`}
                            />
                            {/* Noise outline 2 */}
                            <path
                                d={isPressed ? "M40,50 Q50,50 60,50" : "M40,75 Q50,95 60,70"}
                                stroke={isPressed ? "#f97316" : "#1C1917"}
                                strokeWidth="1"
                                strokeDasharray="3 4"
                                fill="none"
                                className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPressed ? 'opacity-0' : 'opacity-30'}`}
                            />
                            {/* Dead end branch */}
                            <path
                                d={isPressed ? "M50,50 L60,50 L70,50" : "M50,20 L55,5 L65,10"}
                                stroke={isPressed ? "#f97316" : "#1C1917"}
                                strokeWidth="1"
                                fill="none"
                                className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPressed ? 'opacity-0' : 'opacity-20'}`}
                            />
                        </g>

                        <g className="origin-center">
                            {/* Main Signal Path */}
                            <path
                                d={isPressed
                                    ? "M-20,50 L 0,50 L 15,50 L 20,50 L 25,50 L 35,50 L 40,50 L 45,50 L 45,50 L 50,50 L 55,50 L 55,50 L 60,50 L 65,50 L 70,50 L 80,50 L 85,50 L 100,50 L 120,50"
                                    : "M-20,90 L 10,80 L 20,60 L 25,85 L 35,40 L 40,70 L 50,10 L 60,70 L 65,40 L 75,85 L 80,60 L 90,80 L 120,90"}
                                stroke={isPressed ? "#B84515" : "#1C1917"}
                                strokeLinejoin="bevel"
                                strokeWidth={isPressed ? "3" : "1.5"}
                                fill="none"
                                className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                            />

                            {/* Signal Nodes (Relays) */}
                            <circle cx={isPressed ? 20 : 20} cy={isPressed ? 50 : 60} r={isPressed ? 0 : 3} fill="#1C1917" className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                            <circle cx={isPressed ? 35 : 35} cy={isPressed ? 50 : 40} r={isPressed ? 0 : 3.5} fill="#1C1917" className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                            <circle cx={isPressed ? 50 : 50} cy={isPressed ? 50 : 10} r={isPressed ? 0 : 4} fill="#1C1917" className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                            <circle cx={isPressed ? 65 : 65} cy={isPressed ? 50 : 40} r={isPressed ? 0 : 3} fill="#1C1917" className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                            <circle cx={isPressed ? 80 : 80} cy={isPressed ? 50 : 60} r={isPressed ? 0 : 3.5} fill="#1C1917" className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />

                            {/* Clean Signal Pulse (Only visible when pressed) */}
                            <circle cx="50" cy="50" r={isPressed ? 5 : 0} fill="#B84515" className="transition-all duration-700" />
                            {isPressed && (
                                <circle cx="50" cy="50" r={16} fill="none" stroke="#B84515" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '2s' }} />
                            )}

                            {/* Fast-moving particles on the happy path */}
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
                </div>

                <span
                    className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-stone-900 tracking-tight z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        transform: `translate3d(${pFrontX * 0.2}px, ${pFrontY * 0.2}px, 0) scale(${isPressed ? 1.05 : 1})`,
                        filter: !isPressed ? 'blur(4px)' : 'blur(0px)',
                        opacity: !isPressed ? 0.6 : 1,
                        color: isPressed ? '#1C1917' : '#44403C'
                    }}
                >
                    matters
                </span>
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
