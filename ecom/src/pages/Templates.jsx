import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import BuildSitesHeader from '../components/BuildSitesHeader';
import TemplateGrid from '../components/TemplateGrid';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Pagination from '../components/ui/Pagination';
import { useProducts } from '../hooks/useQueries';
import { Filter, Search, X } from 'lucide-react';

const Templates = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get('search') || '';
    const debounceRef = React.useRef(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProductType, setSelectedProductType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // React Query hook for fetching products
    const { data: productsData, isLoading: loading, error, refetch } = useProducts({
        search: keyword,
        page: 1,
        limit: 100 // Fetch more for client-side filtering
    });

    const templates = productsData?.products || productsData || [];

    // Client-side filtering (defensive: ensure templates is an array)
    const templatesList = Array.isArray(templates) ? templates : [];
    const filteredTemplates = templatesList.filter(template => {
        if (selectedCategory !== 'all' && template.category !== selectedCategory) {
            return false;
        }
        if (selectedProductType !== 'all' && template.productType !== selectedProductType) {
            return false;
        }
        return true;
    });

    // Sorting
    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
            case 'price-high':
                return parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''));
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'popular':
                return (b.numSales || 0) - (a.numSales || 0);
            case 'newest':
            default:
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedTemplates.length / itemsPerPage);
    const paginatedTemplates = sortedTemplates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    // Get unique categories and types (defensive)
    const categories = ['all', ...new Set(templatesList.map(t => t.category).filter(Boolean))];
    const productTypes = [
        { value: 'all', label: 'All Products' },
        { value: 'fullstack', label: 'Full-Stack Projects' },
        { value: 'api', label: 'API Collections' },
        { value: 'component', label: 'Component Libraries' },
        { value: 'mobile', label: 'Mobile Apps' },
        { value: 'template', label: 'Templates' },
        { value: 'tool', label: 'Developer Tools' }
    ];

    return (
        <div className="bg-background min-h-screen">
            <BuildSitesHeader
                title="Explore our professional"
                highlight="marketplace"
                description="Production-ready code, full-stack projects, APIs, and components built for developers."
            />

            {/* Filter Bar */}
            <div className="w-full sticky top-20 z-40 px-6 pb-6 pt-2">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-nav rounded-2xl px-6 py-4 border border-white/5 shadow-2xl shadow-black/50">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Left: Filters */}
                            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Filter className="w-4 h-4" />
                                    <span className="text-sm font-medium">Filters:</span>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search templates..."
                                        defaultValue={keyword}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (debounceRef.current) clearTimeout(debounceRef.current);
                                            debounceRef.current = setTimeout(() => {
                                                setSearchParams(prev => {
                                                    const newParams = new URLSearchParams(prev);
                                                    if (value) {
                                                        newParams.set('search', value);
                                                    } else {
                                                        newParams.delete('search');
                                                    }
                                                    return newParams;
                                                });
                                            }, 500);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setSearchParams({ search: e.target.value });
                                            }
                                        }}
                                        className="pl-9 pr-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-48 md:w-64 placeholder:text-muted-foreground/50"
                                    />
                                </div>

                                {/* Product Type Filter */}
                                <select
                                    value={selectedProductType}
                                    onChange={(e) => handleFilterChange(setSelectedProductType, e.target.value)}
                                    className="px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer hover:bg-secondary"
                                >
                                    {productTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>

                                <div className="w-px h-6 bg-white/10 hidden md:block" />

                                {/* Category Pills */}
                                <div className="flex gap-2 flex-wrap">
                                    {categories.slice(0, 5).map(category => (
                                        <button
                                            key={category}
                                            onClick={() => handleFilterChange(setSelectedCategory, category)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedCategory === category
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                                : 'bg-transparent text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground'
                                                }`}
                                        >
                                            {category === 'all' ? 'All' : category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Sort & Count */}
                            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                <span className="text-sm text-muted-foreground font-medium hidden md:inline-block">
                                    {sortedTemplates.length} results
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer hover:bg-secondary"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <LoadingSkeleton count={6} />
                ) : error ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center py-12">
                        <div className="text-center max-w-md p-8 rounded-3xl bg-card border border-white/5 shadow-2xl">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <X className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Unavailable</h3>
                            <p className="text-muted-foreground mb-6">{error?.message || 'Failed to load templates'}</p>
                            <button
                                onClick={() => refetch()}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : sortedTemplates.length === 0 ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center py-12">
                        <div className="text-center max-w-md p-8 rounded-3xl bg-card border border-white/5 shadow-2xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSelectedProductType('all');
                                    setSearchParams({});
                                }}
                                className="bg-secondary text-foreground px-6 py-3 rounded-full font-bold hover:bg-secondary/80 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pb-12">
                        <TemplateGrid items={paginatedTemplates} />

                        {/* Pagination */}
                        <div className="mt-12">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={sortedTemplates.length}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Templates;
