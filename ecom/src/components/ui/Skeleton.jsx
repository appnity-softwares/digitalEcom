import React from 'react';

/**
 * Loading Skeleton Component
 * 
 * Reusable skeleton loader for better perceived performance
 * while data is being fetched.
 */

export const SkeletonCard = ({ className = "" }) => (
    <div className={`animate-pulse ${className}`}>
        <div className="bg-secondary rounded-xl h-64 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
        </div>
    </div>
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
    <div className={`animate-pulse space-y-2 ${className}`}>
        {[...Array(lines)].map((_, i) => (
            <div key={i} className="h-4 bg-secondary rounded" style={{ width: `${100 - (i * 10)}%` }}></div>
        ))}
    </div>
);

export const SkeletonCircle = ({ className = "" }) => (
    <div className={`animate-pulse bg-secondary rounded-full ${className}`}></div>
);

export const SkeletonProductCard = () => (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-square bg-secondary"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-8 bg-secondary rounded mt-4"></div>
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="animate-pulse">
        {/* Header */}
        <div className="flex gap-4 mb-4">
            {[...Array(cols)].map((_, i) => (
                <div key={i} className="h-8 bg-secondary rounded flex-1"></div>
            ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 mb-2">
                {[...Array(cols)].map((_, colIndex) => (
                    <div key={colIndex} className="h-12 bg-secondary rounded flex-1"></div>
                ))}
            </div>
        ))}
    </div>
);
