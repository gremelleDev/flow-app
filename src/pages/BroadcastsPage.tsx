// File: src/pages/BroadcastsPage.tsx
export const BroadcastsPage = () => (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Broadcasts</h1>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors">
                + New Broadcast
            </button>
        </div>
        <p className="text-gray-600">This page will list all the one-off email broadcasts.</p>
    </div>
);