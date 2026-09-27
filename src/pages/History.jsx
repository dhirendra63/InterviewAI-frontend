import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiFilter,
  FiPlay,
  FiTarget,
  FiXCircle,
} from "react-icons/fi";

import api from "../services/api";

const History = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get("/interviews");

        setInterviews(
          Array.isArray(response.data.interviews)
            ? response.data.interviews
            : []
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Failed to load interview history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredInterviews = useMemo(() => {
    if (filter === "all") {
      return interviews;
    }

    return interviews.filter(
      (interview) =>
        interview.status === filter
    );
  }, [interviews, filter]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatus = (status) => {
    if (status === "completed") {
      return {
        label: "Completed",
        icon: FiCheckCircle,
        className:
          "bg-emerald-500/10 text-emerald-400",
      };
    }

    if (status === "active") {
      return {
        label: "Active",
        icon: FiPlay,
        className:
          "bg-indigo-500/10 text-indigo-400",
      };
    }

    if (status === "cancelled") {
      return {
        label: "Cancelled",
        icon: FiXCircle,
        className:
          "bg-red-500/10 text-red-400",
      };
    }

    return {
      label: "Created",
      icon: FiClock,
      className:
        "bg-yellow-500/10 text-yellow-400",
    };
  };

  const getScoreClass = (score) => {
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

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-white/10 dark:border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Interview History
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review your previous mock interviews and performance.
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
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["completed", "Completed"],
          ["active", "Active"],
          ["cancelled", "Cancelled"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === value
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {filteredInterviews.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <FiBarChart2 className="text-2xl" />
          </div>

          <h2 className="mt-5 text-xl font-bold">
            No interviews found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Start your first AI mock interview and your results will appear here.
          </p>

          <button
            onClick={() =>
              navigate("/interview/setup")
            }
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start Interview
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map(
            (interview) => {
              const status = getStatus(
                interview.status
              );

              const StatusIcon =
                status.icon;

              const score =
                interview.overallScore ?? 0;

              return (
                <div
                  key={interview._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold">
                          {interview.role}
                        </h2>

                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <FiCode />
                          {interview.mode}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <FiTarget />
                          {interview.difficulty}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <FiClock />
                          {interview.duration} min
                        </span>

                        <span className="flex items-center gap-1.5">
                          <FiCalendar />
                          {formatDate(
                            interview.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 border-t border-slate-200 pt-4 dark:border-white/10 lg:border-t-0 lg:pt-0">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Overall Score
                        </p>

                        <p
                          className={`mt-1 text-2xl font-bold ${getScoreClass(
                            score
                          )}`}
                        >
                          {interview.status ===
                          "completed"
                            ? `${score}%`
                            : "—"}
                        </p>
                      </div>

                      {interview.status ===
                        "completed" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/interview/${interview._id}/result`
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          View Report
                          <FiArrowRight />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-5">
        <div className="flex items-start gap-3">
          <FiFilter className="mt-0.5 shrink-0 text-indigo-400" />

          <div>
            <p className="text-sm font-semibold">
              Keep practicing
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Review your previous answers and use the feedback to improve your next interview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;