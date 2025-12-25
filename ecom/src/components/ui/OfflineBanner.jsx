import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineBanner = () => {
    const { isOnline, isOffline, wasOffline } = useOnlineStatus();

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-[200] bg-[#0055FF] text-white"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <WifiOff className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold">You're offline</p>
                                <p className="text-sm text-white/80">Some features may not be available</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </motion.div>
            )}

            {isOnline && wasOffline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-[200] bg-[#0055FF] text-white"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Wifi className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">You're back online!</p>
                            <p className="text-sm text-white/80">Connection restored</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineBanner;
