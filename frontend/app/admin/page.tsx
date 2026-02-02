import React from 'react';
import { Card } from '@/components/ui/Card';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card title="Total Users">
                    <p className="text-3xl font-bold text-gray-900">1,234</p>
                </Card>
                <Card title="Total Events">
                    <p className="text-3xl font-bold text-blue-600">567</p>
                </Card>
                <Card title="Active Sponsorships">
                    <p className="text-3xl font-bold text-green-600">89</p>
                </Card>
                <Card title="Pending Reports">
                    <p className="text-3xl font-bold text-red-600">12</p>
                </Card>
            </div>

            <Card title="System Health">
                <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-700 font-medium">All systems operational</span>
                </div>
            </Card>
        </div>
    );
}
