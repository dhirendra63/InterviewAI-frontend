import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiArrowRight, FiShield, FiZap } from "react-icons/fi";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-lg">
              <img
                src="/logo.png"
                alt="InterviewAI"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="text-xl font-semibold tracking-tight">
              InterviewAI
            </span>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
            <FiShield />
            Secure authentication
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg">
                  {/* <FiZap className="text-2xl" /> */}
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src="/logo.png"
                      alt="InterviewAI"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome to InterviewAI
                </h1>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-400">
                  Practice realistic interviews with an AI interviewer
                  and get actionable feedback to improve your performance.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-medium text-slate-900 transition duration-200 hover:bg-slate-100 active:scale-[0.98]"
              >
                <FcGoogle className="text-xl" />

                <span>Continue with Google</span>

                <FiArrowRight className="ml-auto text-slate-500 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-500">
                  AI-powered interview practice
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-sm font-medium">
                    Real-time AI
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Dynamic interview questions
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-sm font-medium">
                    Smart Feedback
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Detailed performance analysis
                  </p>
                </div>
              </div>

              <p className="mt-7 text-center text-xs leading-5 text-slate-500">
                By continuing, you agree to use InterviewAI responsibly
                for interview preparation.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              © 2026 InterviewAI. AI-powered interview preparation.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Login;