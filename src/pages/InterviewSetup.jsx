import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiClock,
  FiFileText,
  FiLayers,
  FiTarget,
  FiZap,
} from "react-icons/fi";

import api from "../services/api";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
];

const experiences = [
  "Fresher",
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5+ Years",
];

const modes = [
  {
    id: "HR",
    title: "HR Interview",
    description:
      "Behavioral, communication and personality questions",
  },
  {
    id: "Technical",
    title: "Technical",
    description:
      "Role-specific technical and problem-solving questions",
  },
  {
    id: "Confidence",
    title: "Confidence",
    description:
      "Improve communication and interview confidence",
  },
  {
    id: "Mixed",
    title: "Mixed",
    description:
      "Balanced HR and technical interview",
  },
];

const difficulties = [
  "Easy",
  "Medium",
  "Hard",
  "Adaptive",
];

const durations = [10, 20, 30];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialResumeId =
    location.state?.resumeId || null;

  const initialResumeBased =
    location.state?.resumeBased || false;

  const [form, setForm] = useState({
    role: "",
    experience: "",
    mode: "Mixed",
    difficulty: "Adaptive",
    duration: 20,
    resumeBased: initialResumeBased,
  });

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] =
    useState(initialResumeId);

  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] =
    useState(false);
  const [error, setError] = useState("");

  const creditCost = useMemo(() => {
    let cost =
      form.duration === 10
        ? 1
        : form.duration === 20
        ? 2
        : 3;

    if (form.resumeBased) {
      cost += 1;
    }

    return cost;
  }, [form.duration, form.resumeBased]);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "resumeBased") {
      setError("");
    }
  };

  useEffect(() => {
    if (!form.resumeBased) {
      return;
    }

    const loadResumes = async () => {
      try {
        setResumeLoading(true);

        const response =
          await api.get("/resumes");

        const resumeList = Array.isArray(
          response.data?.resumes
        )
          ? response.data.resumes
          : [];

        setResumes(resumeList);

        if (
          initialResumeId &&
          resumeList.some(
            (resume) =>
              resume._id === initialResumeId
          )
        ) {
          setSelectedResumeId(
            initialResumeId
          );
          return;
        }

        const analyzedResume =
          resumeList.find(
            (resume) =>
              resume.status === "analyzed"
          );

        if (
          !selectedResumeId &&
          analyzedResume
        ) {
          setSelectedResumeId(
            analyzedResume._id
          );
        }
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Failed to load resumes"
        );
      } finally {
        setResumeLoading(false);
      }
    };

    loadResumes();
  }, [form.resumeBased]);

  const analyzedResumes = useMemo(() => {
    return resumes.filter(
      (resume) =>
        resume.status === "analyzed"
    );
  }, [resumes]);

  const selectedResume = useMemo(() => {
    return analyzedResumes.find(
      (resume) =>
        resume._id === selectedResumeId
    );
  }, [
    analyzedResumes,
    selectedResumeId,
  ]);

  const handleStart = async () => {
    if (!form.role || !form.experience) {
      setError(
        "Please select your role and experience level."
      );
      return;
    }

    if (
      form.resumeBased &&
      !selectedResumeId
    ) {
      setError(
        "Please select an analyzed resume for resume-based interview."
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/interviews",
          {
            ...form,
            resumeId: form.resumeBased
              ? selectedResumeId
              : null,
          }
        );

      const interviewId =
        response.data?.interview?._id ||
        response.data?.interview?.id;

      if (!interviewId) {
        throw new Error(
          "Interview created but no interview ID was returned."
        );
      }

      navigate(
        `/interview/${interviewId}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create interview."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black transition-colors dark:bg-black dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-semibold text-black dark:border-gray-700/20 dark:bg-gray-1000/10 dark:text-gray-400">
            <FiZap />
            AI Interview
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Set up your interview
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Customize your AI interview based on
            your role, experience and preparation
            goals.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-black dark:bg-gray-1000/10 dark:text-gray-400">
                  <FiBriefcase />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Job Details
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tell us what role you are
                    preparing for
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Target Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      updateForm(
                        "role",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-700 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <option value="">
                      Select role
                    </option>

                    {roles.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Experience
                  </label>

                  <select
                    value={form.experience}
                    onChange={(e) =>
                      updateForm(
                        "experience",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-700 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <option value="">
                      Select experience
                    </option>

                    {experiences.map(
                      (experience) => (
                        <option
                          key={experience}
                          value={experience}
                        >
                          {experience}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-gray-700 dark:bg-gray-100 dark:text-gray-400">
                  <FiLayers />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Interview Mode
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose what you want to
                    practice
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {modes.map((mode) => {
                  const selected =
                    form.mode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        updateForm(
                          "mode",
                          mode.id
                        )
                      }
                      className={`relative rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-gray-700 bg-gray-100 text-black dark:border-gray-700 dark:bg-gray-100 dark:text-black"
                          : "border-gray-200 text-black hover:border-gray-400 dark:border-gray-700 dark:text-white dark:hover:border-gray-500"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                          <FiCheck size={12} />
                        </span>
                      )}

                      <h3 className={`pr-6 text-sm font-semibold ${selected ? "text-black" : "text-black dark:text-white"}`}>
                        {mode.title}
                      </h3>

                      <p className={`mt-1 text-xs leading-5 ${selected ? "text-gray-600" : "text-gray-500 dark:text-gray-400"}`}>
                        {mode.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-gray-700 dark:bg-gray-100 dark:text-gray-400">
                  <FiTarget />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Difficulty
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select your preferred challenge
                    level
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {difficulties.map(
                  (difficulty) => {
                    const selected =
                      form.difficulty ===
                      difficulty;

                    return (
                      <button
                        key={difficulty}
                        type="button"
                        onClick={() =>
                          updateForm(
                            "difficulty",
                            difficulty
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          selected
                            ? "border-gray-700 bg-black text-white"
                            : "border-gray-200 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
                        }`}
                      >
                        {difficulty}
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-gray-700 dark:bg-gray-100 dark:text-gray-400">
                  <FiClock />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Interview Duration
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose how long you want to
                    practice
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {durations.map((duration) => {
                  const selected =
                    form.duration ===
                    duration;

                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() =>
                        updateForm(
                          "duration",
                          duration
                        )
                      }
                      className={`rounded-xl border px-4 py-4 text-center transition ${
                        selected
                          ? "border-gray-700 bg-black text-white"
                          : "border-gray-200 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
                      }`}
                    >
                      <div className="text-lg font-bold">
                        {duration}
                      </div>

                      <div className="text-xs opacity-80">
                        minutes
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black sm:p-7">
              <button
                type="button"
                onClick={() =>
                  updateForm(
                    "resumeBased",
                    !form.resumeBased
                  )
                }
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-gray-700 dark:bg-gray-100 dark:text-gray-400">
                    <FiFileText />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Resume-based Interview
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Generate questions from your
                      uploaded resume
                    </p>
                  </div>
                </div>

                <div
                  className={`relative h-7 w-12 rounded-full transition ${
                    form.resumeBased
                      ? "bg-black"
                      : "bg-slate-300 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      form.resumeBased
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </div>
              </button>

              {form.resumeBased && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
                  {resumeLoading ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-gray-900">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-slate-600 dark:border-t-gray-400" />

                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loading your resumes...
                      </span>
                    </div>
                  ) : analyzedResumes.length ===
                    0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900/50">
                      <FiFileText className="mx-auto text-3xl text-gray-400" />

                      <h3 className="mt-3 text-sm font-semibold">
                        No analyzed resume found
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        Upload and analyze your
                        resume before starting a
                        resume-based interview.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/resume")
                        }
                        className="mt-4 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                      >
                        Go to Resume
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">
                            Select Resume
                          </h3>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            The AI will use this resume
                            to personalize questions.
                          </p>
                        </div>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                          AI Analyzed
                        </span>
                      </div>

                      <div className="space-y-3">
                        {analyzedResumes.map(
                          (resume) => {
                            const selected =
                              selectedResumeId ===
                              resume._id;

                            return (
                              <button
                                key={resume._id}
                                type="button"
                                onClick={() =>
                                  setSelectedResumeId(
                                    resume._id
                                  )
                                }
                                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                  selected
                                    ? "border-gray-700 bg-gray-100 dark:border-gray-700 dark:bg-gray-1000/10"
                                    : "border-gray-200 hover:border-gray-400 dark:border-gray-700"
                                }`}
                              >
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                    selected
                                      ? "bg-black text-white"
                                      : "bg-gray-100 text-gray-500 dark:bg-gray-900"
                                  }`}
                                >
                                  <FiFileText />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">
                                    {resume.originalName ||
                                      resume.filename ||
                                      "Resume"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {resume.analysis
                                      ?.summary
                                      ? resume.analysis.summary.slice(
                                          0,
                                          100
                                        ) +
                                        (resume
                                          .analysis
                                          .summary
                                          .length >
                                        100
                                          ? "..."
                                          : "")
                                      : "Resume analyzed successfully"}
                                  </p>
                                </div>

                                {selected && (
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
                                    <FiCheck size={13} />
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {selectedResume && (
                        <div className="mt-4 rounded-2xl bg-gray-100 p-4 dark:bg-gray-1000/10">
                          <div className="flex items-start gap-3">
                            <FiZap className="mt-0.5 shrink-0 text-gray-700" />

                            <div>
                              <p className="text-xs font-semibold text-black dark:text-gray-400">
                                Resume personalization enabled
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                                Questions will be generated
                                using the skills, projects,
                                experience and other analyzed
                                information from this resume.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black">
              <h2 className="text-lg font-bold">
                Interview Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Role
                  </span>

                  <span className="max-w-[180px] truncate font-medium">
                    {form.role ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Experience
                  </span>

                  <span className="font-medium">
                    {form.experience ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Mode
                  </span>

                  <span className="font-medium">
                    {form.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Difficulty
                  </span>

                  <span className="font-medium">
                    {form.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Duration
                  </span>

                  <span className="font-medium">
                    {form.duration} min
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Resume
                  </span>

                  <span
                    className={`font-medium ${
                      form.resumeBased
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {form.resumeBased
                      ? "Included"
                      : "Not included"}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Credits required
                    </span>

                    <span className="text-2xl font-bold text-black dark:text-gray-400">
                      {creditCost}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-700 dark:border-gray-300 dark:bg-gray-1000/10 dark:text-gray-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleStart}
                disabled={
                  loading ||
                  (form.resumeBased &&
                    analyzedResumes.length === 0)
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Interview..."
                  : "Start Interview"}

                {!loading && <FiArrowRight />}
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                {form.resumeBased
                  ? "1 additional credit is required for resume personalization."
                  : "Credits will be deducted when the interview is created."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}