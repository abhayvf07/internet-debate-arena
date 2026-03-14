import React from 'react';

export const DebateCardSkeleton = () => {
    return (
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 flex flex-col gap-4 animate-pulse">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50"></div>
                    <div>
                        <div className="w-24 h-4 bg-slate-700/50 rounded mb-2"></div>
                        <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
                    </div>
                </div>
                <div className="w-20 h-6 bg-slate-700/50 rounded-full"></div>
            </div>

            <div className="space-y-3 mt-2">
                <div className="w-3/4 h-6 bg-slate-700/50 rounded"></div>
                <div className="w-full h-4 bg-slate-700/50 rounded"></div>
                <div className="w-5/6 h-4 bg-slate-700/50 rounded"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-10 bg-slate-700/50 rounded-lg"></div>
                <div className="h-10 bg-slate-700/50 rounded-lg"></div>
            </div>

            <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                    <div className="w-16 h-6 bg-slate-700/50 rounded-full"></div>
                    <div className="w-16 h-6 bg-slate-700/50 rounded-full"></div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-slate-700/50 rounded"></div>
                    <div className="w-8 h-8 bg-slate-700/50 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export const PageSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-10">
                <div className="w-1/3 h-10 bg-slate-800 rounded-lg"></div>
                <div className="w-48 h-10 bg-slate-800 rounded-lg"></div>
            </div>

            {/* Layout Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <DebateCardSkeleton />
                    <DebateCardSkeleton />
                    <DebateCardSkeleton />
                </div>

                {/* Sidebar Skeleton */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 h-64"></div>
                    <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 h-96"></div>
                </div>
            </div>
        </div>
    );
};

export default { DebateCardSkeleton, PageSkeleton };
