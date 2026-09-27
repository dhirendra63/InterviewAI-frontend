import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCode,
  FiMessageCircle,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiZap,
} from "react-icons/fi";

import api from "../services/api";

const ScoreCard = ({
  title,
  score,
  icon,
}) => {
  const safeScore = Math.round(
    Number(score) || 0
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {safeScore}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-700"
          style={{
            width: `${Math.min(
              100,
              safeScore
            )}%`,
          }}
        />
      </div>
    </div>
  );
};

const getScoreLabel = (score) => {
  const value = Number(score) || 0;

  if (value >= 85) {
    return "Excellent";
  }

  if (value >= 70) {
    return "Very Good";
  }

  if (value >= 55) {
    return "Good";
  }

  if (value >= 40) {
    return "Needs Improvement";
  }

  return "Keep Practicing";
};

const InterviewResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openQuestion, setOpenQuestion] =
    useState(null);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/interviews/${id}`
      );

      setInterview(
        response.data.interview
      );
    } catch (error) {
      console.error(
        "Fetch result error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load interview result"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />

          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Preparing your interview report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
            <FiBarChart2 size={26} />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Unable to Load Result
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error ||
              "Interview result could not be found."}
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(
    Number(interview.overallScore) || 0
  );

  const completedDate =
    interview.completedAt ||
    interview.updatedAt ||
    interview.createdAt;

  const formattedDate = completedDate
    ? new Date(
        completedDate
      ).toLocaleString()
    : "N/A";

  const questions =
    interview.questions || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button
            onClick={() =>
              navigate("/history")
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
          >
            <FiArrowLeft />

            Back to History
          </button>

          <button
            onClick={() =>
              navigate(
                "/interview/setup"
              )
            }
            className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:flex"
          >
            <FiRefreshCw />

            New Interview
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Interview Completed
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {interview.mode}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {interview.role}
                </h1>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {interview.experience} ·{" "}
                  {interview.difficulty} ·{" "}
                  {interview.duration} minutes
                </p>

                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Completed on{" "}
                  {formattedDate}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-indigo-100 bg-indigo-50 dark:border-indigo-500/10 dark:bg-indigo-500/10">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {overallScore}
                  </span>

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    out of 100
                  </span>
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Overall Performance
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {getScoreLabel(
                      overallScore
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard
            title="Technical"
            score={
              interview.technicalScore
            }
            icon={<FiCode />}
          />

          <ScoreCard
            title="Communication"
            score={
              interview.communicationScore
            }
            icon={<FiMessageCircle />}
          />

          <ScoreCard
            title="Confidence"
            score={
              interview.confidenceScore
            }
            icon={<FiUser />}
          />

          <ScoreCard
            title="Problem Solving"
            score={
              interview.problemSolvingScore
            }
            icon={<FiZap />}
          />

          <ScoreCard
            title="Relevance"
            score={
              interview.relevanceScore
            }
            icon={<FiTarget />}
          />

          <ScoreCard
            title="Answer Quality"
            score={
              interview.answerQualityScore
            }
            icon={<FiAward />}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiTrendingUp />
              </div>

              <div>
                <h2 className="font-bold">
                  AI Feedback
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Overall analysis of your
                  interview
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {interview.feedback ||
                "No overall feedback was generated for this interview."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <FiClock />
              </div>

              <div>
                <h2 className="font-bold">
                  Interview Summary
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Session information
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Questions
                </span>

                <span className="text-sm font-bold">
                  {questions.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Duration
                </span>

                <span className="text-sm font-bold">
                  {interview.duration} min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Mode
                </span>

                <span className="text-sm font-bold">
                  {interview.mode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Difficulty
                </span>

                <span className="text-sm font-bold">
                  {interview.difficulty}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <h2 className="font-bold text-emerald-700 dark:text-emerald-400">
              Strengths
            </h2>

            {interview.strengths?.length ? (
              <ul className="mt-4 space-y-3">
                {interview.strengths.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-emerald-700 dark:text-emerald-300"
                    >
                      <FiCheckCircle className="mt-1 shrink-0" />

                      <span>
                        {item}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-emerald-700/70 dark:text-emerald-300/70">
                No strengths recorded.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
            <h2 className="font-bold text-amber-700 dark:text-amber-400">
              Areas to Improve
            </h2>

            {interview.weaknesses?.length ? (
              <ul className="mt-4 space-y-3">
                {interview.weaknesses.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-amber-700 dark:text-amber-300"
                    >
                      <FiTarget className="mt-1 shrink-0" />

                      <span>
                        {item}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-amber-700/70 dark:text-amber-300/70">
                No improvement areas recorded.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <h2 className="font-bold text-indigo-700 dark:text-indigo-400">
              Recommendations
            </h2>

            {interview.recommendations?.length ? (
              <ul className="mt-4 space-y-3">
                {interview.recommendations.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-indigo-700 dark:text-indigo-300"
                    >
                      <FiTrendingUp className="mt-1 shrink-0" />

                      <span>
                        {item}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-indigo-700/70 dark:text-indigo-300/70">
                No recommendations recorded.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Question Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review your answers and AI
                evaluation
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-400">
              {questions.length} Questions
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {questions.map(
              (question, index) => {
                const evaluation =
                  question.evaluation;

                const score = Math.round(
                  Number(
                    evaluation?.overallScore
                  ) || 0
                );

                const isOpen =
                  openQuestion === index;

                return (
                  <div
                    key={
                      question._id ||
                      index
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenQuestion(
                          isOpen
                            ? null
                            : index
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">
                            {question.question}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {question.type ||
                              interview.mode}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          {score}/100
                        </span>

                        {isOpen ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-200 p-5 dark:border-white/10">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Your Answer
                          </p>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {question.answer ||
                              "No answer recorded."}
                          </p>
                        </div>

                        {evaluation && (
                          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Technical Accuracy
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {evaluation.technicalAccuracy ??
                                  0}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Relevance
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {evaluation.relevance ??
                                  0}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Clarity
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {evaluation.clarity ??
                                  0}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Communication
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {evaluation.communication ??
                                  0}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Confidence
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {evaluation.confidence ??
                                  0}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Completeness
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {evaluation.completeness ??
                                  0}
                              </p>
                            </div>
                          </div>
                        )}

                        {evaluation?.feedback && (
                          <div className="mt-6 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-500/10">
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                              AI Feedback
                            </p>

                            <p className="mt-3 text-sm leading-7 text-indigo-900 dark:text-indigo-200">
                              {
                                evaluation.feedback
                              }
                            </p>
                          </div>
                        )}

                        {evaluation?.strengths
                          ?.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                              Strengths
                            </p>

                            <ul className="mt-3 space-y-2">
                              {evaluation.strengths.map(
                                (
                                  item,
                                  itemIndex
                                ) => (
                                  <li
                                    key={
                                      itemIndex
                                    }
                                    className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"
                                  >
                                    <FiCheckCircle className="mt-1 shrink-0 text-emerald-500" />

                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {evaluation?.improvements
                          ?.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                              Improvements
                            </p>

                            <ul className="mt-3 space-y-2">
                              {evaluation.improvements.map(
                                (
                                  item,
                                  itemIndex
                                ) => (
                                  <li
                                    key={
                                      itemIndex
                                    }
                                    className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"
                                  >
                                    <FiTarget className="mt-1 shrink-0 text-amber-500" />

                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {evaluation?.expectedAnswer && (
                          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Expected Answer
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                              {
                                evaluation.expectedAnswer
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() =>
              navigate(
                "/interview/setup"
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <FiRefreshCw />

            Start New Interview
          </button>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
          >
            Dashboard
          </button>
        </section>
      </main>
    </div>
  );
};

export default InterviewResult;