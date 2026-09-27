import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Menu,
  Mic2,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    icon: Mic2,
    title: "Real-time AI Interview",
    description:
      "Have realistic conversations with an adaptive AI interviewer.",
  },
  {
    icon: BrainCircuit,
    title: "Smart Evaluation",
    description:
      "Get detailed feedback on your answers and interview performance.",
  },
  {
    icon: FileText,
    title: "Resume-Based Questions",
    description:
      "Practice questions generated around your skills and projects.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your scores, strengths and improvement over time.",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#08090d] dark:text-white">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#08090d]/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
              <img
                src="/logo.png"
                alt="InterviewAI"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              InterviewAI
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#pricing"
              className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Pricing
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-white/10 dark:text-slate-300"
            >
              {mobileMenu ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 dark:border-white/[0.08] dark:bg-[#0b0d12] md:hidden">
            <div className="flex flex-col gap-2">
              <a
                href="#features"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              >
                How It Works
              </a>

              <a
                href="#pricing"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              >
                Pricing
              </a>

              <button
                onClick={() => navigate("/login")}
                className="mt-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-40 sm:px-8 sm:pt-48">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-slate-500/10 blur-[140px] dark:bg-white/[0.04]" />

          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:shadow-none">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-white" />
                AI-powered interview practice
              </div>

             <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Practice Interviews.
                <br />
                <span className="text-slate-500 dark:text-slate-400">
                  Build Confidence. Get Hired.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-500 sm:text-lg">
                Practice realistic job interviews with an AI interviewer,
                receive detailed feedback, and improve your performance
                with every session.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/login")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 sm:w-auto"
                >
                  Start Interview
                  <ArrowRight size={17} />
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.05] sm:w-auto"
                >
                  See How It Works
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 px-5 py-24 sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-slate-500">
                Everything you need
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A smarter way to prepare.
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-500 sm:text-base">
                InterviewAI combines realistic interviews, AI evaluation
                and performance analytics in one platform.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.025] dark:shadow-none"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-white">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-6 font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-500">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 border-y border-slate-200 bg-white px-5 py-24 dark:border-white/[0.06] dark:bg-transparent sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Simple process
              </p>

              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                How it works
              </h2>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-5">
              {[
                "Select your role",
                "Choose interview mode",
                "Talk with AI interviewer",
                "Get instant evaluation",
                "Track your progress",
              ].map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/[0.08] dark:bg-white/[0.025]"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-black">
                    {index + 1}
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-24 px-5 py-24 sm:px-8"
        >
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025] dark:shadow-none sm:p-12">
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Simple pricing
              </p>

              <h2 className="mt-3 text-3xl font-semibold">
                Start practicing today.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-500">
                Use credits for AI interview sessions and track your
                progress as you improve.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-black/20">
              <p className="text-sm text-slate-500">
                Free Starter
              </p>

              <p className="mt-2 text-4xl font-semibold">
                5 Credits
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "AI interview practice",
                  "Performance evaluation",
                  "Interview history",
                  "Basic analytics",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 size={16} />
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/login")}
                className="mt-7 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 pt-10 sm:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025] dark:shadow-none sm:px-12">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready for your next interview?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-500">
              Practice with AI, understand your weaknesses and walk
              into your next interview with confidence.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
            >
              Start Practicing
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-8 dark:border-white/[0.08] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
              <img
                src="/logo.png"
                alt="InterviewAI"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm font-medium">
              InterviewAI
            </span>
          </div>

          <p className="text-xs text-slate-500">
           © 2026 InterviewAI by Dhirendra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;