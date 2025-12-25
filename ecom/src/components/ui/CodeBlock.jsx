import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ code, language = 'jsx' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={handleCopy}
                    className="p-2 bg-secondary border border-white/10 rounded-lg hover:bg-secondary/80 transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                </button>
            </div>
            <pre className="bg-background border border-white/10 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-foreground font-mono">{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
