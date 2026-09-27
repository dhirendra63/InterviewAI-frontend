import { useState } from "react";
import {
  FiAward,
  FiCheckCircle,
  FiEdit3,
  FiMail,
  FiSave,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [editing, setEditing] =
    useState(false);

  const [name, setName] = useState(
    user?.name || ""
  );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSave = async () => {
    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Name cannot be empty."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await api.patch(
          "/auth/profile",
          {
            name: trimmedName,
          }
        );

      setUser(response.data.user);

      setName(
        response.data.user.name
      );

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(
      user?.name || ""
    );

    setEditing(false);
    setError("");
  };

  const accountType =
    user?.isPremium
      ? "Premium Account"
      : "Free Account";

  const avatar =
    user?.avatar ||
    user?.picture ||
    "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your InterviewAI
            account information.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <FiShield />

            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <FiCheckCircle />

            {success}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-lg dark:border-slate-900"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-indigo-100 text-indigo-600 shadow-lg dark:border-slate-900 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <FiUser
                      size={38}
                    />
                  </div>
                )}

                <div className="pb-1">
                  <h2 className="text-xl font-bold">
                    {user?.name ||
                      "User"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {user?.email ||
                      "No email available"}
                  </p>
                </div>
              </div>

              {!editing && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                >
                  <FiEdit3 />

                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiUser />
              </div>

              <div>
                <h2 className="font-bold">
                  Personal Information
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your account details
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>

                {editing ? (
                  <input
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-950/50"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]">
                    <FiUser className="text-slate-400" />

                    <span className="text-sm font-medium">
                      {user?.name ||
                        "Not available"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]">
                  <FiMail className="text-slate-400" />

                  <span className="truncate text-sm font-medium">
                    {user?.email ||
                      "Not available"}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Your Google account email
                  cannot be changed here.
                </p>
              </div>

              {editing && (
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    onClick={
                      handleSave
                    }
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />

                        Save Changes
                      </>
                    )}
                  </button>

                  <button
                    onClick={
                      handleCancel
                    }
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                  >
                    <FiX />

                    Cancel
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <FiAward />
              </div>

              <div>
                <h2 className="font-bold">
                  Account Status
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Subscription and credits
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Account Type
                  </p>

                  <p className="mt-1 font-bold">
                    {accountType}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    user?.isPremium
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                      : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {user?.isPremium
                    ? "PREMIUM"
                    : "FREE"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Available Credits
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {user?.credits ??
                      0}
                  </p>
                </div>

                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Credits
                </span>
              </div>

              {user?.isPremium &&
                user?.premiumExpiresAt && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Premium expires
                    </p>

                    <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                      {new Date(
                        user.premiumExpiresAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiShield />
            </div>

            <div>
              <h2 className="font-bold">
                Account Security
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authentication information
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <p className="text-xs text-slate-400">
                Authentication
              </p>

              <div className="mt-2 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" />

                <span className="text-sm font-bold">
                  Google Account
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <p className="text-xs text-slate-400">
                Session
              </p>

              <div className="mt-2 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" />

                <span className="text-sm font-bold">
                  Secure Authentication
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;