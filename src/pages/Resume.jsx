import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiCode,
  FiFileText,
  FiFolder,
  FiPlus,
  FiRefreshCw,
  FiTarget,
  FiTrash2,
  FiUploadCloud,
  FiZap,
  FiXCircle,
} from "react-icons/fi";

import api from "../services/api";

const statusConfig = {
  analyzing: {
    label: "Analyzing",
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  analyzed: {
    label: "Analyzed",
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
};

const Section = ({ title, icon, children }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {icon}
        </div>

        <h2 className="font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
};

const ListItems = ({
  items,
  empty = "No information available.",
}) => {
  if (!Array.isArray(items) || !items.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {empty}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        let content = "";

        if (typeof item === "string") {
          content = item;
        } else if (item?.name) {
          content = item.name;
        } else if (item?.title) {
          content = item.title;
        } else {
          try {
            content = JSON.stringify(item);
          } catch {
            content = "Information available";
          }
        }

        return (
          <li
            key={index}
            className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

            <span>{content}</span>
          </li>
        );
      })}
    </ul>
  );
};

const Resume = () => {
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchResumes = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const response = await api.get("/resumes");
        const data = Array.isArray(response.data.resumes)
          ? response.data.resumes
          : [];

        setResumes(data);

        setSelectedResume((current) => {
          if (!data.length) {
            return null;
          }

          if (current?._id) {
            return (
              data.find(
                (item) => item._id === current._id
              ) || data[0]
            );
          }

          return data[0];
        });

        return data;
      } catch (error) {
        console.error("Fetch resumes error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load resumes"
        );

        return [];
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchResumes();

    return () => {
      clearPolling();
    };
  }, [fetchResumes, clearPolling]);

  useEffect(() => {
    const hasAnalyzingResume = resumes.some(
      (resume) => resume.status === "analyzing"
    );

    if (!hasAnalyzingResume) {
      clearPolling();
      return;
    }

    if (pollingRef.current) {
      return;
    }

    pollingRef.current = setInterval(async () => {
      const data = await fetchResumes(false);

      const stillAnalyzing = data.some(
        (resume) => resume.status === "analyzing"
      );

      if (!stillAnalyzing) {
        clearPolling();
      }
    }, 4000);

    return () => {
      clearPolling();
    };
  }, [resumes, fetchResumes, clearPolling]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume file must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);

      const response = await api.post(
        "/resumes",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedResume =
        response.data.resume;

      if (uploadedResume) {
        setResumes((current) => [
          uploadedResume,
          ...current,
        ]);

        setSelectedResume(uploadedResume);
      }

      setSuccess(
        "Resume uploaded successfully. AI analysis has started."
      );

      await fetchResumes(false);
    } catch (error) {
      console.error("Resume upload error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to upload resume"
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/resumes/${resumeId}`);

      setResumes((current) =>
        current.filter(
          (resume) => resume._id !== resumeId
        )
      );

      if (selectedResume?._id === resumeId) {
        setSelectedResume(null);

        const remaining = resumes.filter(
          (resume) => resume._id !== resumeId
        );

        if (remaining.length > 0) {
          setSelectedResume(remaining[0]);
        }
      }

      setSuccess("Resume deleted successfully.");
    } catch (error) {
      console.error("Delete resume error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete resume"
      );
    }
  };

  const getStatus = (status) => {
    return (
      statusConfig[status] ||
      statusConfig.failed
    );
  };

  const analysis = selectedResume?.analysis;

  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(Number(analysis?.score) || 0)
    )
  );

  const scoreMessage =
    score >= 80
      ? "Strong resume"
      : score >= 60
        ? "Good foundation"
        : score >= 40
          ? "Needs improvement"
          : "Needs attention";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiFileText size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Resume Analysis
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Upload your resume and get
                  AI-powered insights.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <FiPlus />
                Upload Resume
              </>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <FiXCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <FiCheckCircle className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">
                  My Resumes
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {resumes.length} resume
                  {resumes.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchResumes()
                }
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.06]"
              >
                <FiRefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.05]"
                    />
                  ))}
                </div>
              ) : resumes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-white/10">
                  <FiFileText className="mx-auto text-2xl text-slate-400" />

                  <p className="mt-3 text-sm font-semibold">
                    No resumes yet
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Upload a PDF resume to
                    start AI analysis.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      inputRef.current?.click()
                    }
                    className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    Upload Resume
                  </button>
                </div>
              ) : (
                resumes.map((resume) => {
                  const status = getStatus(
                    resume.status
                  );

                  const active =
                    selectedResume?._id ===
                    resume._id;

                  return (
                    <div
                      key={resume._id}
                      className={`group rounded-2xl border p-4 transition ${
                        active
                          ? "border-indigo-300 bg-indigo-50/70 dark:border-indigo-500/30 dark:bg-indigo-500/10"
                          : "border-slate-200 bg-white hover:border-indigo-200 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-indigo-500/20"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedResume(
                            resume
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                            <FiFileText />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {resume.fileName ||
                                "Resume.pdf"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {resume.createdAt
                                ? new Date(
                                    resume.createdAt
                                  ).toLocaleDateString()
                                : "Recently uploaded"}
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </button>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              resume._id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <section className="space-y-6">
            {!selectedResume ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <FiUploadCloud size={30} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Upload your resume
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Upload a PDF resume and
                    InterviewAI will analyze
                    your skills, experience,
                    projects and areas for
                    improvement.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      inputRef.current?.click()
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    <FiUploadCloud />
                    Upload PDF
                  </button>

                  <p className="mt-3 text-xs text-slate-400">
                    PDF only · Maximum 5MB
                  </p>
                </div>
              </div>
            ) : selectedResume.status ===
              "analyzing" ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                  </div>

                  <h2 className="mt-6 text-xl font-bold">
                    AI is analyzing your resume
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    InterviewAI is extracting
                    your skills, projects,
                    experience and other
                    important information.
                  </p>

                  <div className="mx-auto mt-6 max-w-sm">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-600" />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    This page automatically
                    checks for analysis updates.
                  </p>
                </div>
              </div>
            ) : selectedResume.status ===
              "failed" ? (
              <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-500/20 dark:bg-white/[0.04]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                  <FiXCircle size={30} />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  Resume analysis failed
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {selectedResume.errorMessage ||
                    "Something went wrong while analyzing this resume."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchResumes()
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <FiRefreshCw />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    inputRef.current?.click()
                  }
                  className="mt-3 block w-full text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  Upload another resume
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-[1fr_220px]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <FiFileText size={25} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold">
                          {selectedResume.fileName ||
                            "Resume.pdf"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          AI analyzed resume
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {Array.isArray(
                            analysis?.skills
                          ) &&
                            analysis.skills
                              .slice(0, 6)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={index}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-3xl border border-indigo-200 bg-indigo-50 p-6 text-center dark:border-indigo-500/20 dark:bg-indigo-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                      Resume Score
                    </p>

                    <div className="mt-3 flex h-28 w-28 items-center justify-center rounded-full border-8 border-indigo-200 dark:border-indigo-500/20">
                      <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {score}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-indigo-600/80 dark:text-indigo-400/80">
                      {scoreMessage}
                    </p>
                  </div>
                </div>

                <Section
                  title="Resume Summary"
                  icon={<FiFileText />}
                >
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {analysis?.summary ||
                      "No summary available."}
                  </p>
                </Section>

                <div className="grid gap-6 md:grid-cols-2">
                  <Section
                    title="Skills"
                    icon={<FiZap />}
                  >
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(
                        analysis?.skills
                      ) &&
                      analysis.skills.length ? (
                        analysis.skills.map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                            >
                              {skill}
                            </span>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No skills found.
                        </p>
                      )}
                    </div>
                  </Section>

                  <Section
                    title="Technologies"
                    icon={<FiCode />}
                  >
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(
                        analysis?.technologies
                      ) &&
                      analysis.technologies.length ? (
                        analysis.technologies.map(
                          (
                            technology,
                            index
                          ) => (
                            <span
                              key={index}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
                            >
                              {technology}
                            </span>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No technologies found.
                        </p>
                      )}
                    </div>
                  </Section>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Section
                    title="Projects"
                    icon={<FiFolder />}
                  >
                    <ListItems
                      items={analysis?.projects}
                    />
                  </Section>

                  <Section
                    title="Experience"
                    icon={<FiBriefcase />}
                  >
                    <ListItems
                      items={analysis?.experience}
                    />
                  </Section>

                  <Section
                    title="Education"
                    icon={<FiBookOpen />}
                  >
                    <ListItems
                      items={analysis?.education}
                    />
                  </Section>

                  <Section
                    title="Certifications"
                    icon={<FiAward />}
                  >
                    <ListItems
                      items={analysis?.certifications}
                    />
                  </Section>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500" />

                      <h2 className="font-bold text-emerald-700 dark:text-emerald-400">
                        Strengths
                      </h2>
                    </div>

                    <div className="mt-4">
                      <ListItems
                        items={
                          analysis?.strengths
                        }
                        empty="No strengths identified."
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <div className="flex items-center gap-2">
                      <FiTarget className="text-amber-500" />

                      <h2 className="font-bold text-amber-700 dark:text-amber-400">
                        Weaknesses
                      </h2>
                    </div>

                    <div className="mt-4">
                      <ListItems
                        items={
                          analysis?.weaknesses
                        }
                        empty="No weaknesses identified."
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="text-indigo-500" />

                      <h2 className="font-bold text-indigo-700 dark:text-indigo-400">
                        Recommendations
                      </h2>
                    </div>

                    <div className="mt-4">
                      <ListItems
                        items={
                          analysis?.recommendations
                        }
                        empty="No recommendations available."
                      />
                    </div>
                  </div>
                </div>

                {Array.isArray(
                  analysis?.achievements
                ) &&
                  analysis.achievements.length >
                    0 && (
                    <Section
                      title="Achievements"
                      icon={<FiAward />}
                    >
                      <ListItems
                        items={
                          analysis.achievements
                        }
                      />
                    </Section>
                  )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Resume;