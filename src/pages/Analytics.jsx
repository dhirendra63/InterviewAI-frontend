import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiCode,
  FiMessageCircle,
  FiPlay,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiZap,
} from "react-icons/fi";

import api from "../services/api";

const Analytics = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await api.get("/analytics");

        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const scoreCards = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        title: "Technical",
        value: analytics.technicalScore,
        icon: FiCode,
      },
      {
        title: "Communication",
        value: analytics.communicationScore,
        icon: FiMessageCircle,
      },
      {
        title: "Confidence",
        value: analytics.confidenceScore,
        icon: FiZap,
      },
      {
        title: "Problem Solving",
        value: analytics.problemSolvingScore,
        icon: FiTarget,
      },
    ];
  }, [analytics]);

  const getScoreColor = (score) => {
    if (score >= 80) {
      return "text-emerald-400";
    }

    if (score >= 60) {
      return "text-yellow-400";
    }

    if (score > 0) {
      return "text-red-400";
    }

    return "text-slate-400";
  };

  const getBarWidth = (score) => {
    return `${Math.min(Math.max(score || 0, 0), 100)}%`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-white/10 dark:border-t-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  if (analytics.totalInterviews === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <FiBarChart2 className="text-3xl" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            No Analytics Yet
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Complete your first AI mock interview to start building your performance analytics.
          </p>

          <button
            onClick={() =>
              navigate("/interview/setup")
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FiPlay />
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-500">
            Performance Analytics
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Your Interview Performance
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track your progress and identify areas that need improvement.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/interview/setup")
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <FiPlay />
          New Interview
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <FiBarChart2 />
            </div>

            <span className="text-xs font-medium text-slate-400">
              Total
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold">
            {analytics.totalInterviews}
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Completed interviews
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <FiTrendingUp />
            </div>

            <span className="text-xs font-medium text-slate-400">
              Average
            </span>
          </div>

          <p
            className={`mt-5 text-3xl font-bold ${getScoreColor(
              analytics.averageScore
            )}`}
          >
            {analytics.averageScore}%
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overall performance
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <FiTarget />
            </div>

            <span className="text-xs font-medium text-slate-400">
              Relevance
            </span>
          </div>

          <p
            className={`mt-5 text-3xl font-bold ${getScoreColor(
              analytics.relevanceScore
            )}`}
          >
            {analytics.relevanceScore}%
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Answer relevance
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <FiCheckCircle />
            </div>

            <span className="text-xs font-medium text-slate-400">
              Quality
            </span>
          </div>

          <p
            className={`mt-5 text-3xl font-bold ${getScoreColor(
              analytics.answerQualityScore
            )}`}
          >
            {analytics.answerQualityScore}%
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Answer quality
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Skill Breakdown
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your average performance across key skills.
              </p>
            </div>

            <FiBarChart2 className="text-xl text-indigo-500" />
          </div>

          <div className="mt-7 space-y-6">
            {scoreCards.map(
              ({
                title,
                value,
                icon: Icon,
              }) => (
                <div key={title}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="text-sm text-slate-400" />

                      <span className="text-sm font-medium">
                        {title}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        value
                      )}`}
                    >
                      {value}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{
                        width:
                          getBarWidth(value),
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Performance by Mode
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Average score for each interview type.
              </p>
            </div>

            <FiTarget className="text-xl text-indigo-500" />
          </div>

          <div className="mt-7 space-y-5">
            {analytics.modePerformance?.map(
              (item) => (
                <div
                  key={item.mode}
                  className="rounded-xl border border-slate-100 p-4 dark:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {item.mode}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {item.interviews}{" "}
                        interview
                        {item.interviews !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <span
                      className={`text-lg font-bold ${getScoreColor(
                        item.averageScore
                      )}`}
                    >
                      {item.averageScore}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width:
                          getBarWidth(
                            item.averageScore
                          ),
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              Score Trend
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your interview scores over time.
            </p>
          </div>

          <FiTrendingUp className="text-xl text-indigo-500" />
        </div>

        <div className="mt-8">
          {analytics.scoreTrend?.length > 1 ? (
            <div className="flex h-64 items-end gap-3 overflow-x-auto pb-2">
              {analytics.scoreTrend.map(
                (item, index) => {
                  const score =
                    item.score || 0;

                  return (
                    <div
                      key={item.id}
                      className="flex h-full min-w-[55px] flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span
                        className={`text-xs font-bold ${getScoreColor(
                          score
                        )}`}
                      >
                        {score}%
                      </span>

                      <div className="flex h-44 w-full max-w-[42px] items-end rounded-lg bg-slate-100 p-1 dark:bg-white/5">
                        <div
                          className="w-full rounded-md bg-indigo-500 transition-all duration-700"
                          style={{
                            height: `${Math.max(
                              score,
                              4
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="text-[10px] text-slate-400">
                        #{index + 1}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <div className="text-center">
                <FiTrendingUp className="mx-auto text-2xl text-slate-400" />

                <p className="mt-3 text-sm font-medium">
                  Complete more interviews
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Your score trend will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold">
              Recent Interviews
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your latest completed interviews.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/history")
            }
            className="flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:text-indigo-600"
          >
            View All
            <FiArrowRight />
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {analytics.recentInterviews?.map(
            (interview) => (
              <div
                key={interview.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                    <FiUser />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {interview.role}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {interview.mode}
                      </span>

                      <span>
                        {interview.difficulty}
                      </span>

                      <span className="flex items-center gap-1">
                        <FiCalendar />
                        {formatDate(
                          interview.date
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      interview.score
                    )}`}
                  >
                    {interview.score}%
                  </span>

                  <button
                    onClick={() =>
                      navigate(
                        `/interview/${interview.id}/result`
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                  >
                    Report
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;