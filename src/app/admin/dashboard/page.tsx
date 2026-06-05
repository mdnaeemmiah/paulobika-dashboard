"use client";

import React, { useMemo, useState, useEffect } from "react";
import { FiUsers } from "react-icons/fi";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import axios from "axios";

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
};

type UserStats = {
  totalUsers: number;
  activeUsers: number;
};

type ApiStatsResponse = {
  total_users: number;
  total_active_users: number;
};

type ApiGraphDataResponse = {
  year: number;
  data: Array<{
    month: number;
    month_name: string;
    new_users: number;
    cumulative_active_users: number;
  }>;
};

type RecentActivityRow = {
  user: string;
  action: string;
  date: string;
  status: "Active" | "Inactive";
  createdAtTimestamp: number;
};

type GraphPoint = {
  month: string;
  value: number;
};

const formatCount = (value: number): string => {
  return value.toLocaleString("en-US");
};

const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const defaultGraphPoints: GraphPoint[] = defaultMonths.map((month) => ({ month, value: 0 }));

const availableYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

const barPoints = [
  { label: "Dry", value: 850 },
  { label: "Wet", value: 630 },
  { label: "Fresh", value: 420 },
  { label: "Prescription", value: 260 },
  { label: "Raw", value: 190 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  
  const [activities] = useState<RecentActivityRow[]>([
    {
      user: "Brooklyn Simmons",
      action: "User account activity",
      date: "Jun 01, 2026",
      status: "Active",
      createdAtTimestamp: 1717200000000,
    },
    {
      user: "Cody Fisher",
      action: "User account activity",
      date: "May 24, 2026",
      status: "Inactive",
      createdAtTimestamp: 1716508800000,
    },
    {
      user: "Leslie Alexander",
      action: "User account activity",
      date: "May 10, 2026",
      status: "Active",
      createdAtTimestamp: 1715299200000,
    },
  ]);
  const [isActivityLoading] = useState(false);
  const [activityError] = useState("");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [graphError, setGraphError] = useState("");
  const [graphData, setGraphData] = useState<GraphPoint[]>(defaultGraphPoints);

  // Fetch total users stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const response = await baseApi.get<ApiStatsResponse>(ENDPOINTS.totalUsers);
        if (response.data) {
          setStats({
            totalUsers: response.data.total_users,
            activeUsers: response.data.total_active_users,
          });
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setStatsError(err.response?.data?.message || "Failed to load stats");
        } else {
          setStatsError("Failed to load stats");
        }
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch graph data
  useEffect(() => {
    const fetchGraphData = async () => {
      setIsGraphLoading(true);
      setGraphError("");
      try {
        const response = await baseApi.get<ApiGraphDataResponse>(
          ENDPOINTS.graphData(selectedYear)
        );
        if (response.data?.data) {
          const transformedData = response.data.data.map((item) => ({
            month: item.month_name,
            value: item.cumulative_active_users,
          }));
          setGraphData(transformedData);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setGraphError(err.response?.data?.message || "Failed to load graph data");
        } else {
          setGraphError("Failed to load graph data");
        }
      } finally {
        setIsGraphLoading(false);
      }
    };

    fetchGraphData();
  }, [selectedYear]);

  const linePoints = useMemo<GraphPoint[]>(() => {
    return graphData.length > 0 ? graphData : defaultGraphPoints;
  }, [graphData]);

  const statCards = useMemo<StatCard[]>(
    () => [
      {
        title: "Total Users",
        value: statsLoading ? "Loading..." : formatCount(stats.totalUsers),
        change: statsError ? statsError : "+12.5% from last month",
        icon: <FiUsers size={16} />,
      },
      {
        title: "Active Users",
        value: statsLoading ? "Loading..." : formatCount(stats.activeUsers),
        change: statsError ? statsError : "+8.2% from last month",
        icon: <FiUsers size={16} />,
      },
    ],
    [stats, statsLoading, statsError],
  );

  const graphWidth = 560;
  const graphHeight = 220;
  const chartPadding = { top: 16, right: 18, bottom: 32, left: 44 };

  const maxPoint = Math.max(0, ...linePoints.map((point) => point.value));
  const lineMax = Math.max(5, Math.ceil(maxPoint / 5) * 5);
  const lineMin = 0;
  const lineInnerWidth = graphWidth - chartPadding.left - chartPadding.right;
  const lineInnerHeight = graphHeight - chartPadding.top - chartPadding.bottom;

  const lineToXY = (value: number, index: number) => {
    const x =
      chartPadding.left + (index * lineInnerWidth) / Math.max(1, linePoints.length - 1);
    const y =
      chartPadding.top + ((lineMax - value) * lineInnerHeight) / (lineMax - lineMin);
    return { x, y };
  };

  const linePath = linePoints
    .map((point, i) => {
      const { x, y } = lineToXY(point.value, i);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const barWidth = 560;
  const barHeight = 220;
  const barPadding = { top: 16, right: 18, bottom: 32, left: 44 };
  const barMax = 1000;
  const barInnerWidth = barWidth - barPadding.left - barPadding.right;
  const barInnerHeight = barHeight - barPadding.top - barPadding.bottom;
  const barSlot = barInnerWidth / barPoints.length;
  const oneBarWidth = 66;

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-2 gap-4  md:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="hover:scale-105 duration-300 rounded-2xl border border-[#dfe4ea] bg-[#f7f8fa] px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6ebe3] text-[#bf6a2d]">
                {card.icon}
              </div>
              <p className="text-[12px] text-[#7a7f87]">{card.title}</p>
            </div>
            <p className="text-[34px] leading-none font-semibold text-[#2f343a]">{card.value}</p>
            <p className="mt-2 text-[11px] font-medium text-[#3f8a5f]">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
          <div className="flex items-center justify-between gap-3 bg-[#b76424] px-4 py-2.5">
            <h3 className="text-[28px] leading-none font-semibold text-white">User Growth</h3>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="h-9 rounded-lg border border-white/40 bg-white/15 px-2 text-sm font-medium text-white outline-none"
            >
              {availableYears.map((year) => (
                <option key={year} value={year} className="text-[#232a33]">
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 pb-4 pt-3">
            {isGraphLoading ? (
              <div className="flex h-55 items-center justify-center text-sm text-[#7d8592]">Loading user growth...</div>
            ) : graphError ? (
              <div className="flex h-55 items-center justify-center text-sm text-[#cf3f3f]">{graphError}</div>
            ) : (
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="h-55 w-full">
              {[0, 1, 2, 3, 4].map((step) => {
                const y = chartPadding.top + (step * lineInnerHeight) / 4;
                return (
                  <line
                    key={`h-${step}`}
                    x1={chartPadding.left}
                    y1={y}
                    x2={graphWidth - chartPadding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {linePoints.map((_, i) => {
                const { x } = lineToXY(0, i);
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={chartPadding.top}
                    x2={x}
                    y2={graphHeight - chartPadding.bottom}
                    stroke="#eceff3"
                    strokeDasharray="2 4"
                  />
                );
              })}

              <line
                x1={chartPadding.left}
                y1={chartPadding.top}
                x2={chartPadding.left}
                y2={graphHeight - chartPadding.bottom}
                stroke="#cfd4dc"
              />
              <line
                x1={chartPadding.left}
                y1={graphHeight - chartPadding.bottom}
                x2={graphWidth - chartPadding.right}
                y2={graphHeight - chartPadding.bottom}
                stroke="#cfd4dc"
              />

              {[0, 1, 2, 3, 4].map((step) => {
                const value = Math.round((lineMax * step) / 4);
                const y = chartPadding.top + ((lineMax - value) * lineInnerHeight) / Math.max(1, lineMax);
                return (
                  <text
                    key={`y-label-${step}`}
                    x={10}
                    y={y + 4}
                    fontSize="11"
                    fill="#7d8592"
                  >
                    {value}
                  </text>
                );
              })}

              {linePoints.map((point, i) => {
                const { x } = lineToXY(point.value, i);
                return (
                  <text
                    key={`x-label-${point.month}`}
                    x={x}
                    y={graphHeight - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#7d8592"
                  >
                    {point.month}
                  </text>
                );
              })}

              <path d={linePath} fill="none" stroke="#b76424" strokeWidth="3" strokeLinecap="round" />
              {linePoints.map((point, i) => {
                const { x, y } = lineToXY(point.value, i);
                return <circle key={`dot-${point.month}`} cx={x} cy={y} r="4" fill="#b76424" />;
              })}
            </svg>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
          <div className="bg-[#b76424] px-4 py-2.5">
            <h3 className="text-[28px] leading-none font-semibold text-white">Popular Food Categories</h3>
          </div>

          <div className="px-4 pb-4 pt-3">
            <svg viewBox={`0 0 ${barWidth} ${barHeight}`} className="h-55 w-full">
              {[0, 1, 2, 3, 4].map((step) => {
                const y = barPadding.top + (step * barInnerHeight) / 4;
                return (
                  <line
                    key={`bar-h-${step}`}
                    x1={barPadding.left}
                    y1={y}
                    x2={barWidth - barPadding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                  />
                );
              })}

              <line
                x1={barPadding.left}
                y1={barPadding.top}
                x2={barPadding.left}
                y2={barHeight - barPadding.bottom}
                stroke="#cfd4dc"
              />
              <line
                x1={barPadding.left}
                y1={barHeight - barPadding.bottom}
                x2={barWidth - barPadding.right}
                y2={barHeight - barPadding.bottom}
                stroke="#cfd4dc"
              />

              {[0, 250, 500, 750, 1000].map((value) => {
                const y = barPadding.top + ((barMax - value) * barInnerHeight) / barMax;
                return (
                  <text key={`bar-y-${value}`} x={10} y={y + 4} fontSize="11" fill="#7d8592">
                    {value}
                  </text>
                );
              })}

              {barPoints.map((bar, index) => {
                const x = barPadding.left + index * barSlot + (barSlot - oneBarWidth) / 2;
                const barValueHeight = (bar.value * barInnerHeight) / barMax;
                const y = barHeight - barPadding.bottom - barValueHeight;

                return (
                  <g key={bar.label}>
                    <rect x={x} y={y} width={oneBarWidth} height={barValueHeight} rx="4" fill="#b87644" />
                    <text
                      x={x + oneBarWidth / 2}
                      y={barHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#7d8592"
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <h3 className="text-[28px] leading-none font-semibold text-white">Recent Activity</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-170 border-collapse">
            <thead>
              <tr className="border-b border-[#e0e5ea] text-left">
                <th className="px-4 py-3 text-[22px] font-medium text-[#1f2937]">User</th>
                <th className="px-4 py-3 text-[22px] font-medium text-[#1f2937]">Action</th>
                <th className="px-4 py-3 text-[22px] font-medium text-[#1f2937]">Date</th>
                <th className="px-4 py-3 text-[22px] font-medium text-[#1f2937]">Status</th>
              </tr>
            </thead>
            <tbody>
              {isActivityLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-[#7a8088]">
                    Loading recent activity...
                  </td>
                </tr>
              ) : activityError ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-[#cf3f3f]">
                    {activityError}
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-[#7a8088]">
                    No recent activity found.
                  </td>
                </tr>
              ) : (
                activities.map((row, index) => (
                  <tr key={`${row.user}-${index}`} className="border-b border-[#edf1f4] last:border-b-0">
                    <td className="px-4 py-3 text-[16px] font-medium text-[#2f343a]">{row.user}</td>
                    <td className="px-4 py-3 text-[14px] text-[#7a8088]">{row.action}</td>
                    <td className="px-4 py-3 text-[14px] text-[#7a8088]">{row.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${
                          row.status === "Active"
                            ? "bg-[#e6f4eb] text-[#2f9a62]"
                            : "bg-[#eef1f5] text-[#7d8592]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
