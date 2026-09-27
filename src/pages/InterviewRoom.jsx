import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiClock,
  FiMic,
  FiSend,
  FiX,
  FiChevronRight,
  FiMessageSquare,
  FiZap,
  FiVolume2,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

import api from "../services/api";

const getCurrentQuestion = (interview, questionIndex) => {
  return interview?.questions?.[questionIndex]?.question || "";
};

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState("");
  const [voiceMetrics, setVoiceMetrics] = useState(null);

  const [settings, setSettings] = useState({
    voiceInput: true,
    autoSpeak: true,
    soundEffects: true,
    autoSubmit: false,
  });

  const recognitionRef = useRef(null);
  const socketRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);
  const voiceStartRef = useRef(null);
  const voiceTranscriptRef = useRef("");
  const voiceLastResultRef = useRef(null);
  const voicePauseCountRef = useRef(0);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(
        "interviewai-settings"
      );

      if (savedSettings) {
        setSettings((current) => ({
          ...current,
          ...JSON.parse(savedSettings),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const response = await api.get(`/interviews/${id}`);

        let data = response.data.interview;

        if (data.status === "created") {
          const startResponse = await api.patch(
            `/interviews/${id}/start`
          );

          data = startResponse.data.interview;
        }

        if (
          data.status === "completed" ||
          data.status === "cancelled"
        ) {
          navigate(`/interview/${id}/result`, {
            replace: true,
          });
          return;
        }

        setInterview(data);

        const remainingTime = data.expiresAt
          ? Math.max(
              0,
              Math.floor(
                (new Date(data.expiresAt).getTime() -
                  Date.now()) /
                  1000
              )
            )
          : data.duration * 60;

        setTimeLeft(remainingTime);
      } catch (error) {
        console.error(error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id, navigate]);

  useEffect(() => {
    if (!interview) {
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);

      socket.emit("join-interview", id);

      socket.emit("interview-status", {
        interviewId: id,
        status: "active",
      });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    socket.on("interview-joined", () => {
      setRemoteStatus("Interview connected");
    });

    socket.on("interview-status", (data) => {
      if (data?.interviewId !== id) {
        return;
      }

      setRemoteStatus(data.status || "");
    });

    socket.on("answer-started", (data) => {
      if (data?.interviewId !== id) {
        return;
      }

      setRemoteStatus("Answer in progress");
    });

    socket.on("answer-submitted", (data) => {
      if (data?.interviewId !== id) {
        return;
      }

      setRemoteStatus("Answer submitted");
    });

    return () => {
      socket.emit("leave-interview", id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [interview, id]);

  useEffect(() => {
    if (!interview || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) =>
        Math.max(0, current - 1)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [interview, timeLeft]);

  useEffect(() => {
    if (interview && timeLeft === 0) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      if (
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }

      navigate(`/interview/${id}/result`);
    }
  }, [timeLeft, interview, id, navigate]);

  useEffect(() => {
    if (
      !interview ||
      !settings.autoSpeak ||
      answer.trim() ||
      submitting
    ) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    const question = getCurrentQuestion(
      interview,
      questionIndex
    );

    if (!question) {
      return;
    }

    window.speechSynthesis.cancel();
    setSpeaking(false);

    const timer = setTimeout(() => {
      const utterance =
        new SpeechSynthesisUtterance(question);

      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setSpeaking(true);

        socketRef.current?.emit(
          "interview-status",
          {
            interviewId: id,
            status: "ai-speaking",
          }
        );
      };

      utterance.onend = () => {
        setSpeaking(false);

        socketRef.current?.emit(
          "interview-status",
          {
            interviewId: id,
            status: "waiting-answer",
          }
        );
      };

      utterance.onerror = () => {
        setSpeaking(false);
      };

      window.speechSynthesis.speak(
        utterance
      );
    }, 600);

    return () => {
      clearTimeout(timer);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      setSpeaking(false);
    };
  }, [
    interview,
    questionIndex,
    settings.autoSpeak,
    answer,
    submitting,
    id,
  ]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }

      if (
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }

      socketRef.current?.emit(
        "leave-interview",
        id
      );

      socketRef.current?.disconnect();
    };
  }, [id]);

  const playSound = (type = "click") => {
    if (!settings.soundEffects) {
      return;
    }

    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const context = new AudioContext();
      const oscillator =
        context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";

      if (type === "success") {
        oscillator.frequency.value = 700;
      } else if (type === "error") {
        oscillator.frequency.value = 220;
      } else {
        oscillator.frequency.value = 440;
      }

      gain.gain.setValueAtTime(
        0.04,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.12
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(
        context.currentTime + 0.12
      );

      setTimeout(() => {
        context.close();
      }, 300);
    } catch (error) {
      console.error(error);
    }
  };

  const speakQuestion = () => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      setError(
        "Speech output is not supported in this browser."
      );
      return;
    }

    const question = getCurrentQuestion(
      interview,
      questionIndex
    );

    if (!question) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(question);

    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeaking(true);

      socketRef.current?.emit(
        "interview-status",
        {
          interviewId: id,
          status: "ai-speaking",
        }
      );
    };

    utterance.onend = () => {
      setSpeaking(false);

      socketRef.current?.emit(
        "interview-status",
        {
          interviewId: id,
          status: "waiting-answer",
        }
      );
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    playSound("click");

    window.speechSynthesis.speak(
      utterance
    );
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) {
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const currentQuestion =
      interview.questions[questionIndex];

    const currentVoiceMetrics =
      voiceMetrics ||
      (voiceStartRef.current
        ? {
            speakingDuration: Math.max(
              0,
              (Date.now() - voiceStartRef.current) / 1000
            ),
            wordCount: answer
              .trim()
              .split(/\s+/)
              .filter(Boolean).length,
            speakingRate: 0,
            fillerWords: 0,
            pauseCount: voicePauseCountRef.current || 0,
          }
        : null);

    if (!currentQuestion?._id) {
      setError("Question ID is missing.");
      playSound("error");
      return;
    }

    setSubmitting(true);
    setListening(false);
    setError("");
    setEvaluation(null);
    setShowEvaluation(false);

    socketRef.current?.emit(
      "answer-submitted",
      {
        interviewId: id,
        questionId: currentQuestion._id,
      }
    );

    playSound("click");

    try {
      const response = await api.post(
        `/interviews/${id}/answer`,
        {
          questionId: currentQuestion._id,
          answer: answer.trim(),
          voiceMetrics: currentVoiceMetrics,
        }
      );

      const data = response.data;

      setEvaluation(data.evaluation || null);

      playSound("success");

      if (data.completed) {
        socketRef.current?.emit(
          "interview-status",
          {
            interviewId: id,
            status: "completed",
          }
        );

        setShowEvaluation(true);

        setTimeout(() => {
          navigate(`/interview/${id}/result`);
        }, 1800);

        return;
      }

      if (data.nextQuestion) {
        setInterview((current) => ({
          ...current,
          questions: [
            ...current.questions,
            data.nextQuestion,
          ],
        }));

        setQuestionIndex(
          (current) => current + 1
        );

        setAnswer("");
        setVoiceMetrics(null);
        voiceStartRef.current = null;
        voiceTranscriptRef.current = "";
        voiceLastResultRef.current = null;
        voicePauseCountRef.current = 0;
        setShowEvaluation(true);

        socketRef.current?.emit(
          "interview-status",
          {
            interviewId: id,
            status: "next-question",
          }
        );

        return;
      }

      if (
        questionIndex <
        interview.questions.length - 1
      ) {
        setQuestionIndex(
          (current) => current + 1
        );

        setAnswer("");
        setVoiceMetrics(null);
        voiceStartRef.current = null;
        voiceTranscriptRef.current = "";
        voiceLastResultRef.current = null;
        voicePauseCountRef.current = 0;
        setShowEvaluation(true);

        return;
      }

      setShowEvaluation(true);
    } catch (error) {
      console.error(error);

      playSound("error");

      setError(
        error.response?.data?.message ||
          "Failed to evaluate your answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
    }

    socketRef.current?.emit(
      "interview-status",
      {
        interviewId: id,
        status: "ending",
      }
    );

    try {
      await api.patch(`/interviews/${id}/cancel`);
    } catch (error) {
      console.error(error);
    }

    navigate(`/interview/${id}/result`);
  };

  const toggleListening = () => {
    if (!settings.voiceInput) {
      setError(
        "Voice input is disabled in Settings."
      );
      playSound("error");
      return;
    }

    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Voice input is not supported in this browser."
      );
      playSound("error");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);

      socketRef.current?.emit(
        "interview-status",
        {
          interviewId: id,
          status: "voice-stopped",
        }
      );

      return;
    }

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const recognition =
      new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      voiceStartRef.current = Date.now();
      voiceTranscriptRef.current = answer.trim();
      voiceLastResultRef.current = Date.now();
      voicePauseCountRef.current = 0;
      setVoiceMetrics(null);
      setListening(true);
      setError("");

      socketRef.current?.emit(
        "answer-started",
        {
          interviewId: id,
        }
      );

      socketRef.current?.emit(
        "interview-status",
        {
          interviewId: id,
          status: "listening",
        }
      );

      playSound("click");
    };

   recognition.onresult = (event) => {
  let finalTranscript = "";
  let interimTranscript = "";

  for (
    let index = event.resultIndex;
    index < event.results.length;
    index++
  ) {
    const transcript =
      event.results[index][0].transcript;

    if (event.results[index].isFinal) {
      finalTranscript += transcript;
    } else {
      interimTranscript += transcript;
    }
  }

  const now = Date.now();

  if (
    voiceLastResultRef.current &&
    now - voiceLastResultRef.current >= 1500
  ) {
    voicePauseCountRef.current += 1;
  }

  voiceLastResultRef.current = now;

  setAnswer((current) => {
    const baseAnswer = voiceTranscriptRef.current || current.trim();

    const nextAnswer = finalTranscript
      ? baseAnswer
        ? `${baseAnswer} ${finalTranscript.trim()}`
        : finalTranscript.trim()
      : baseAnswer;

    voiceTranscriptRef.current = nextAnswer;

    return interimTranscript
      ? `${nextAnswer}${nextAnswer ? " " : ""}${interimTranscript.trim()}`
      : nextAnswer;
  });
};

    recognition.onerror = (event) => {
      setListening(false);
      recognitionRef.current = null;

      if (event.error !== "aborted") {
        setError(
          "Voice input failed. Please try again."
        );

        playSound("error");
      }

      socketRef.current?.emit(
        "interview-status",
        {
          interviewId: id,
          status: "voice-error",
        }
      );
    };

    recognition.onend = () => {
      const endedAt = Date.now();
      const startedAt = voiceStartRef.current;
      const durationSeconds = startedAt
        ? Math.max(0, (endedAt - startedAt) / 1000)
        : 0;

      const transcript =
        voiceTranscriptRef.current || answer.trim();

      const wordCount = transcript
        .split(/\s+/)
        .filter(Boolean).length;

      const fillerWords = (
        transcript.match(/\b(um|uh|like|actually|basically|you know|sort of|kind of)\b/gi) || []
      ).length;

      const speakingRate = durationSeconds > 0
        ? Math.round((wordCount / durationSeconds) * 60)
        : 0;

      const clarityScore = Math.max(
        0,
        Math.min(100, 100 - fillerWords * 5 - voicePauseCountRef.current * 3)
      );

      const communicationScore = Math.max(
        0,
        Math.min(100, 60 + Math.min(wordCount, 40) - fillerWords * 3)
      );

      const confidenceScore = Math.max(
        0,
        Math.min(100, 70 - Math.max(0, speakingRate - 170) * 0.15 - Math.max(0, 90 - speakingRate) * 0.15 - fillerWords * 3 - voicePauseCountRef.current * 2)
      );

      setVoiceMetrics({
        speakingDuration: Number(durationSeconds.toFixed(1)),
        wordCount,
        speakingRate,
        fillerWords,
        pauseCount: voicePauseCountRef.current,
        clarityScore: Math.round(clarityScore),
        communicationScore: Math.round(communicationScore),
        confidenceScore: Math.round(confidenceScore),
      });

      setListening(false);
      recognitionRef.current = null;

      socketRef.current?.emit(
        "interview-status",
        {
          interviewId: id,
          status: "voice-ended",
        }
      );

      if (settings.autoSubmit) {
        if (autoSubmitTimerRef.current) {
          clearTimeout(
            autoSubmitTimerRef.current
          );
        }

        autoSubmitTimerRef.current =
          setTimeout(() => {
            handleSubmit();
          }, 700);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(error);

      setListening(false);
      recognitionRef.current = null;

      setError(
        "Could not start voice input."
      );

      playSound("error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Preparing your interview...
          </p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  if (!interview.questions?.length) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            No questions available
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            We could not generate questions for this interview.
          </p>

          <button
            onClick={() =>
              navigate("/interview/setup")
            }
            className="mt-5 rounded-xl bg-slate-950 dark:bg-white px-5 py-3 text-sm font-semibold text-white dark:text-black hover:bg-black dark:hover:bg-slate-200"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion =
    interview.questions[questionIndex];

  const totalQuestions =
    interview.questions.length;

  const progress =
    ((questionIndex + 1) /
      totalQuestions) *
    100;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-[#08090d] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FiZap />
              InterviewAI
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {interview.role} · {interview.mode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                socketConnected
                  ? "border-slate-200 dark:border-white/10 bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-white/10 dark:bg-slate-1000/10 dark:text-slate-300"
                  : "border-amber-200 bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-amber-500/20 dark:bg-slate-1000/10 dark:text-slate-300"
              }`}
            >
              {socketConnected ? (
                <FiWifi />
              ) : (
                <FiWifiOff />
              )}

              {socketConnected
                ? "Connected"
                : "Reconnecting"}
            </div>

            <button
              onClick={handleEndInterview}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-slate-1000/10"
            >
              <FiX />
              End Interview
            </button>
          </div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-slate-950 dark:bg-white transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-1000/10 dark:text-slate-300">
                <FiMessageSquare />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Question
                </p>

                <p className="font-semibold">
                  {questionIndex + 1} /{" "}
                  {totalQuestions}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-1000/10 dark:text-slate-300">
                <FiClock />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Time Remaining
                </p>

                <p
                  className={`font-semibold ${
                    timeLeft <= 60
                      ? "text-slate-700 dark:text-white"
                      : ""
                  }`}
                >
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-1000/10 dark:text-slate-300">
                <FiZap />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Difficulty
                </p>

                <p className="font-semibold">
                  {interview.difficulty}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
            <div className="mb-8 flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 dark:bg-white text-lg font-bold text-white dark:text-black shadow-lg shadow-black/20 ${
                  speaking
                    ? "animate-pulse"
                    : ""
                }`}
              >
                AI
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">
                    AI Interviewer
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 dark:bg-slate-1000/10 dark:text-slate-300">
                    LIVE
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {speaking
                    ? "AI is speaking..."
                    : listening
                    ? "Listening to your answer..."
                    : remoteStatus ||
                      currentQuestion?.type ||
                      "Interview Question"}
                </p>
              </div>

              <button
                type="button"
                onClick={speakQuestion}
                disabled={speaking}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-slate-300"
              >
                <FiVolume2 />
                {speaking
                  ? "Speaking..."
                  : "Hear Question"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/70 p-6 dark:border-white/10 dark:bg-slate-1000/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Question {questionIndex + 1}
              </p>

              <h1 className="mt-3 text-xl font-semibold leading-8 sm:text-2xl">
                {currentQuestion?.question}
              </h1>
            </div>

            {showEvaluation && evaluation && (
              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 p-5 dark:border-white/10 dark:bg-slate-1000/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white dark:text-slate-300">
                      AI Evaluation
                    </p>

                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300/80 dark:text-slate-400">
                      {evaluation.feedback}
                    </p>
                  </div>

                  <div className="shrink-0 text-3xl font-bold text-slate-700 dark:text-slate-300">
                    {evaluation.overallScore}%
                  </div>
                </div>

                {evaluation.voiceMetrics && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Speaking Rate", `${evaluation.voiceMetrics.speakingRate || 0} WPM`],
                      ["Filler Words", evaluation.voiceMetrics.fillerWords || 0],
                      ["Pauses", evaluation.voiceMetrics.pauseCount || 0],
                      ["Clarity", `${evaluation.voiceMetrics.clarityScore ?? 0}%`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {evaluation.strengths?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Strengths
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {evaluation.strengths.map(
                        (item, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <label className="mb-3 block text-sm font-semibold">
                Your Answer
              </label>

              <div className="relative">
                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  placeholder={
                    listening
                      ? "Listening..."
                      : "Type your answer here..."
                  }
                  rows={9}
                  disabled={submitting}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-5 pr-16 text-sm leading-7 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-slate-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={
                    !settings.voiceInput ||
                    submitting
                  }
                  className={`absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition ${
                    listening
                      ? "animate-pulse border-red-300 bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-white/10 dark:bg-slate-1000/10 dark:text-slate-300"
                      : settings.voiceInput
                      ? "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-700 dark:text-slate-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:text-slate-300"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-700"
                  }`}
                >
                  <FiMic />
                </button>
              </div>

              {listening && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-1000" />
                  Listening to your answer...
                </div>
              )}

              {!settings.voiceInput && (
                <p className="mt-2 text-xs text-slate-400">
                  Voice input is disabled in Settings.
                </p>
              )}

              {settings.autoSubmit && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                  Auto Submit is enabled.
                </p>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 dark:border-white/10 dark:bg-slate-1000/10 dark:text-slate-300">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={
                  !answer.trim() || submitting
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-white px-6 py-3.5 text-sm font-semibold text-white dark:text-black transition hover:bg-black dark:hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  "AI Evaluating..."
                ) : (
                  <>
                    Submit Answer
                    <FiSend />
                  </>
                )}
              </button>
            </div>
          </main>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div>
              <p className="text-sm font-semibold">
                Interview Progress
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-slate-950 dark:bg-white transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {questionIndex + 1} of{" "}
                {totalQuestions} questions
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <p className="text-sm font-medium">
                  Be specific
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Use real examples from your projects and experience.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">
                  Structure your answer
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Keep your answers clear and logically organized.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">
                  Stay confident
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Explain your thinking instead of giving one-word answers.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-100 p-4 dark:bg-slate-1000/10">
              <p className="text-xs font-semibold text-indigo-700 dark:text-slate-300">
                AI Interviewer
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-300/80 dark:text-indigo-300/70">
                Your responses are evaluated for relevance,
                communication, confidence and answer quality.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Interview Settings
              </p>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Voice Input</span>
                  <span
                    className={
                      settings.voiceInput
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400"
                    }
                  >
                    {settings.voiceInput
                      ? "ON"
                      : "OFF"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Auto Speak</span>
                  <span
                    className={
                      settings.autoSpeak
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400"
                    }
                  >
                    {settings.autoSpeak
                      ? "ON"
                      : "OFF"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Auto Submit</span>
                  <span
                    className={
                      settings.autoSubmit
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400"
                    }
                  >
                    {settings.autoSubmit
                      ? "ON"
                      : "OFF"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Sound Effects</span>
                  <span
                    className={
                      settings.soundEffects
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400"
                    }
                  >
                    {settings.soundEffects
                      ? "ON"
                      : "OFF"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">
                Real-time connection
              </span>

              <span
                className={
                  socketConnected
                    ? "font-semibold text-slate-600 dark:text-slate-300"
                    : "font-semibold text-slate-500"
                }
              >
                {socketConnected
                  ? "Connected"
                  : "Offline"}
              </span>
            </div>

            <button
              onClick={handleEndInterview}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 dark:text-slate-300 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
            >
              End Interview
              <FiChevronRight />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;