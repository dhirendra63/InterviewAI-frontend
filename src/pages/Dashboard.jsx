import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [credits, setCredits] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        interviewResponse,
        creditResponse,
        analyticsResponse,
      ] = await Promise.all([
        api.get("/interviews"),
        api.get("/credits"),
        api.get("/analytics"),
      ]);

      if (!interviewResponse.data.success) {
        throw new Error(
          interviewResponse.data.message ||
            "Failed to load interviews"
        );
      }

      if (!creditResponse.data.success) {
        throw new Error(
          creditResponse.data.message ||
            "Failed to load credits"
        );
      }

      if (!analyticsResponse.data.success) {
        throw new Error(
          analyticsResponse.data.message ||
            "Failed to load analytics"
        );
      }

      setInterviews(
        interviewResponse.data.interviews || []
      );

      setCredits(
        creditResponse.data.credits || 0
      );

      setAnalytics(
        analyticsResponse.data.analytics || null
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const completed = interviews.filter(
      (item) => item.status === "completed"
    );

    const averageScore = completed.length
      ? Math.round(
          completed.reduce(
            (sum, item) =>
              sum + (item.overallScore || 0),
            0
          ) / completed.length
        )
      : 0;

    const totalMinutes = completed.reduce(
      (sum, item) =>
        sum + (item.duration || 0),
      0
    );

    const highestScore = completed.length
      ? Math.max(
          ...completed.map(
            (item) => item.overallScore || 0
          )
        )
      : 0;

    return {
      total: interviews.length,
      completed: completed.length,
      averageScore,
      totalMinutes,
      highestScore,
    };
  }, [interviews]);

  const scoreTrend = useMemo(() => {
    return (analytics?.scoreTrend || [])
      .filter((item) => Number(item.score) >= 0)
      .slice(-10)
      .map((item, index) => ({
        ...item,
        score: Math.min(
          100,
          Math.max(0, Number(item.score) || 0)
        ),
        label: `#${index + 1}`,
      }));
  }, [analytics]);

  const trendStats = useMemo(() => {
    if (!scoreTrend.length) {
      return {
        latest: 0,
        previous: 0,
        change: 0,
      };
    }

    const latest =
      scoreTrend[scoreTrend.length - 1].score;

    const previous =
      scoreTrend.length > 1
        ? scoreTrend[scoreTrend.length - 2].score
        : latest;

    return {
      latest,
      previous,
      change: latest - previous,
    };
  }, [scoreTrend]);

  const recentInterviews = useMemo(() => {
    return [...interviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [interviews]);

  const getScoreColor = (score) => {
    if (score >= 80) {
      return "text-emerald-400";
    }

    if (score >= 60) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  const getStatus = (status) => {
    if (status === "completed") {
      return {
        text: "Completed",
        className:
          "bg-emerald-500/10 text-emerald-400",
      };
    }

    if (status === "active") {
      return {
        text: "Active",
        className:
          "bg-blue-500/10 text-blue-400",
      };
    }

    if (status === "cancelled") {
      return {
        text: "Cancelled",
        className:
          "bg-red-500/10 text-red-400",
      };
    }

    return {
      text: "Created",
      className:
        "bg-yellow-500/10 text-yellow-400",
    };
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const chart = useMemo(() => {
    if (!scoreTrend.length) {
      return null;
    }

    const width = 900;
    const height = 300;
    const paddingX = 50;
    const paddingY = 30;

    const chartWidth =
      width - paddingX * 2;

    const chartHeight =
      height - paddingY * 2;

    const points = scoreTrend.map(
      (item, index) => {
        const x =
          scoreTrend.length === 1
            ? width / 2
            : paddingX +
              (index /
                (scoreTrend.length - 1)) *
                chartWidth;

        const y =
          paddingY +
          ((100 - item.score) / 100) *
            chartHeight;

        return {
          ...item,
          x,
          y,
        };
      }
    );

    const linePath = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");

    const areaPath =
      `${linePath} L ${points[points.length - 1].x} ${
        height - paddingY
      } L ${points[0].x} ${
        height - paddingY
      } Z`;

    return {
      width,
      height,
      paddingX,
      paddingY,
      chartHeight,
      points,
      linePath,
      areaPath,
    };
  }, [scoreTrend]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <FiRefreshCw className="animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-400">
              Welcome back
            </p>

            <h1 className="text-3xl font-bold">
              Interview Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Track your preparation and improve your
              interview performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadDashboard}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d0f14] text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Refresh"
            >
              <FiRefreshCw />
            </button>

            <button
              onClick={() =>
                navigate("/interview/setup")
              }
              className="flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-gray px-5 py-3 font-semibold transition hover:bg-slate-700"
            >
              <FiZap />
              Start Interview
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-[#0d0f14] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/10">
              <FiMessageSquare
                className="text-slate-400"
                size={20}
              />
            </div>

            <p className="text-sm text-slate-400">
              Total Interviews
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d0f14] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <FiCheckCircle
                className="text-emerald-400"
                size={20}
              />
            </div>

            <p className="text-sm text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d0f14] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <FiTrendingUp
                className="text-blue-400"
                size={20}
              />
            </div>

            <p className="text-sm text-slate-400">
              Average Score
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${getScoreColor(
                stats.averageScore
              )}`}
            >
              {stats.averageScore}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d0f14] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <FiClock
                className="text-orange-400"
                size={20}
              />
            </div>

            <p className="text-sm text-slate-400">
              Practice Time
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.totalMinutes}m
            </p>
          </div>

          <div className="rounded-2xl border border-slate-500/20 bg-slate-700/5 p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/10">
              <FiZap
                className="text-slate-400"
                size={20}
              />
            </div>

            <p className="text-sm text-slate-400">
              Available Credits
            </p>

            <p className="mt-2 text-3xl font-bold">
              {credits}
            </p>

            <button
              onClick={() => navigate("/credits")}
              className="mt-2 text-xs font-medium text-slate-400 hover:text-slate-300"
            >
              Manage credits
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#0d0f14] p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-slate-400" />

                <h2 className="text-xl font-bold">
                  Performance Trend
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Your interview scores over time.
              </p>
            </div>

            {scoreTrend.length > 0 && (
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-xs text-slate-500">
                    Latest
                  </p>

                  <p
                    className={`text-xl font-bold ${getScoreColor(
                      trendStats.latest
                    )}`}
                  >
                    {trendStats.latest}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Change
                  </p>

                  <p
                    className={`text-xl font-bold ${
                      trendStats.change > 0
                        ? "text-emerald-400"
                        : trendStats.change < 0
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  >
                    {trendStats.change > 0
                      ? "+"
                      : ""}
                    {trendStats.change}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {!chart ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white/[0.03] text-center">
              <FiBarChart2
                size={36}
                className="mb-4 text-slate-600"
              />

              <p className="font-semibold">
                No performance data yet
              </p>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Complete your first interview to see your
                performance trend here.
              </p>

              <button
                onClick={() =>
                  navigate("/interview/setup")
                }
                className="mt-5 rounded-xl bg-slate-950 dark:bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-700"
              >
                Start Interview
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                <svg
                  viewBox={`0 0 ${chart.width} ${chart.height}`}
                  className="h-[300px] w-full"
                  preserveAspectRatio="none"
                >
                  {[0, 25, 50, 75, 100].map(
                    (value) => {
                      const y =
                        chart.paddingY +
                        ((100 - value) /
                          100) *
                          chart.chartHeight;

                      return (
                        <g key={value}>
                          <line
                            x1={chart.paddingX}
                            y1={y}
                            x2={
                              chart.width -
                              chart.paddingX
                            }
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity="0.08"
                          />

                          <text
                            x="10"
                            y={y + 4}
                            fill="currentColor"
                            opacity="0.4"
                            fontSize="12"
                          >
                            {value}
                          </text>
                        </g>
                      );
                    }
                  )}

                  <path
                    d={chart.areaPath}
                    fill="currentColor"
                    opacity="0.05"
                  />

                  <path
                    d={chart.linePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500"
                  />

                  {chart.points.map(
                    (point) => (
                      <g key={point._id}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="7"
                          fill="currentColor"
                          className="text-slate-500"
                        />

                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="3"
                          fill="currentColor"
                          className="text-white"
                        />

                        <text
                          x={point.x}
                          y={
                            point.y - 15
                          }
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize="12"
                          fontWeight="600"
                          className="text-slate-300"
                        >
                          {point.score}%
                        </text>

                        <text
                          x={point.x}
                          y={
                            chart.height -
                            8
                          }
                          textAnchor="middle"
                          fill="currentColor"
                          opacity="0.45"
                          fontSize="11"
                        >
                          {point.label}
                        </text>
                      </g>
                    )
                  )}
                </svg>
              </div>
            </div>
          )}

          {scoreTrend.length >= 2 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">
                  Previous Interview
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {trendStats.previous}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">
                  Latest Interview
                </p>

                <p
                  className={`mt-1 text-2xl font-bold ${getScoreColor(
                    trendStats.latest
                  )}`}
                >
                  {trendStats.latest}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">
                  Progress
                </p>

                <p
                  className={`mt-1 text-2xl font-bold ${
                    trendStats.change > 0
                      ? "text-emerald-400"
                      : trendStats.change < 0
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                >
                  {trendStats.change > 0
                    ? "+"
                    : ""}
                  {trendStats.change}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0d0f14] p-7">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Recent Interviews
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your latest interview sessions.
                </p>
              </div>

              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-300"
              >
                View All
                <FiArrowRight />
              </button>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="rounded-2xl bg-white/5 px-5 py-12 text-center">
                <FiMessageSquare
                  className="mx-auto mb-4 text-slate-600"
                  size={30}
                />

                <p className="font-medium">
                  No interviews yet
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Start your first mock interview.
                </p>

                <button
                  onClick={() =>
                    navigate("/interview/setup")
                  }
                  className="mt-5 rounded-xl bg-slate-950 dark:bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-700"
                >
                  Start Interview
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterviews.map(
                  (interview) => {
                    const status = getStatus(
                      interview.status
                    );

                    return (
                      <div
                        key={interview._id}
                        className="flex flex-col gap-4 rounded-2xl bg-white/5 p-4 transition hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-700/10">
                            <FiMessageSquare
                              className="text-slate-400"
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold">
                                {interview.role}
                              </p>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                              >
                                {status.text}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                              <span>
                                {interview.mode}
                              </span>

                              <span>
                                {
                                  interview.difficulty
                                }
                              </span>

                              <span>
                                {formatDate(
                                  interview.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              Score
                            </p>

                            <p
                              className={`text-xl font-bold ${getScoreColor(
                                interview.overallScore ||
                                  0
                              )}`}
                            >
                              {interview.status ===
                              "completed"
                                ? `${
                                    interview.overallScore ||
                                    0
                                  }%`
                                : "—"}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              if (
                                interview.status ===
                                "completed"
                              ) {
                                navigate(
                                  `/interview/${interview._id}/result`
                                );
                              } else {
                                navigate(
                                  `/interview/${interview._id}`
                                );
                              }
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-slate-950 dark:bg-white hover:text-white"
                          >
                            <FiArrowRight />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d0f14] p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FiAward
                    className="text-emerald-400"
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="font-bold">
                    Best Score
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your highest performance
                  </p>
                </div>
              </div>

              <p
                className={`mt-7 text-5xl font-bold ${getScoreColor(
                  stats.highestScore
                )}`}
              >
                {stats.highestScore}%
              </p>

              <button
                onClick={() => navigate("/analytics")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                View Analytics
                <FiArrowRight />
              </button>
            </div>

            <div className="rounded-3xl border border-slate-700/20 bg-slate-700/5 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700/10">
                <FiTarget
                  className="text-slate-400"
                  size={22}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Ready to practice?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Start another AI mock interview and keep
                improving your performance.
              </p>

              <button
                onClick={() =>
                  navigate("/interview/setup")
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-gray py-3 font-semibold transition hover:bg-slate-700"
              >
                Start Interview
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0d0f14] p-7">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <FiBarChart2 />
                Average Performance
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-slate-950 dark:bg-white"
                  style={{
                    width: `${stats.averageScore}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm font-semibold">
                {stats.averageScore}%
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <FiCheckCircle />
                Completion Rate
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{
                    width: `${
                      stats.total
                        ? Math.round(
                            (stats.completed /
                              stats.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm font-semibold">
                {stats.total
                  ? Math.round(
                      (stats.completed /
                        stats.total) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <FiClock />
                Total Practice
              </div>

              <p className="text-2xl font-bold">
                {stats.totalMinutes} minutes
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Across completed interviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}