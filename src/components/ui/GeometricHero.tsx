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

            // Calculate normalized coordinates (0 to 1) relative to the container
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            // Clamp to [0, 1] just in case
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            setMousePos({ x, y });
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => {
            setIsHovering(false);
            // Let it slowly drift back to center via CSS transition
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

    // Parallax calculations
    // Base offset max amplitude (pixels)
    const maxOffset = 20;

    // Normalized delta from center (-1 to 1)
    const dx = (mousePos.x - 0.5) * 2;
    const dy = (mousePos.y - 0.5) * 2;

    // Different elements move at different depths
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-[10px] tracking-widest uppercase font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ opacity: isHovering && !isPressed ? 1 : 0 }}>
                Press & Hold
            </div>
            <div className="flex items-center justify-center gap-3 relative z-10 w-full group">
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight z-20 transition-transform duration-700 ease-out" style={{ transform: `translate3d(${pFrontX * 0.2}px, ${pFrontY * 0.2}px, 0)` }}>shape</span>

                {/* Animated Geometric Centerpiece */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-4 flex items-center justify-center z-10">
                    <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        className="w-full h-full overflow-visible"
                        style={{
                            transition: isHovering && !isPressed ? 'none' : 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            transform: isPressed ? 'scale(1.05)' : 'scale(1)',
                        }}
                    >
                        {/* Background Gradient/Glow (Subtle) */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke={isPressed ? "#bbf7d0" : "#f1f5f9"} strokeWidth="1" className="transition-colors duration-500" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke={isPressed ? "#86efac" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="2 4" className="transition-colors duration-500" />

                        <g style={{ transform: `translate3d(${pBackX}px, ${pBackY}px, 0)` }} className="transition-transform duration-75 ease-out origin-center">
                            {/* The Ideal Triangle (Linear) - Faded in background */}
                            <polygon
                                points={isPressed ? "50,85 85,85 15,85" : "50,15 85,85 15,85"}
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                className="opacity-60 transition-all duration-500"
                            />
                            {/* Middle horizontal division line */}
                            <line x1="32.5" y1="50" x2="67.5" y2="50" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" className={`transition-all duration-500 ${isPressed ? 'opacity-0' : 'opacity-50'}`} />
                        </g>

                        <g style={{ transform: `translate3d(${pMidX}px, ${pMidY}px, 0)` }} className="transition-transform duration-75 ease-out origin-center">
                            {/* The Exponential Horn / Actual Org Shape */}
                            <path
                                d={isPressed ? "M15 85 C15 85, 50 85, 85 85 L15 85 Z" : "M50 15 C50 15, 60 50, 85 85 L15 85 C40 50, 50 15, 50 15 Z"}
                                fill={isPressed ? "rgba(22, 163, 74, 0.1)" : "rgba(15, 23, 42, 0.03)"}
                                stroke={isPressed ? "#16a34a" : "#0f172a"}
                                strokeWidth="2.5"
                                className="transition-all duration-500"
                            />

                            {/* Apex / Top connecting node */}
                            <circle cx="50" cy={isPressed ? "85" : "15"} r="3.5" fill={isPressed ? "#16a34a" : "#0f172a"} className="transition-all duration-500" />
                            <circle cx="50" cy={isPressed ? "85" : "15"} r="7" fill="none" stroke={isPressed ? "#16a34a" : "#0f172a"} strokeWidth="1" className="animate-ping transition-all duration-500" style={{ animationDuration: '3s' }} />
                        </g>

                        <g style={{ transform: `translate3d(${pFrontX}px, ${pFrontY}px, 0)` }} className="transition-transform duration-75 ease-out origin-center">
                            {/* Relay Nodes / Downward Flow representing information cascading & degrading */}
                            <circle cx="62" cy="72" r={isPressed ? "0" : "2.5"} fill="#0f172a" className="transition-all duration-500" />
                            <line x1="50" y1={isPressed ? "85" : "15"} x2="62" y2={isPressed ? "85" : "72"} stroke={isPressed ? "#16a34a" : "#0f172a"} strokeWidth="1.5" strokeDasharray="3 3" className="transition-all duration-500 opacity-0 md:opacity-100">
                                {!isPressed && <animate attributeName="stroke-dashoffset" values="12;0" dur="2s" repeatCount="indefinite" />}
                            </line>

                            {/* Intersecting vertical cut representing the depth axis */}
                            <line x1="50" y1={isPressed ? "85" : "15"} x2="50" y2="95" stroke={isPressed ? "#16a34a" : "#0f172a"} strokeWidth="1.5" className="transition-all duration-500" />
                            {/* Depth markers */}
                            <circle cx="50" cy={isPressed ? "85" : "40"} r={isPressed ? "0" : "2"} fill="white" stroke="#0f172a" strokeWidth="1.5" className="transition-all duration-500" />
                            <circle cx="50" cy={isPressed ? "85" : "65"} r={isPressed ? "0" : "2"} fill="white" stroke="#0f172a" strokeWidth="1.5" className="transition-all duration-500" />
                            <circle cx="50" cy="90" r="3.5" fill={isPressed ? "#16a34a" : "#0f172a"} className="transition-all duration-500" />

                            {/* Smaller floating geometric accents */}
                            <rect x="25" y={isPressed ? "85" : "65"} width="4" height="4" fill="#0f172a" transform="rotate(25 27 67)" className={`transition-all duration-500 ${isPressed ? 'opacity-0' : 'opacity-80'}`} />
                            <polygon points={isPressed ? "70,85 80,85 75,85" : "75,45 80,52 70,52"} fill="#0f172a" className={`transition-all duration-500 ${isPressed ? 'opacity-0' : 'opacity-60'}`} />
                        </g>
                    </svg>
                </div>

                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight z-20 transition-transform duration-700 ease-out" style={{ transform: `translate3d(${pFrontX * 0.2}px, ${pFrontY * 0.2}px, 0)` }}>matters</span>
            </div>

            {/* Subtle background connecting lines behind the text that moves with the mouse */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-10 transition-transform duration-75 ease-out"
                style={{ transform: `translate3d(${pBackX * 1.5}px, ${pBackY * 1.5}px, 0)` }}
            >
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
        </div>
    );
}
