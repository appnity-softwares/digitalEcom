import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Package, FileText, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const SearchBar = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popularSearches, setPopularSearches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        fetchPopularSearches();
    }, []);

    const fetchPopularSearches = async () => {
        try {
            const res = await api.get('/search/popular');
            setPopularSearches(res.data.popularSearches || []);
        } catch (err) {
            console.log('Popular searches not available');
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.length >= 2) {
            setLoading(true);
            debounceRef.current = setTimeout(() => {
                fetchSuggestions(value);
            }, 300);
        } else {
            setSuggestions([]);
        }
    };

    const fetchSuggestions = async (searchQuery) => {
        try {
            const res = await api.get(`/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
            setSuggestions(res.data.suggestions || []);
            setShowDropdown(true);
        } catch (err) {
            console.log('Suggestions error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/templates?search=${encodeURIComponent(query.trim())}`);
            onClose?.();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.url) {
            navigate(suggestion.url);
        } else {
            navigate(`/templates?search=${encodeURIComponent(suggestion.text)}`);
        }
        onClose?.();
    };

    const handlePopularClick = (term) => {
        setQuery(term);
        navigate(`/templates?search=${encodeURIComponent(term)}`);
        onClose?.();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'product': return <Package className="w-4 h-4" />;
            case 'doc': return <FileText className="w-4 h-4" />;
            case 'tool': return <Wrench className="w-4 h-4" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search templates, docs, tools..."
                        className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900 text-lg transition-all shadow-lg"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); setSuggestions([]); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                    {loading && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </form>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                        {/* Suggestions */}
                        {suggestions.length > 0 ? (
                            <div className="py-2">
                                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</p>
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <span className="text-gray-400">{getIcon(suggestion.type)}</span>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium">{suggestion.text}</p>
                                            {suggestion.category && (
                                                <p className="text-xs text-gray-500">{suggestion.category}</p>
                                            )}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        ) : query.length < 2 ? (
                            // Popular searches when no query
                            <div className="py-4">
                                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Popular Searches</p>
                                <div className="px-4 flex flex-wrap gap-2">
                                    {popularSearches.slice(0, 8).map((term, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePopularClick(term)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : query.length >= 2 && !loading && (
                            <div className="p-6 text-center text-gray-500">
                                <p>No results found for "{query}"</p>
                                <button
                                    onClick={handleSearch}
                                    className="mt-2 text-blue-600 font-medium hover:underline"
                                >
                                    Search all products
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
