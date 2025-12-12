import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ChartProps {
  labels?: string[];
  dataPoints?: number[];
  title?: string;
}

const Chart: React.FC<ChartProps> = ({
  labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
  dataPoints = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 100),
  ),
  title = "Performance Metrics",
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Requests per second",
        data: dataPoints,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default Chart;
