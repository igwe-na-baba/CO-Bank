import React, { useRef, useEffect } from 'react';
import { ArrowRightIcon } from './Icons';

interface AdvancedFirstPageProps {
    onComplete: () => void;
}

const AnimatedICreditUnionLogo = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
            <linearGradient id="ic-grad-splash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(var(--color-primary-400))" />
                <stop offset="100%" stopColor="rgb(var(--color-primary-600))" />
            </linearGradient>
            <filter id="ic-shadow-splash" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="rgb(var(--color-primary-900))" floodOpacity="0.4" />
            </filter>
        </defs>
        <style>{`
            .draw-path {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: draw 2s ease-out forwards;
            }
            .draw-rect {
                transform-origin: 50% 100%;
                animation: scale-up 1s ease-out 1s forwards;
                transform: scaleY(0);
            }
            .fade-in {
                opacity: 0;
                animation: fade-in 1s ease-out 1.5s forwards;
            }
            @keyframes draw { to { stroke-dashoffset: 0; } }
            @keyframes scale-up { to { transform: scaleY(1); } }
            @keyframes fade-in { to { opacity: 1; } }
        `}</style>
        <g filter="url(#ic-shadow-splash)">
            {/* The 'C' shape */}
            <path className="draw-path" d="M 85,50 A 35,35 0 1 1 50,15" fill="none" stroke="url(#ic-grad-splash)" strokeWidth="17" strokeLinecap="round" />
            
            {/* The 'i' stem */}
            <rect className="draw-rect" x="45" y="45" width="10" height="30" rx="5" fill="url(#ic-grad-splash)" />

            {/* The Star ⭐ for the dot of the 'i' */}
            <path className="fade-in" d="M50 22 L52.5 28.5 L59.5 29.5 L54 34 L55.5 41 L50 37.5 L44.5 41 L46 34 L40.5 29.5 L47.5 28.5 Z" fill="rgb(var(--color-primary-300))" />

            {/* The ™ symbol */}
            <text className="fade-in" x="89" y="32" fontSize="14" fontWeight="bold" fill="currentColor" textAnchor="middle">™</text>
        </g>
    </svg>
);


export const AdvancedFirstPage: React.FC<AdvancedFirstPageProps> = ({ onComplete }) => {
    const bgRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (bgRef.current && gridRef.current) {
                const { clientX, clientY } = event;
                const { innerWidth, innerHeight } = window;
                const offsetX = (clientX / innerWidth - 0.5) * 2; // range from -1 to 1
                const offsetY = (clientY / innerHeight - 0.5) * 2; // range from -1 to 1

                // Apply different translation factors for a parallax depth effect
                bgRef.current.style.transform = `translateX(${offsetX * 10}px) translateY(${offsetY * 8}px)`;
                gridRef.current.style.transform = `translateX(${offsetX * 20}px) translateY(${offsetY * 15}px)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center overflow-hidden relative">
            {/* Background Video Layer */}
            <div ref={bgRef} className="absolute inset-[-20px] z-0 transition-transform duration-300 ease-out">
                 <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-a-futuristic-business-environment-with-holograms-44812-large.mp4" type="video/mp4" />
                </video>
            </div>
            
            {/* Animated Grid Overlay */}
            <div 
                ref={gridRef}
                className="absolute inset-[-20px] z-[1] transition-transform duration-300 ease-out animate-grid-pan"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(var(--color-primary-500) / 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(var(--color-primary-500) / 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '3rem 3rem',
                }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(17,24,39,0.4)_0%,rgba(17,24,39,0.9)_100%)]"></div>

            {/* Main content */}
            <div className="relative z-10 text-center flex flex-col items-center p-4">
                {/* Logo */}
                <div className="w-48 h-48 mb-6 drop-shadow-2xl">
                     <AnimatedICreditUnionLogo />
                </div>

                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight animate-text-focus-in text-3d-digital" style={{ animationDelay: '2s' }}>
                    Welcome to iCredit Union®
                </h1>
                <p className="mt-4 text-lg text-slate-200 max-w-2xl mx-auto animate-fade-in-up glow-text" style={{ animationDelay: '2.5s' }}>
                    The Pinnacle of Global Finance. <br/> Secure, seamless, and built for you.
                </p>
                <button
                    onClick={onComplete}
                    className="mt-10 inline-flex items-center space-x-3 px-8 py-4 text-lg font-bold bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-105 animate-breathing"
                    style={{ animationDelay: '3s' }}
                >
                    <span>Enter Secure Portal</span>
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};