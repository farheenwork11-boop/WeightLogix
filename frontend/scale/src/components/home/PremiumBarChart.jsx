import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", value: 40000 },
  { name: "Feb", value: 95000 },
  { name: "Mar", value: 15000 },
  { name: "Apr", value: 85000 },
  { name: "May", value: 35000 },
  { name: "Jun", value: 70000 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-primary to-primary-light backdrop-blur-md text-white text-sm px-4 py-3 rounded-xl shadow-2xl border border-white/30">
        <div className="font-bold text-base">{payload[0].value.toLocaleString()} tons</div>
        <div className="text-xs text-white/70 mt-1">Monthly Operations</div>
      </div>
    );
  }
  return null;
};

const CustomBar = (props) => {
  const { x, y, width, height, value } = props;
  
  return (
    <g>
      {/* Bar shadow */}
      <rect
        x={x}
        y={y + 2}
        width={width}
        height={height}
        rx="8"
        ry="8"
        fill="rgba(11, 51, 98, 0.2)"
      />
      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="8"
        ry="8"
        fill="url(#colorGradient)"
        className="drop-shadow-lg hover:brightness-110 transition-all duration-300"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(11, 51, 98, 0.3))',
        }}
      />
      {/* Top highlight */}
      <rect
        x={x}
        y={y}
        width={width}
        height={4}
        rx="2"
        fill="rgba(255, 255, 255, 0.3)"
      />
    </g>
  );
};

export default function PremiumBarChart() {
  return (
    <div className="w-full h-[450px] bg-gradient-to-br from-white via-gray-50 to-white p-8 rounded-3xl shadow-2xl border-2 border-white/50 backdrop-blur-sm relative overflow-hidden">
      {/* Premium card glow effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
      
      {/* Premium badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary-light backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="text-xs font-bold text-white">LIVE</div>
        </div>
      </div>

      <h2 className="text-primary text-2xl font-black mb-6 text-center tracking-wide relative z-10">
        Monthly Operations
        <div className="w-16 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto mt-3 rounded-full"></div>
      </h2>

      <ResponsiveContainer width="100%" height="75%">
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(11, 51, 98, 0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <XAxis
            dataKey="name"
            stroke="#0B3362"
            tick={{ fill: "#0B3362", fontSize: 13, fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
          />
          
          <YAxis
            domain={[0, 100000]}
            tickCount={6}
            stroke="#0B3362"
            tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
            tickLine={{ stroke: '#E5E7EB', strokeWidth: 1.5 }}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
            tickFormatter={(value) => `${value/1000}k`}
          />

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(11, 51, 98, 0.05)' }}
            position={{ y: 0 }}
          />

          <Bar
            dataKey="value"
            shape={<CustomBar />}
            animationDuration={1500}
            animationEasing="ease-out"
          />

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E4D8C" stopOpacity={1} />
              <stop offset="50%" stopColor="#0B3362" stopOpacity={1} />
              <stop offset="100%" stopColor="#071F3D" stopOpacity={1} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}