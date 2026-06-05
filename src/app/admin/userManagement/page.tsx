"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { FiEye, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import axios from "axios";

type UserStatus = "Active" | "Inactive" | "Suspended" | "Blocked";

type ApiUserResponse = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

type UserRow = {
  id: number;
  userName: string;
  email: string;
  dogName?: string;
  signupDate: string;
  status: UserStatus;
  phone?: string;
  breed?: string;
  age?: string;
  weight?: string;
  allergies: string[];
  foodPreferences: string[];
};

type DeleteTarget = {
  id: string | number;
  userName: string;
};

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

type GraphPoint = {
  month: string;
  value: number;
};

const PAGE_SIZE = 8;

const formatCount = (value: number): string => {
  return value.toLocaleString("en-US");
};

const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const defaultGraphPoints: GraphPoint[] = defaultMonths.map((month) => ({ month, value: 0 }));
const availableYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const transformApiUserToUserRow = (apiUser: ApiUserResponse): UserRow => {
  return {
    id: apiUser.id,
    userName: apiUser.name,
    email: apiUser.email,
    dogName: undefined,
    signupDate: formatDate(apiUser.created_at),
    status: apiUser.is_active ? "Active" : "Inactive",
    phone: undefined,
    breed: undefined,
    age: undefined,
    weight: undefined,
    allergies: [],
    foodPreferences: [],
  };
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus | "blocked-list">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats states
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  
  // Graph states
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [graphError, setGraphError] = useState("");
  const [graphData, setGraphData] = useState<GraphPoint[]>(defaultGraphPoints);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const response = await baseApi.get(ENDPOINTS.userManagement);
        if (response.data && Array.isArray(response.data)) {
          const transformedUsers = response.data.map((apiUser: ApiUserResponse) =>
            transformApiUserToUserRow(apiUser)
          );
          setUsers(transformedUsers);
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          const transformedUsers = response.data.results.map((apiUser: ApiUserResponse) =>
            transformApiUserToUserRow(apiUser)
          );
          setUsers(transformedUsers);
        } else {
          setFetchError("Invalid data format from server");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setFetchError(err.response?.data?.message || "Failed to load users");
        } else {
          setFetchError("Failed to load users");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        keyword.length === 0 ||
        user.userName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.dogName?.toLowerCase().includes(keyword) ?? false);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "blocked-list") return user.status === "Blocked";
      return user.status === statusFilter;
    });
  }, [users, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safeCurrentPage]);

  const handleDeleteClick = (id: string | number, userName: string) => {
    setDeleteTarget({ id, userName });
  };

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

  const linePoints = useMemo<GraphPoint[]>(() => {
    return graphData.length > 0 ? graphData : defaultGraphPoints;
  }, [graphData]);

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

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setActionError("");

    try {
      await baseApi.delete(ENDPOINTS.deleteUser(deleteTarget.id));
      
      setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("User deleted successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to delete user";
        setActionError(errorMsg);
        toast.error(errorMsg);
      } else {
        setActionError("Failed to delete user");
        toast.error("Failed to delete user");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const statusPillClass = (status: UserStatus) => {
    if (status === "Active") return "bg-[#e6f6ec] text-[#2f9d61] border border-[#bde8cd]";
    if (status === "Inactive") return "bg-[#f1f3f6] text-[#7a8492] border border-[#e0e5ea]";
    if (status === "Suspended") return "bg-[#fff4dd] text-[#bf7d08] border border-[#f5dfac]";
    return "bg-[#fde8e8] text-[#cf3f3f] border border-[#f4caca]";
  };

  return (
    <div className="relative min-h-screen">
      {/* Stats Cards */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
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
            <p className="text-[24px] leading-none font-semibold text-[#2f343a]">{card.value}</p>
            <p className="mt-2 text-[11px] font-medium text-[#3f8a5f]">{card.change}</p>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="flex items-center justify-between gap-3 bg-[#b76424] px-4 py-2.5">
          <h3 className="text-[20px] leading-none font-semibold text-white sm:text-[24px]">User Growth</h3>
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
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px] lg:text-[34px]">
            User Management
          </h2>
        </div>

        <div className="p-3 sm:p-4">
          <div className="mb-4 flex flex-row gap-3 lg:flex-row lg:items-center">
            <div className="flex h-11 flex-1 items-center rounded-xl border border-[#d8dde4] bg-white px-3">
              <FiSearch className="mr-2 text-[#7d8592]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search users..."
                className="w-full bg-transparent text-sm text-[#3a4048] outline-none placeholder:text-[#9aa3ad]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | UserStatus | "blocked-list");
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-[#d8dde4] bg-white px-4 text-sm text-[#3a4048] outline-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="blocked-list">Blocked List</option>
            </select>
          </div>

          {actionError ? (
            <p className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {actionError}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-[#d8dde4] bg-white">
            <table className="w-full min-w-190 border-collapse lg:min-w-210">
              <thead>
                <tr className="border-b border-[#e0e5ea] text-left">
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">User Name</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Email</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Signup Date</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Status</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#7d8592]">
                      Loading users...
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#cf3f3f]">
                      {fetchError}
                    </td>
                  </tr>
                ) : pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#7d8592]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#edf1f4] last:border-b-0">
                      <td className="px-3 py-3 text-[13px] font-medium text-[#2f343a] sm:px-4 sm:text-[14px] lg:text-[18px]">
                        {user.userName}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#7a8088] sm:px-4 sm:text-[13px] lg:text-[17px]">
                        {user.email}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#7a8088] sm:px-4 sm:text-[13px] lg:text-[17px]">
                        {user.signupDate}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-[12px] lg:text-[14px] ${statusPillClass(user.status)}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Link href={`/admin/userManagement/${user.id}`} className="text-[#3b82f6] cursor-pointer" aria-label={`View details of ${user.userName}`}>
                            <FiEye size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(user.id, user.userName)}
                            className="text-[#ef4444] cursor-pointer"
                            aria-label={`Delete ${user.userName}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#7d8592]">
              Page {safeCurrentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-8 w-8 rounded-full border border-[#e0e5ea] text-sm text-[#7d8592] disabled:opacity-50"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-full px-2 text-sm ${
                      page === safeCurrentPage ? "bg-[#f9733d] text-white" : "text-[#3a4048]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="h-8 w-8 rounded-full border border-[#e0e5ea] text-sm text-[#7d8592] disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="text-lg font-semibold text-[#232a33]">Delete User</h3>
            <p className="mt-2 text-sm text-[#5f6670]">
              Are you sure you want to delete <span className="font-medium text-[#232a33]">{deleteTarget.userName}</span>?
            </p>
            <p className="mt-1 text-xs text-[#9aa3ad]">This action cannot be undone.</p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="h-9 rounded-lg border border-[#d8dde4] bg-white px-4 text-sm text-[#5f6670] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
                className="h-9 rounded-lg bg-[#dc2626] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
