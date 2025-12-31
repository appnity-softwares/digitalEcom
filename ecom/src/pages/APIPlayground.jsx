import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Camera, Palette, Download, Copy, Check, Loader,
    ArrowRight, Key, Lock, Sparkles, QrCode, Smartphone
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const APIPlayground = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('screenshot');

    // Check for query param on mount
    useEffect(() => {
        const tool = searchParams.get('tool');
        if (tool) {
            if (tool === 'qr') setActiveTab('qr');
            if (tool === 'ua') setActiveTab('ua');
        }
    }, [searchParams]);

    // Mock Premium check - valid if user has 'premium' plan or subscription
    const isPremium = user?.subscription?.plan === 'premium' || user?.isPremium;

    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            API Playground
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        Try Our APIs
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Test our developer APIs directly in the browser. Generate an API key to start using them in your projects.
                    </p>
                </motion.div>

                {/* API Key Notice */}
                {!user && (
                    <div className="glass-card p-6 mb-8 flex items-center gap-4 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Key className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">API Key Required</p>
                            <p className="text-sm text-muted-foreground">
                                Login to generate an API key and access premium tools.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('screenshot')}
                        className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'screenshot' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
                    >
                        <Camera className="w-4 h-4" />
                        Screenshot API
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'colors' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
                    >
                        <Palette className="w-4 h-4" />
                        Color Palette API
                    </button>
                    <button
                        onClick={() => setActiveTab('qr')}
                        className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'qr' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
                    >
                        <QrCode className="w-4 h-4" />
                        QR Code API
                        <Lock className="w-3 h-3 ml-1 opacity-50" />
                    </button>
                    <button
                        onClick={() => setActiveTab('ua')}
                        className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'ua' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
                    >
                        <Smartphone className="w-4 h-4" />
                        UA Parser
                        <Lock className="w-3 h-3 ml-1 opacity-50" />
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'screenshot' && <ScreenshotDemo />}
                {activeTab === 'colors' && <ColorPaletteDemo />}

                {activeTab === 'qr' && (
                    <ProtectedTool isPremium={isPremium}>
                        <QRCodeDemo />
                    </ProtectedTool>
                )}

                {activeTab === 'ua' && (
                    <ProtectedTool isPremium={isPremium}>
                        <UAParserDemo />
                    </ProtectedTool>
                )}
            </div>
        </div>
    );
};

// Protected Tool Wrapper
const ProtectedTool = ({ isPremium, children }) => {
    if (isPremium) return children;

    return (
        <div className="bg-card border border-border rounded-xl p-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Premium Feature</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                    This API tool is available exclusively for Premium subscribers. Upgrade your plan to access advanced developer tools.
                </p>
                <Link to="/pricing" className="btn-primary px-8 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Upgrade to Premium
                </Link>
            </div>
            {/* Blurred Content Preview */}
            <div className="opacity-20 pointer-events-none filter blur-sm select-none">
                {children}
            </div>
        </div>
    );
};

