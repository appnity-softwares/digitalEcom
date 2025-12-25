import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
    Camera, Palette, Download, Copy, Check, Loader,
    ArrowRight, Key, Lock, Sparkles
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const APIPlayground = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('screenshot');

    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10">
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
                    <div className="glass-card p-6 mb-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Key className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">API Key Required</p>
                            <p className="text-sm text-muted-foreground">
                                Login and generate an API key from your profile to use these tools in production.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('screenshot')}
                        className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'screenshot' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                    >
                        <Camera className="w-4 h-4" />
                        Screenshot API
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'colors' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                    >
                        <Palette className="w-4 h-4" />
                        Color Palette API
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'screenshot' && <ScreenshotDemo />}
                {activeTab === 'colors' && <ColorPaletteDemo />}
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
            // Demo mode - show mock result
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
            <div className="card">
                <h3 className="text-title text-[var(--text-primary)] mb-6">Capture Website Screenshot</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                            Website URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="input"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                Width (px)
                            </label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                className="input"
                                min="320"
                                max="1920"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                Height (px)
                            </label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="input"
                                min="320"
                                max="1080"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
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
                <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">API Request</p>
                    <pre className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-xs overflow-x-auto">
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
            <div className="card">
                <h3 className="text-title text-[var(--text-primary)] mb-6">Result</h3>

                {!result && !loading && !error && (
                    <div className="aspect-video bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                        <p className="text-[var(--text-tertiary)]">Screenshot will appear here</p>
                    </div>
                )}

                {loading && (
                    <div className="aspect-video bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                        <Loader className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                    </div>
                )}

                {error && (
                    <div className="aspect-video bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        <img
                            src={result.image}
                            alt="Screenshot"
                            className="w-full rounded-xl border border-[var(--border-primary)]"
                        />
                        <a
                            href={result.image}
                            target="_blank"
                            rel="noopener"
                            className="btn-secondary w-full flex items-center justify-center gap-2"
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
            // Demo mode - generate mock colors
            await new Promise(r => setTimeout(r, 1500));

            // Mock color extraction based on image
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
            {/* Form */}
            <div className="card">
                <h3 className="text-title text-[var(--text-primary)] mb-6">Extract Color Palette</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="input"
                            required
                        />
                    </div>

                    {/* Sample Images */}
                    <div>
                        <p className="text-sm text-[var(--text-tertiary)] mb-2">Or try a sample:</p>
                        <div className="flex gap-2">
                            {sampleImages.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setImageUrl(img)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${imageUrl === img ? 'border-[var(--accent-primary)]' : 'border-transparent'
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
                        className="btn-primary w-full flex items-center justify-center gap-2"
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

                {/* API Example */}
                <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">API Request</p>
                    <pre className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-xs overflow-x-auto">
                        {`POST /api/tools/colors
Headers: { "x-api-key": "your_key" }
Body: { "imageUrl": "..." }`}
                    </pre>
                </div>
            </div>

            {/* Result */}
            <div className="card">
                <h3 className="text-title text-[var(--text-primary)] mb-6">Extracted Colors</h3>

                {!colors && !loading && (
                    <div className="h-64 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                        <p className="text-[var(--text-tertiary)]">Colors will appear here</p>
                    </div>
                )}

                {loading && (
                    <div className="h-64 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                        <Loader className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                    </div>
                )}

                {colors && (
                    <div className="space-y-4">
                        {/* Preview */}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Source"
                                className="w-full h-32 object-cover rounded-xl"
                            />
                        )}

                        {/* Color Swatches */}
                        <div className="grid grid-cols-3 gap-3">
                            {colors.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => copyColor(color.hex)}
                                    className="group relative"
                                >
                                    <div
                                        className="h-16 rounded-xl mb-2 transition-transform group-hover:scale-105"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <p className="text-xs font-mono text-[var(--text-primary)]">
                                        {copied === color.hex ? (
                                            <span className="flex items-center gap-1 text-green-500">
                                                <Check className="w-3 h-3" /> Copied
                                            </span>
                                        ) : (
                                            color.hex
                                        )}
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)]">{color.name}</p>
                                </button>
                            ))}
                        </div>

                        {/* CSS Output */}
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                            <p className="text-xs text-[var(--text-tertiary)] mb-2">CSS Variables</p>
                            <pre className="text-xs font-mono">
                                {colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n')}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default APIPlayground;
