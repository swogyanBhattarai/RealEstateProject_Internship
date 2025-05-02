'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchETHPrice } from '../../context/fetchETHPrice';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { usePropertyContext } from '../../context/PropertyContext';

const timeOptions = [
  { label: '1 Min', value: '1' },
  { label: '24 H', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'All Time', value: 'max' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { pendingProperties, approvedProperties } = usePropertyContext();
  const [selectedTime, setSelectedTime] = useState('7d');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchETHPrice(selectedTime);
        const ethData = res?.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleDateString(),  // Convert timestamp to readable date
          price: item.price,
        }));
        console.log(res);
        setChartData(ethData || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [selectedTime]);

  // Handle time range change
  const handleTimeChange = (range: string) => {
    setSelectedTime(range);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 p-6 bg-white/5 backdrop-blur-md border-r border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-blue-300 mb-6 tracking-wide">Admin Panel</h2>
        <nav className="space-y-4">
          {['properties', 'users', 'settings'].map((item) => (
            <div
              key={item}
              className="cursor-pointer text-lg px-3 py-2 rounded-md hover:bg-white/10 transition hover:text-blue-400"
              onClick={() => router.push(`/page/admin/${item}`)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 space-y-12">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-4 tracking-tight">Overview</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md transition-transform transform hover:scale-105">
            <h2 className="text-4xl font-bold text-blue-300 animate-pulse">{pendingProperties.length}</h2>
            <p className="text-sm text-gray-400 mt-1">Pending Properties</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md transition-transform transform hover:scale-105">
            <h2 className="text-4xl font-bold text-green-400 animate-pulse">{approvedProperties.length}</h2>
            <p className="text-sm text-gray-400 mt-1">Approved Properties</p>
          </div>
        </div>

        {/* ETH/USD Chart */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-300 tracking-wide">ETH/USD Chart</h3>
            {timeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleTimeChange(option.value)}
            className={selectedTime === option.value ? 'active' : ''}
          >
            {option.label}
          </button>
        ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ethGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#cbd5e1" fontSize={12} />
                <YAxis stroke="#cbd5e1" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  fill="url(#ethGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Listings Trend Placeholder */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <h3 className="text-lg font-semibold text-green-300 mb-2">Listings Trend (Coming Soon)</h3>
          <p className="text-sm text-gray-400">This graph will soon show property listing history using smart contract data.</p>
        </div>
      </main>
    </div>
  );
}
