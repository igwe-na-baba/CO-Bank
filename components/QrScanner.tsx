import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircleIcon, ArrowPathIcon, SpinnerIcon } from './Icons';
import { triggerHaptic } from '../utils/haptics';

// This assumes jsQR is loaded via a script tag in index.html
declare const jsQR: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;

interface QrScannerProps {
    hapticsEnabled: boolean;
}

type ScanStatus = 'initializing' | 'scanning' | 'success' | 'error' | 'success_display';

export const QrScanner: React.FC<QrScannerProps> = ({ hapticsEnabled }) => {
    const [status, setStatus] = useState<ScanStatus>('initializing');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | undefined>(undefined);
    const streamRef = useRef<MediaStream | undefined>(undefined);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = undefined;
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
    }, []);

    const tick = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    try {
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            if (hapticsEnabled) {
                                triggerHaptic();
                            }
                            setScanResult(code.data);
                            setStatus('success');
                            stopCamera();
                            return; // Stop the loop
                        }
                    } catch (e) {
                        console.error("jsQR error:", e);
                    }
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(tick);
    }, [stopCamera, hapticsEnabled]);

    const startScan = useCallback(() => {
        setStatus('initializing');
        setError(null);
        setScanResult(null);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                streamRef.current = stream;
                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    video.setAttribute("playsinline", "true"); // Required for iOS
                    
                    const handleCanPlay = () => {
                        video.play();
                        setStatus('scanning');
                        animationFrameId.current = requestAnimationFrame(tick);
                        video.removeEventListener('canplay', handleCanPlay);
                    }
                    video.addEventListener('canplay', handleCanPlay);
                }
            })
            .catch(err => {
                console.error("Camera access error:", err);
                setError("Could not access the camera. Please check permissions and try again.");
                setStatus('error');
            });
    }, [tick]);

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                setStatus('success_display');
            }, 1200); // Duration for the success animation
            return () => clearTimeout(timer);
        }
    }, [status]);

    useEffect(() => {
        startScan();
        return () => {
            stopCamera();
        };
    }, [startScan, stopCamera]);


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">QR Code Scanner</h2>
                <p className="text-sm text-slate-500 mt-1">Point your camera at a QR code to scan it.</p>
            </div>

            <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-800 rounded-2xl overflow-hidden shadow-digital-inset">
                <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'success_display' ? 'opacity-0' : 'opacity-100'}`} 
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* OVERLAYS */}

                {/* Initializing */}
                {status === 'initializing' && (
                    <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center text-center p-4">
                        <SpinnerIcon className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-xl font-bold text-slate-100">Starting Camera...</h3>
                    </div>
                )}
                
                {/* Scanning UI (box and line) */}
                {(status === 'initializing' || status === 'scanning') && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 relative scan-box">
                            <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                            <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                            <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                        </div>
                    </div>
                )}

                {/* Success Animation */}
                {status === 'success' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-pop-in">
                        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircleIcon className="w-24 h-24 text-white" />
                        </div>
                    </div>
                )}
                
                {/* Error Overlay */}
                {status === 'error' && (
                    <div className="absolute inset-0 bg-slate-800/95 flex flex-col items-center justify-center text-center p-8">
                        <h3 className="text-xl font-bold text-red-400">Camera Error</h3>
                        <p className="text-slate-300 mt-2 mb-6">{error}</p>
                        <button
                            onClick={startScan}
                            className="flex items-center justify-center space-x-2 w-full max-w-xs py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                )}
                
                {/* Success Display */}
                {status === 'success_display' && (
                    <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800">Scan Successful!</h3>
                        <p className="text-sm text-slate-500 mt-2 mb-4">The following data was scanned:</p>
                        <div className="p-4 bg-slate-300/50 rounded-lg text-left font-mono text-sm text-slate-700 break-all shadow-inner w-full">
                            {scanResult}
                        </div>
                        <button
                            onClick={startScan}
                            className="mt-6 flex items-center justify-center space-x-2 w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            <span>Scan Again</span>
                        </button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
