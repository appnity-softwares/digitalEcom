import { useMyApiKeys, useGenerateToolApiKey, useSaasTools } from '../hooks/useQueries';

const ImageUploadAPI = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [copied, setCopied] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const { data: apiKeys = [], isLoading: keysLoading } = useMyApiKeys();
    const { data: toolsData = [] } = useSaasTools();
    const generateKeyMutation = useGenerateToolApiKey();

    const apiKey = React.useMemo(() => {
        return apiKeys.find(k =>
            k.tool?.slug === 'image-upload' || k.tool?.category === 'Storage'
        );
    }, [apiKeys]);

    const generateApiKey = async () => {
        if (!user) {
            showToast('Please login to generate an API key', 'error');
            return;
        }

        try {
            let uploadTool = toolsData.find(t => t.slug === 'image-upload');

            if (!uploadTool) {
                const createRes = await api.post('/saas', {
                    name: 'Image Upload API',
                    slug: 'image-upload',
                    description: 'Upload images to cloud storage via API',
                    category: 'Storage',
                    icon: '🖼️',
                    isActive: true
                });
                uploadTool = createRes.data.tool;
            }

            generateKeyMutation.mutate({
                toolId: uploadTool.id || uploadTool._id,
                name: 'Image Upload Key'
            }, {
                onSuccess: () => showToast('API key generated!', 'success'),
                onError: (err) => showToast(err.response?.data?.message || 'Failed to generate key', 'error')
            });
        } catch (err) {
            showToast('Failed to handle tool lookup', 'error');
        }
    };

    const loading = keysLoading || generateKeyMutation.isPending;

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const codeExamples = {
        curl: `curl -X POST https://api.codestudio.dev/api/upload/image \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/image.jpg"`,
        javascript: `const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('https://api.codestudio.dev/api/upload/image', {
    method: 'POST',
    headers: {
        'x-api-key': 'YOUR_API_KEY'
    },
    body: formData
});

const data = await response.json();
console.log(data.data.url); // Your image URL`,
        python: `import requests

url = 'https://api.codestudio.dev/api/upload/image'
headers = {'x-api-key': 'YOUR_API_KEY'}
files = {'image': open('image.jpg', 'rb')}

response = requests.post(url, headers=headers, files=files)
data = response.json()
print(data['data']['url'])  # Your image URL`,
        node: `const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('image', fs.createReadStream('./image.jpg'));

const response = await axios.post(
    'https://api.codestudio.dev/api/upload/image',
    form,
    {
        headers: {
            'x-api-key': 'YOUR_API_KEY',
            ...form.getHeaders()
        }
    }
);

console.log(response.data.data.url);`
    };

    const [selectedLang, setSelectedLang] = useState('curl');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            SaaS API Tool
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold mb-6"
                        >
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Image Upload
                            </span>
                            <br />API
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
                        >
                            Upload images to the cloud with a simple API call.
                            Powered by Cloudflare R2 for blazing-fast global delivery.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            {!apiKey ? (
                                <button
                                    onClick={generateApiKey}
                                    disabled={loading}
                                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Key className="w-5 h-5" />
                                    )}
                                    Get Free API Key
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-700">
                                    <p className="text-gray-400 text-sm mb-2">Your API Key:</p>
                                    <div className="flex items-center gap-3">
                                        <code className="font-mono text-sm bg-gray-900 px-4 py-2 rounded-lg">
                                            {apiKey.key?.substring(0, 20)}...
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(apiKey.key, 'apikey')}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            {copied === 'apikey' ? (
                                                <Check className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 border-t border-gray-800">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Lightning Fast', desc: 'Global CDN with edge caching for instant delivery' },
                            { icon: Shield, title: 'Secure Storage', desc: 'Enterprise-grade security with Cloudflare R2' },
                            { icon: Globe, title: 'Global Access', desc: 'Access your images from anywhere in the world' },
                            { icon: FileImage, title: '10MB Per File', desc: 'Upload images up to 10MB in size' },
                            { icon: Code, title: 'Simple API', desc: 'Just one API call to upload and get a URL' },
                            { icon: Clock, title: '99.9% Uptime', desc: 'Reliable infrastructure you can count on' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all"
                            >
                                <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* API Documentation */}
            <section className="py-20 border-t border-gray-800">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">API Documentation</h2>

                        {/* Endpoints */}
                        <div className="space-y-8">
                            {/* Upload Single Image */}
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">POST</span>
                                    <code className="text-lg font-mono">/api/upload/image</code>
                                </div>
                                <p className="text-gray-400 mb-6">Upload a single image file.</p>

                                {/* Language Tabs */}
                                <div className="flex gap-2 mb-4 overflow-x-auto">
                                    {Object.keys(codeExamples).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedLang === lang
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {lang === 'curl' ? 'cURL' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Code Block */}
                                <div className="relative">
                                    <pre className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-sm">
                                        <code className="text-gray-300">
                                            {codeExamples[selectedLang]}
                                        </code>
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(codeExamples[selectedLang], 'code')}
                                        className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        {copied === 'code' ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Response Example */}
                                <h4 className="text-lg font-semibold mt-6 mb-3">Response</h4>
                                <pre className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-sm">
                                    <code className="text-gray-300">{`{
  "success": true,
  "data": {
    "url": "https://cdn.codestudio.dev/uploads/...",
    "key": "uploads/user123/1702...-abc123.jpg",
    "filename": "my-image.jpg",
    "size": 256000,
    "contentType": "image/jpeg",
    "uploadedAt": "2024-12-12T10:30:00.000Z"
  }
}`}</code>
                                </pre>
                            </div>

                            {/* Upload Multiple */}
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">POST</span>
                                    <code className="text-lg font-mono">/api/upload/images</code>
                                </div>
                                <p className="text-gray-400 mb-4">Upload multiple images (up to 10 per request).</p>
                                <p className="text-sm text-gray-500">Use form-data field <code className="bg-gray-800 px-2 py-1 rounded">images</code> (array)</p>
                            </div>

                            {/* Delete Image */}
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold">DELETE</span>
                                    <code className="text-lg font-mono">/api/upload/image/:key</code>
                                </div>
                                <p className="text-gray-400">Delete an uploaded image by its key.</p>
                            </div>

                            {/* Get Stats */}
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold">GET</span>
                                    <code className="text-lg font-mono">/api/upload/stats</code>
                                </div>
                                <p className="text-gray-400">Get your API usage statistics.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 border-t border-gray-800">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 text-center">Simple Pricing</h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                name: 'Free',
                                price: '$0',
                                features: ['100 uploads/month', '10MB per file', 'Basic support'],
                                cta: 'Get Started',
                                popular: false
                            },
                            {
                                name: 'Pro',
                                price: '$9',
                                features: ['10,000 uploads/month', '25MB per file', 'Priority support', 'Analytics dashboard'],
                                cta: 'Upgrade to Pro',
                                popular: true
                            },
                            {
                                name: 'Enterprise',
                                price: '$49',
                                features: ['Unlimited uploads', '100MB per file', 'Dedicated support', 'Custom CDN domain', 'SLA guarantee'],
                                cta: 'Contact Sales',
                                popular: false
                            }
                        ].map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-8 rounded-2xl border ${plan.popular
                                    ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-blue-500'
                                    : 'bg-gray-800/50 border-gray-700'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-gray-300">
                                            <Check className="w-5 h-5 text-green-400" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${plan.popular
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ImageUploadAPI;
