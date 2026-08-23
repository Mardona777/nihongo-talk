import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Conversation.css";

const API_URL = "https://nihongo-talk-production.up.railway.app";
const TOTAL_QUESTIONS = 20;

const scenarioData = {
  introduce: {
    emoji: "👋",
    label: "SELF INTRODUCTION",
    title: "Self Introduction",
    description:
      "Practice introducing yourself naturally in Japanese.",
    level: "N5–N4",
  },

  shopping: {
    emoji: "🛍️",
    label: "SHOPPING",
    title: "Shopping Conversation",
    description:
      "Practice asking about prices, sizes, and products in Japanese.",
    level: "N4",
  },

  restaurant: {
    emoji: "🍽️",
    label: "RESTAURANT",
    title: "Restaurant Conversation",
    description:
      "Practice a natural restaurant conversation in Japanese.",
    level: "N4",
  },

  station: {
    emoji: "🚉",
    label: "TRAIN STATION",
    title: "Train Station Conversation",
    description:
      "Practice asking for directions and train information.",
    level: "N4–N3",
  },

  interview: {
    emoji: "💼",
    label: "JOB INTERVIEW",
    title: "Job Interview",
    description:
      "Practice common Japanese job interview questions.",
    level: "N3–N2",
  },
};

function Conversation() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  const scenario = scenarioData[scenarioId];

  // ========================================
  // STATES
  // ========================================

  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState([]);

  const [isLoadingQuestions, setIsLoadingQuestions] =
    useState(true);

  const [isListening, setIsListening] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isChecking, setIsChecking] =
    useState(false);

  // ========================================
  // CURRENT QUESTION
  // ========================================

  const currentQuestion = questions[currentStep];

  // ========================================
  // LOAD 20 AI QUESTIONS
  // ========================================

  useEffect(() => {
    if (!scenario) {
      return;
    }

    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);

        setQuestions([]);
        setCurrentStep(0);
        setScores([]);
        setAnswer("");
        setScore(null);
        setFeedback("");

        console.log("========================================");
        console.log("Loading 20 AI questions...");
        console.log("Scenario:", scenarioId);
        console.log("Level:", scenario.level);
        console.log("API URL:", API_URL);
        console.log("========================================");

        const response = await fetch(
          `${API_URL}/api/ai/questions`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              scenario: scenarioId,
              level: scenario.level,
              count: TOTAL_QUESTIONS,
            }),
          }
        );

        const responseText = await response.text();

        console.log(
          "AI questions response:",
          responseText
        );

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (error) {
          throw new Error(
            "Backend JSON formatida javob bermadi."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "AI questions could not be loaded."
          );
        }

        if (!data.success) {
          throw new Error(
            data.message ||
              "AI questions could not be loaded."
          );
        }

        // ========================================
        // GET QUESTIONS
        // ========================================

        const generatedQuestions =
          data.questions || [];

        console.log(
          "Questions received from backend:",
          generatedQuestions.length
        );

        // ========================================
        // NORMALIZE QUESTIONS
        // ========================================

        const normalizedQuestions =
          generatedQuestions
            .map((question) => {
              if (typeof question === "string") {
                return {
                  japanese: question.trim(),
                  translation: "",
                  expected: "",
                };
              }

              return {
                japanese: (
                  question.japanese ||
                  question.question ||
                  ""
                ).trim(),

                translation:
                  question.translation || "",

                expected:
                  question.expected || "",
              };
            })
            .filter(
              (question) =>
                question.japanese
            );

        // ========================================
        // REMOVE DUPLICATES
        // ========================================

        const uniqueQuestions = [];
        const seen = new Set();

        for (const question of normalizedQuestions) {
          const normalized =
            question.japanese
              .trim()
              .replace(/\s+/g, "")
              .toLowerCase();

          if (
            normalized &&
            !seen.has(normalized)
          ) {
            seen.add(normalized);
            uniqueQuestions.push(question);
          }
        }

        console.log(
          "Normalized questions:",
          normalizedQuestions.length
        );

        console.log(
          "Unique questions:",
          uniqueQuestions.length
        );

        // ========================================
        // CHECK 20 QUESTIONS
        // ========================================

        if (
          uniqueQuestions.length <
          TOTAL_QUESTIONS
        ) {
          throw new Error(
            `AI faqat ${uniqueQuestions.length} ta noyob savol qaytardi. 20 ta savol kerak. Iltimos, yana urinib ko'ring.`
          );
        }

        // ========================================
        // EXACTLY 20 QUESTIONS
        // ========================================

        const finalQuestions =
          uniqueQuestions.slice(
            0,
            TOTAL_QUESTIONS
          );

        console.log("========================================");
        console.log("FINAL 20 QUESTIONS:");
        console.log(finalQuestions);
        console.log("========================================");

        setQuestions(finalQuestions);
      } catch (error) {
        console.error(
          "AI QUESTIONS ERROR:",
          error
        );

        alert(
          `AI savollarni yuklashda xatolik yuz berdi.\n\n${error.message}`
        );
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [scenarioId]);

  // ========================================
  // TEXT TO SPEECH
  // ========================================

  const speakJapanese = () => {
    if (!currentQuestion) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert(
        "Your browser does not support Japanese voice playback."
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        currentQuestion.japanese
      );

    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ========================================
  // SPEECH RECOGNITION
  // ========================================

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or type your answer manually."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const recognizedText =
        event.results[0][0].transcript;

      console.log(
        "Recognized:",
        recognizedText
      );

      setAnswer(recognizedText);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      alert(
        "Could not recognize your voice. Please try again."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Could not start recognition:",
        error
      );

      setIsListening(false);
    }
  };

  // ========================================
  // CHECK ANSWER WITH AI
  // ========================================

  const evaluateAnswer = async () => {
    if (!answer.trim()) {
      alert(
        "Please enter or speak your answer first."
      );

      return;
    }

    if (!currentQuestion) {
      return;
    }

    if (isChecking) {
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/evaluate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            scenario: scenarioId,

            question:
              currentQuestion.japanese,

            expected:
              currentQuestion.expected ||
              "",

            answer: answer,

            level: scenario.level,
          }),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "AI evaluation response:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch (error) {
        throw new Error(
          "AI evaluation JSON formatida javob bermadi."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not evaluate answer."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Could not evaluate answer."
        );
      }

      // ========================================
      // SCORE
      // ========================================

      const receivedScore =
        Number(data.score);

      const finalScore =
        Number.isFinite(receivedScore)
          ? Math.max(
              0,
              Math.min(
                100,
                receivedScore
              )
            )
          : 50;

      setScore(finalScore);

      setFeedback(
        data.feedback ||
          "Good job! Keep practicing."
      );

      console.log(
        "Question score:",
        finalScore
      );
    } catch (error) {
      console.error(
        "AI EVALUATION ERROR:",
        error
      );

      // ========================================
      // FALLBACK SCORE
      // ========================================

      const fallbackScore =
        answer.trim().length >= 5
          ? 80
          : 50;

      setScore(fallbackScore);

      setFeedback(
        "Your answer has been recorded. Keep practicing!"
      );
    } finally {
      setIsChecking(false);
    }
  };

  // ========================================
  // NEXT QUESTION
  // ========================================

  const nextStep = () => {
    if (score === null) {
      return;
    }

    const updatedScores = [
      ...scores,
      score,
    ];

    console.log(
      "Current scores:",
      updatedScores
    );

    // ========================================
    // MORE QUESTIONS
    // ========================================

    if (
      currentStep <
      questions.length - 1
    ) {
      setScores(updatedScores);

      setCurrentStep(
        (previous) =>
          previous + 1
      );

      setAnswer("");
      setScore(null);
      setFeedback("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    // ========================================
    // LAST QUESTION
    // ========================================

    finishPractice(
      updatedScores
    );
  };

  // ========================================
  // TRY AGAIN
  // ========================================

  const tryAgain = () => {
    setAnswer("");
    setScore(null);
    setFeedback("");
  };

  // ========================================
  // GET CURRENT USER
  // ========================================

  const getCurrentUser = () => {
    const possibleKeys = [
      "user",
      "currentUser",
      "loggedInUser",
      "loginUser",
    ];

    for (const key of possibleKeys) {
      const storedUser =
        localStorage.getItem(key);

      if (!storedUser) {
        continue;
      }

      try {
        const parsedUser =
          JSON.parse(storedUser);

        if (parsedUser) {
          return parsedUser;
        }
      } catch (error) {
        console.error(
          `Could not parse ${key}:`,
          error
        );
      }
    }

    return null;
  };

  // ========================================
  // FINISH PRACTICE
  // ========================================

  const finishPractice = async (
    finalScores
  ) => {
    if (
      !finalScores ||
      finalScores.length === 0
    ) {
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const user =
        getCurrentUser();

      console.log(
        "Current user:",
        user
      );

      if (!user) {
        throw new Error(
          "User information not found. Please login again."
        );
      }

      const userId =
        user.id ||
        user.user_id ||
        user.userId;

      if (!userId) {
        throw new Error(
          "User ID not found. Please login again."
        );
      }

      // ========================================
      // CALCULATE AVERAGE
      // ========================================

      const totalScore =
        finalScores.reduce(
          (total, item) =>
            total + Number(item),
          0
        );

      const averageScore =
        Math.round(
          totalScore /
            finalScores.length
        );

      console.log(
        "========================================"
      );

      console.log(
        "PRACTICE FINISHED"
      );

      console.log(
        "Number of questions:",
        finalScores.length
      );

      console.log(
        "All scores:",
        finalScores
      );

      console.log(
        "Average score:",
        averageScore
      );

      console.log(
        "========================================"
      );

      // ========================================
      // SAVE DATABASE
      // ========================================

      const practiceData = {
        user_id: Number(userId),

        scenario: scenarioId,

        score: averageScore,

        total_steps:
          finalScores.length,
      };

      console.log(
        "Sending practice data:",
        practiceData
      );

      const response =
        await fetch(
          `${API_URL}/api/practice`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              practiceData
            ),
          }
        );

      const responseText =
        await response.text();

      console.log(
        "Save response:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch (error) {
        throw new Error(
          "Backend JSON formatida javob bermadi."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Practice could not be saved."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Practice could not be saved."
        );
      }

      // ========================================
      // SUCCESS
      // ========================================

      alert(
        `Practice completed! 🎉\n\n20 questions completed!\n\nYour score: ${averageScore}/100`
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "FINISH PRACTICE ERROR:",
        error
      );

      alert(
        `Practice could not be saved.\n\n${error.message}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================
  // INVALID SCENARIO
  // ========================================

  if (!scenario) {
    return (
      <div className="conversation-page">
        <header className="conversation-header">
          <Link
            to="/scenarios"
            className="dashboard-logo"
          >
            <span className="logo-mark">
              日
            </span>

            <span>
              Nihongo Talk Trainer
            </span>
          </Link>
        </header>

        <main className="conversation-main">
          <div className="conversation-practice-card">
            <h1>
              Scenario not found
            </h1>

            <p>
              The scenario you are
              looking for does not
              exist.
            </p>

            <Link
              to="/scenarios"
              className="back-link"
            >
              ← Back to scenarios
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // LOADING
  // ========================================

  if (isLoadingQuestions) {
    return (
      <div className="conversation-page">
        <header className="conversation-header">
          <Link
            to="/scenarios"
            className="dashboard-logo"
          >
            <span className="logo-mark">
              日
            </span>

            <span>
              Nihongo Talk Trainer
            </span>
          </Link>
        </header>

        <main className="conversation-main">
          <div className="conversation-practice-card loading-card">
            <div className="loading-icon">
              🤖
            </div>

            <h2>
              Creating your questions...
            </h2>

            <p>
              AI is preparing{" "}
              {TOTAL_QUESTIONS} random
              Japanese questions
              for you.
            </p>

            <p>
              Please wait a moment...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // NO QUESTIONS
  // ========================================

  if (
    !isLoadingQuestions &&
    questions.length === 0
  ) {
    return (
      <div className="conversation-page">
        <header className="conversation-header">
          <Link
            to="/scenarios"
            className="dashboard-logo"
          >
            <span className="logo-mark">
              日
            </span>

            <span>
              Nihongo Talk Trainer
            </span>
          </Link>
        </header>

        <main className="conversation-main">
          <div className="conversation-practice-card">
            <h2>
              Could not load questions 😔
            </h2>

            <p>
              Please go back and try
              again.
            </p>

            <Link
              to="/scenarios"
              className="back-link"
            >
              ← Back to scenarios
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // SAFETY CHECK
  // ========================================

  if (!currentQuestion) {
    return (
      <div className="conversation-page">
        <main className="conversation-main">
          <div className="conversation-practice-card">
            <h2>
              Loading question...
            </h2>
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="conversation-page">

      {/* HEADER */}

      <header className="conversation-header">

        <Link
          to="/scenarios"
          className="dashboard-logo"
        >
          <span className="logo-mark">
            日
          </span>

          <span>
            Nihongo Talk Trainer
          </span>
        </Link>

        <div className="conversation-progress">
          Question{" "}
          {currentStep + 1} /{" "}
          {questions.length}
        </div>

      </header>

      {/* MAIN */}

      <main className="conversation-main">

        {/* BACK */}

        <Link
          to="/scenarios"
          className="back-link"
        >
          ← Back to scenarios
        </Link>

        {/* TITLE */}

        <div className="conversation-title-row">

          <div>

            <span className="dashboard-label">
              {scenario.label}
            </span>

            <h1>
              {scenario.emoji}{" "}
              {scenario.title}
            </h1>

            <p>
              {scenario.description}
            </p>

          </div>

          <span className="conversation-level">
            {scenario.level}
          </span>

        </div>

        {/* PRACTICE CARD */}

        <section className="conversation-practice-card">

          {/* PROGRESS */}

          <div className="step-indicator">

            <div className="step-text">

              <span>
                AI Conversation
              </span>

              <strong>
                {currentStep + 1} /{" "}
                {questions.length}
              </strong>

            </div>

            <div className="progress-track">

              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentStep + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* AI MESSAGE */}

          <div className="conversation-message">

            <div className="conversation-avatar">
              {scenarioId ===
              "interview"
                ? "👨🏻‍💼"
                : "👩🏻"}
            </div>

            <div className="message-content">

              <span className="speaker-name">
                AI Teacher
              </span>

              <div className="japanese-bubble">

                <p>
                  {currentQuestion.japanese}
                </p>

                <button
                  type="button"
                  className="listen-button"
                  onClick={
                    speakJapanese
                  }
                >
                  🔊 Listen
                </button>

              </div>

              {currentQuestion.translation && (
                <p className="translation">
                  {
                    currentQuestion.translation
                  }
                </p>
              )}

            </div>

          </div>

          {/* ANSWER */}

          <div className="answer-section">

            <div className="answer-header">

              <div>

                <span className="speaker-name">
                  Your response
                </span>

                <p>
                  Speak Japanese or
                  type your answer.
                </p>

              </div>

              <span className="microphone-label">
                🎙️ Voice practice
              </span>

            </div>

            <textarea
              value={answer}
              onChange={(event) =>
                setAnswer(
                  event.target.value
                )
              }
              placeholder="日本語で答えてください..."
              rows="3"
              disabled={
                score !== null ||
                isChecking
              }
            />

            {/* BUTTONS */}

            <div className="answer-actions">

              <button
                type="button"
                className={`microphone-button ${
                  isListening
                    ? "listening"
                    : ""
                }`}
                onClick={
                  startListening
                }
                disabled={
                  isListening ||
                  score !== null ||
                  isChecking
                }
              >
                {isListening
                  ? "🔴 Listening..."
                  : "🎙️ Speak"}
              </button>

              <button
                type="button"
                className="evaluate-button"
                onClick={
                  evaluateAnswer
                }
                disabled={
                  !answer.trim() ||
                  score !== null ||
                  isChecking ||
                  isSaving
                }
              >
                {isChecking
                  ? "Checking..."
                  : "Check Answer"}
              </button>

            </div>

          </div>

          {/* EVALUATION */}

          {score !== null && (

            <div className="evaluation-card">

              <div className="score-circle">

                <strong>
                  {score}
                </strong>

                <span>
                  /100
                </span>

              </div>

              <div className="evaluation-content">

                <span className="evaluation-label">
                  SPEECH PRACTICE SCORE
                </span>

                <h3>
                  {score >= 90
                    ? "Excellent! 🎉"
                    : score >= 70
                    ? "Good job! 👍"
                    : "Keep practicing! 💪"}
                </h3>

                <p>
                  {feedback}
                </p>

                <div className="answer-comparison">

                  <div>

                    <span>
                      Expected
                    </span>

                    <strong>
                      {currentQuestion.expected ||
                        "Natural Japanese response"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Your answer
                    </span>

                    <strong>
                      {answer}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          )}

          {/* CONTROLS */}

          <div className="conversation-controls">

            <button
              type="button"
              className="try-again-button"
              onClick={
                tryAgain
              }
              disabled={
                isSaving ||
                isChecking
              }
            >
              ↻ Try Again
            </button>

            {currentStep <
            questions.length - 1 ? (

              <button
                type="button"
                className="next-button"
                onClick={
                  nextStep
                }
                disabled={
                  score === null ||
                  isSaving ||
                  isChecking
                }
              >
                Next →
              </button>

            ) : (

              <button
                type="button"
                className="next-button"
                onClick={() =>
                  finishPractice([
                    ...scores,
                    score,
                  ])
                }
                disabled={
                  score === null ||
                  isSaving ||
                  isChecking
                }
              >
                {isSaving
                  ? "Saving..."
                  : "Finish ✓"}
              </button>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Conversation;
