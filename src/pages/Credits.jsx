import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    credits: 10,
    description: "For occasional interview practice",
    features: [
      "10 interview credits",
      "AI interview evaluation",
      "Interview history",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    credits: 25,
    description: "For regular interview preparation",
    features: [
      "25 interview credits",
      "AI interview evaluation",
      "Advanced analytics",
      "Resume-based interviews",
      "Priority AI processing",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 399,
    credits: 60,
    description: "For serious interview preparation",
    features: [
      "60 interview credits",
      "Premium membership",
      "Advanced analytics",
      "Resume-based interviews",
      "Priority AI processing",
      "30 days Premium access",
    ],
  },
];

const Credits = () => {
  const { getMe } = useAuth();

  const [credits, setCredits] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPlan, setBuyingPlan] = useState(null);
  const [message, setMessage] = useState("");

  const loadCredits = async () => {
    try {
      const response = await api.get("/credits");

      setCredits(response.data.credits);
      setIsPremium(response.data.isPremium);
      setPremiumExpiresAt(response.data.premiumExpiresAt);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const handlePurchase = async (plan) => {
    try {
      setBuyingPlan(plan.id);
      setMessage("");

      const response = await api.post("/payments/create-order", {
        plan: plan.id,
      });

      const {
        orderId,
        amount,
        currency,
        keyId,
      } = response.data;

      if (!window.Razorpay) {
        setMessage("Razorpay checkout failed to load.");
        setBuyingPlan(null);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "InterviewAI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: orderId,

        handler: async function (paymentResponse) {
          try {
            setBuyingPlan(plan.id);

            const verifyResponse = await api.post(
              "/payments/verify",
              paymentResponse
            );

            if (verifyResponse.data.success) {
              setCredits(verifyResponse.data.credits);
              setIsPremium(verifyResponse.data.isPremium);
              setPremiumExpiresAt(
                verifyResponse.data.premiumExpiresAt
              );

              await getMe();

              setMessage(
                `${plan.name} plan activated successfully.`
              );
            }
          } catch (error) {
            setMessage(
              error.response?.data?.message ||
                "Payment verification failed."
            );
          } finally {
            setBuyingPlan(null);
          }
        },

        modal: {
          ondismiss: function () {
            setBuyingPlan(null);
          },
        },

        theme: {
          color: "#4f46e5",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        setMessage("Payment failed. Please try again.");
        setBuyingPlan(null);
      });

      razorpay.open();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to start payment."
      );
      setBuyingPlan(null);
    }
  };

  const formattedExpiry = premiumExpiresAt
    ? new Date(
        premiumExpiresAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2
          className="animate-spin text-indigo-500"
          size={30}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors dark:bg-[#080b14] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-indigo-500">
              <CreditCard size={20} />
              <span className="text-sm font-semibold">
                InterviewAI Credits
              </span>
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Power your interview practice
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
              Get credits and unlock more AI-powered mock interviews.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-white px-5 py-4 shadow-sm dark:border-indigo-500/20 dark:bg-white/[0.04]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Available Credits
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-500">
              {credits}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4 text-sm font-medium text-indigo-500">
            {message}
          </div>
        )}

        {isPremium && (
          <div className="mb-8 flex items-center gap-4 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <Crown size={22} />
            </div>

            <div>
              <p className="font-bold text-amber-600 dark:text-amber-400">
                Premium is active
              </p>

              {formattedExpiry && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Active until {formattedExpiry}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border bg-white p-6 shadow-sm transition dark:bg-white/[0.04] ${
                plan.popular
                  ? "border-indigo-500 shadow-indigo-500/10"
                  : "border-slate-200 dark:border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                  {plan.id === "premium" ? (
                    <Crown size={22} />
                  ) : (
                    <Zap size={22} />
                  )}
                </div>

                <h2 className="text-xl font-bold">
                  {plan.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ₹{plan.price}
                </span>

                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                  / plan
                </span>
              </div>

              <div className="mb-6 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Credits included
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {plan.credits}
                </p>
              </div>

              <div className="mb-7 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(plan)}
                disabled={buyingPlan !== null}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buyingPlan === plan.id ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Get {plan.name}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-5 text-center dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:text-left">
          <ShieldCheck
            size={22}
            className="text-emerald-500"
          />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Payments are processed through Razorpay. Your Razorpay secret key stays on the backend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Credits;