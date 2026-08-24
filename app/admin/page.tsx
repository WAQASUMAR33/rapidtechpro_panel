import { Suspense } from 'react';
import AdminDashboard from './dashboard';

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400 font-medium">Loading Dashboard...</div>}>
            <AdminDashboard />
        </Suspense>
    );
}

