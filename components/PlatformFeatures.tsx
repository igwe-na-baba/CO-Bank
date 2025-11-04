


import React from 'react';
import { PlatformSettings, PlatformTheme } from '../types';
// FIX: Import SpinnerIcon to resolve missing component error.
import { SendIcon, ActivityIcon, CreditCardIcon, SpinnerIcon } from './Icons';

interface PlatformFeaturesProps {
    settings: PlatformSettings;
    onUpdateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

const ThemeSwatch: React.FC<{ theme: PlatformTheme; color: string; currentTheme: PlatformTheme; onClick: (theme: PlatformTheme) => void }> = ({ theme, color, currentTheme, onClick }) => (
    <button
        onClick={() => onClick(theme)}
        className={`w-12 h-12 rounded-full transition-all duration-200 ${color} ${currentTheme === theme ? 'ring-2 ring-offset-2 ring-offset-slate-200 ring-slate-800' : ''}`}
        aria-label={`Set theme to ${theme}`}
    />
);

export const PlatformFeatures: React.FC<PlatformFeaturesProps> = ({ settings, onUpdateSettings }) => {
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Platform Features</h2>
                <p className="text-sm text-slate-500 mt-1">Customize your experience with features that integrate with your device.</p>
            </div>

            {/* Android Features */}
            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-300">
                    <div className="flex items-center space-x-3">
                        <img src="https://www.android.com/static/2016/img/logo-android-green_1x.png" alt="Android logo" className="w-6 h-auto" />
                        <h3 className="text-xl font-bold text-slate-800">Android Features</h3>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-700">Dynamic Theming (Material You)</h4>
                        <p className="text-sm text-slate-600 mb-3">Change the app's accent color to match your style. This simulates Android's Material You theming.</p>
                        <div className="flex space-x-4">
                            <ThemeSwatch theme="blue" color="bg-[#0052FF]" currentTheme={settings.theme} onClick={(t) => onUpdateSettings({ theme: t })} />
                            <ThemeSwatch theme="green" color="bg-[#16A34A]" currentTheme={settings.theme} onClick={(t) => onUpdateSettings({ theme: t })} />
                            <ThemeSwatch theme="purple" color="bg-[#7C2D91]" currentTheme={settings.theme} onClick={(t) => onUpdateSettings({ theme: t })} />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-slate-700">Haptic Feedback</h4>
                            <p className="text-sm text-slate-600">Enable subtle vibrations for a more tactile experience on key interactions.</p>
                        </div>
                         <label htmlFor="haptics-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="haptics-toggle" className="sr-only peer" checked={settings.hapticsEnabled} onChange={(e) => onUpdateSettings({ hapticsEnabled: e.target.checked })} />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-700">App Shortcuts (Simulation)</h4>
                        <p className="text-sm text-slate-600 mb-3">Long-press the app icon on your home screen for these quick actions.</p>
                        <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-slate-700"><SendIcon className="w-5 h-5"/><span>Send Money</span></div>
                            <div className="flex items-center space-x-3 text-sm text-slate-700"><ActivityIcon className="w-5 h-5"/><span>View Activity</span></div>
                            <div className="flex items-center space-x-3 text-sm text-slate-700"><CreditCardIcon className="w-5 h-5"/><span>Manage Card</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apple Features */}
            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-300">
                    <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.6 12.2c-.1-2.1 1.6-3.4 1.8-3.5-.1-.1-1.3-1.1-3.3-1.1-1.6 0-3.1 1-3.9 1-.8 0-2.1-.9-3.5-.9-1.9 0-3.6 1.1-4.6 2.8-.9 1.7-1.3 4.2-.1 6.3.8 1.9 2.2 3.5 3.9 3.5 1.5 0 2.3-.9 3.8-.9s2.3.9 3.8.9c1.7 0 3-1.5 3.9-3.3.5-1 .7-2.1.1-3.3zm-3.2-6.6c.9-.9 1.4-2.1 1.3-3.2-.1.1-1.2 1-2.4 1.9-.9.8-1.6 2-1.5 3.1 1.2.2 2.2-.1 2.6-1.8z"/></svg>
                        <h3 className="text-xl font-bold text-slate-800">Apple Features</h3>
                    </div>
                </div>
                 <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-700">Live Activity & Dynamic Island</h4>
                        <p className="text-sm text-slate-600 mb-3">When a transfer is in progress, a live status will appear in the Dynamic Island on supported iPhones.</p>
                        <div className="p-4 bg-black rounded-3xl w-64 mx-auto flex items-center justify-between shadow-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">JD</div>
                                <div className="text-white">
                                    <p className="text-sm font-semibold leading-tight">Jane Doe</p>
                                    <p className="text-xs text-slate-400 leading-tight">Sending...</p>
                                </div>
                            </div>
                            <div className="w-10 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-2 bg-green-500 w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};