// Screenshot Demo Component
const ScreenshotDemo = () => {
    const [url, setUrl] = useState('https://google.com');
    const [width, setWidth] = useState(1280);
    const [height, setHeight] = useState(800);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            await new Promise(r => setTimeout(r, 2000));
            setResult({
                image: `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`,
                width,
                height
            });
            showToast('Screenshot captured!', 'success');
        } catch (err) {
            setError('Failed to capture screenshot. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Capture Website Screenshot</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Website URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Width (px)
                            </label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                min="320"
                                max="1920"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Height (px)
                            </label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                min="320"
                                max="1080"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Capturing...
                            </>
                        ) : (
                            <>
                                <Camera className="w-4 h-4" />
                                Capture Screenshot
                            </>
                        )}
                    </button>
                </form>

                {/* API Example */}
                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">API Request</p>
                    <pre className="bg-secondary/50 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground font-mono">
                        {`POST /api/tools/screenshot
Headers: { "x-api-key": "your_key" }
Body: {
  "url": "${url}",
  "width": ${width},
  "height": ${height}
}`}
                    </pre>
                </div>
            </div>

            {/* Result */}
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Result</h3>

                {!result && !loading && !error && (
                    <div className="aspect-video bg-secondary/30 rounded-xl flex items-center justify-center border border-dashed border-border">
                        <p className="text-muted-foreground">Screenshot will appear here</p>
                    </div>
                )}

                {loading && (
                    <div className="aspect-video bg-secondary/30 rounded-xl flex items-center justify-center border border-border">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {error && (
                    <div className="aspect-video bg-destructive/10 rounded-xl flex items-center justify-center text-destructive border border-destructive/20">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        <img
                            src={result.image}
                            alt="Screenshot"
                            className="w-full rounded-xl border border-border"
                        />
                        <a
                            href={result.image}
                            target="_blank"
                            rel="noopener"
                            className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

// Color Palette Demo Component
const ColorPaletteDemo = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [colors, setColors] = useState(null);
    const [copied, setCopied] = useState(null);
    const { showToast } = useToast();

    const sampleImages = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) return;

        setLoading(true);

        try {
            await new Promise(r => setTimeout(r, 1500));
            const mockColors = [
                { hex: '#2D3436', name: 'Dark', rgb: [45, 52, 54] },
                { hex: '#636E72', name: 'Muted', rgb: [99, 110, 114] },
                { hex: '#B2BEC3', name: 'Light Muted', rgb: [178, 190, 195] },
                { hex: '#74B9FF', name: 'Vibrant', rgb: [116, 185, 255] },
                { hex: '#0984E3', name: 'Dark Vibrant', rgb: [9, 132, 227] },
                { hex: '#DFE6E9', name: 'Light', rgb: [223, 230, 233] }
            ];
            setColors(mockColors);
            showToast('Colors extracted!', 'success');
        } catch (err) {
            showToast('Failed to extract colors', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyColor = (hex) => {
        navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Extract Color Palette</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Or try a sample:</p>
                        <div className="flex gap-2">
                            {sampleImages.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setImageUrl(img)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${imageUrl === img ? 'border-primary' : 'border-transparent'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !imageUrl}
                        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            <>
                                <Palette className="w-4 h-4" />
                                Extract Colors
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">API Request</p>
                    <pre className="bg-secondary/50 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground font-mono">
                        {`POST /api/tools/colors
Headers: { "x-api-key": "your_key" }
Body: { "imageUrl": "..." }`}
                    </pre>
                </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Extracted Colors</h3>

                {!colors && !loading && (
                    <div className="h-64 bg-secondary/30 rounded-xl flex items-center justify-center border border-dashed border-border">
                        <p className="text-muted-foreground">Colors will appear here</p>
                    </div>
                )}

                {loading && (
                    <div className="h-64 bg-secondary/30 rounded-xl flex items-center justify-center border border-border">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {colors && (
                    <div className="space-y-4">
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Source"
                                className="w-full h-32 object-cover rounded-xl border border-border"
                            />
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            {colors.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => copyColor(color.hex)}
                                    className="group relative"
                                >
                                    <div
                                        className="h-16 rounded-xl mb-2 transition-transform group-hover:scale-105 border border-border shadow-sm"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <p className="text-xs font-mono text-foreground">
                                        {copied === color.hex ? (
                                            <span className="flex items-center gap-1 text-green-500">
                                                <Check className="w-3 h-3" /> Copied
                                            </span>
                                        ) : (
                                            color.hex
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{color.name}</p>
                                </button>
                            ))}
                        </div>

                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-2">CSS Variables</p>
                            <pre className="text-xs font-mono text-foreground">
                                {colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n')}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// QR Code Demo Component
const QRCodeDemo = () => {
    const [text, setText] = useState('https://example.com');
    const [loading, setLoading] = useState(false);
    const [qrUrl, setQrUrl] = useState(null);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text) return;
        setLoading(true);

        try {
            await new Promise(r => setTimeout(r, 1000));
            setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`);
            showToast('QR Code generated!', 'success');
        } catch (err) {
            showToast('Failed to generate QR Code', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Generate QR Code</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Content</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="URL, text, or email..."
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><QrCode className="w-4 h-4" /> Generate QR</>}
                    </button>
                </form>
                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">API Request</p>
                    <pre className="bg-secondary/50 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground font-mono">
                        {`POST /api/tools/qr
Headers: { "x-api-key": "your_key" }
Body: { "content": "${text}", "size": "300x300" }`}
                    </pre>
                </div>
            </div>

            <div className="glass-card p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
                {qrUrl ? (
                    <div className="text-center w-full">
                        <div className="bg-white p-4 rounded-xl mb-4 inline-block shadow-lg">
                            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <a href={qrUrl} download="qrcode.png" target="_blank" rel="noreferrer" className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Download PNG
                        </a>
                    </div>
                ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                        <QrCode className="w-12 h-12 opacity-20" />
                        <p>QR Code will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// UA Parser Demo Component
const UAParserDemo = () => {
    const [ua, setUa] = useState(navigator.userAgent);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            const isMobile = /Mobile|Android|iPhone/i.test(ua);
            const browser = /Chrome/i.test(ua) ? "Chrome" : /Firefox/i.test(ua) ? "Firefox" : /Safari/i.test(ua) ? "Safari" : "Unknown";
            const os = /Windows/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "macOS" : /Android/i.test(ua) ? "Android" : /iOS/i.test(ua) ? "iOS" : "Linux";

            setResult({
                browser: { name: browser, version: "Latest" },
                os: { name: os, version: "Latest" },
                device: { type: isMobile ? "Mobile" : "Desktop", model: "Unknown" },
                ua: ua
            });
            showToast('User Agent parsed!', 'success');
        } catch (err) {
            showToast('Parsing failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Parse User Agent</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">User Agent String</label>
                        <textarea
                            value={ua}
                            onChange={(e) => setUa(e.target.value)}
                            className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><Smartphone className="w-4 h-4" /> Parse String</>}
                    </button>
                    <button type="button" onClick={() => setUa(navigator.userAgent)} className="text-xs text-primary hover:underline mt-2">
                        Use my current User Agent
                    </button>
                </form>
                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">API Request</p>
                    <pre className="bg-secondary/50 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground font-mono">
                        {`POST /api/tools/ua
Headers: { "x-api-key": "your_key" }
Body: { "ua": "${ua.substring(0, 30)}..." }`}
                    </pre>
                </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">Parsed Data</h3>
                {result ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Browser</p>
                                <p className="font-semibold text-foreground">{result.browser.name}</p>
                            </div>
                            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">OS</p>
                                <p className="font-semibold text-foreground">{result.os.name}</p>
                            </div>
                            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Device Type</p>
                                <p className="font-semibold text-foreground">{result.device.type}</p>
                            </div>
                            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Is Bot</p>
                                <p className="font-semibold text-foreground">False</p>
                            </div>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg overflow-hidden border border-border">
                            <p className="text-xs text-muted-foreground mb-2">JSON Response</p>
                            <pre className="text-xs font-mono overflow-x-auto text-green-500">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 bg-secondary/30 rounded-xl flex items-center justify-center border border-dashed border-border">
                        <p className="text-muted-foreground">Parsed data will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default APIPlayground;
