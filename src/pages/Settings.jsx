import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiLogOut,
  FiMic,
  FiMoon,
  FiSave,
  FiSettings,
  FiSun,
  FiVolume2,
  FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } =
    useTheme();

  const [settings, setSettings] =
    useState({
      notifications: true,
      interviewReminders: true,
      voiceInput: true,
      autoSpeak: true,
      soundEffects: true,
      autoSubmit: false,
    });

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const savedSettings =
      localStorage.getItem(
        "interviewai-settings"
      );

    if (savedSettings) {
      try {
        setSettings(
          JSON.parse(savedSettings)
        );
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "interviewai-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const Toggle = ({
    enabled,
    onChange,
  }) => {
    return (
      <button
        type="button"
        onClick={() =>
          onChange(!enabled)
        }
        className={`relative h-7 w-12 rounded-full transition ${
          enabled
            ? "bg-indigo-600"
            : "bg-slate-300 dark:bg-white/20"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    );
  };

  const SettingRow = ({
    icon,
    title,
    description,
    enabled,
    onChange,
  }) => {
    return (
      <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {icon}
          </div>

          <div>
            <h3 className="text-sm font-bold">
              {title}
            </h3>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <Toggle
          enabled={enabled}
          onChange={onChange}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FiSettings
                size={24}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Customize your InterviewAI
                experience.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {theme === "dark" ? (
                <FiMoon />
              ) : (
                <FiSun />
              )}
            </div>

            <div>
              <h2 className="font-bold">
                Appearance
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how InterviewAI looks.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                if (theme !== "light") {
                  toggleTheme();
                }
              }}
              className={`rounded-2xl border p-5 text-left transition ${
                theme === "light"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : "border-slate-200 hover:border-indigo-300 dark:border-white/10 dark:hover:border-indigo-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm dark:bg-white/10">
                  <FiSun />
                </div>

                {theme === "light" && (
                  <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                )}
              </div>

              <h3 className="mt-4 font-bold">
                Light Mode
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Use a bright interface.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (theme !== "dark") {
                  toggleTheme();
                }
              }}
              className={`rounded-2xl border p-5 text-left transition ${
                theme === "dark"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : "border-slate-200 hover:border-indigo-300 dark:border-white/10 dark:hover:border-indigo-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-indigo-300 dark:bg-white/10">
                  <FiMoon />
                </div>

                {theme === "dark" && (
                  <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                )}
              </div>

              <h3 className="mt-4 font-bold">
                Dark Mode
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Use a darker interface.
              </p>
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FiBell />
            </div>

            <div>
              <h2 className="font-bold">
                Notifications
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control your interview
                notifications.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <SettingRow
              icon={<FiBell />}
              title="Notifications"
              description="Receive important updates and interview-related notifications."
              enabled={
                settings.notifications
              }
              onChange={(value) =>
                updateSetting(
                  "notifications",
                  value
                )
              }
            />

            <SettingRow
              icon={<FiZap />}
              title="Interview Reminders"
              description="Get reminders about interviews and unfinished sessions."
              enabled={
                settings.interviewReminders
              }
              onChange={(value) =>
                updateSetting(
                  "interviewReminders",
                  value
                )
              }
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FiMic />
            </div>

            <div>
              <h2 className="font-bold">
                Interview Experience
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure voice and interview
                behaviour.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <SettingRow
              icon={<FiMic />}
              title="Voice Input"
              description="Enable browser speech recognition while answering interview questions."
              enabled={
                settings.voiceInput
              }
              onChange={(value) =>
                updateSetting(
                  "voiceInput",
                  value
                )
              }
            />

            <SettingRow
              icon={<FiVolume2 />}
              title="AI Auto Speak"
              description="Automatically speak new AI-generated interview questions."
              enabled={
                settings.autoSpeak
              }
              onChange={(value) =>
                updateSetting(
                  "autoSpeak",
                  value
                )
              }
            />

            <SettingRow
              icon={<FiVolume2 />}
              title="Sound Effects"
              description="Enable interface sounds during your interview experience."
              enabled={
                settings.soundEffects
              }
              onChange={(value) =>
                updateSetting(
                  "soundEffects",
                  value
                )
              }
            />

            <SettingRow
              icon={<FiZap />}
              title="Auto Submit"
              description="Automatically submit an answer when the configured interview flow allows it."
              enabled={
                settings.autoSubmit
              }
              onChange={(value) =>
                updateSetting(
                  "autoSubmit",
                  value
                )
              }
            />
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={saveSettings}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            {saved ? (
              <>
                <FiCheck />
                Saved
              </>
            ) : (
              <>
                <FiSave />
                Save Settings
              </>
            )}
          </button>
        </div>

        <section className="mt-8 rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-500/20 dark:bg-white/[0.04]">
          <div>
            <h2 className="font-bold text-red-600 dark:text-red-400">
              Account Session
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign out from your InterviewAI
              account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <FiLogOut />

            Logout
          </button>
        </section>
      </main>
    </div>
  );
};

export default Settings;