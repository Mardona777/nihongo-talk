import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./scenarios.css";

const scenarios = [
  {
    id: "introduce",
    emoji: "👋",
    japanese: "自己紹介",
    title: "Self Introduction",
    description:
      "Practice introducing yourself naturally in Japanese.",
    level: "N5–N4",
    category: "Daily Conversation",
    duration: "5 min",
  },
  {
    id: "shopping",
    emoji: "🛍️",
    japanese: "買い物",
    title: "Shopping",
    description:
      "Practice asking about prices, sizes, and products.",
    level: "N4",
    category: "Daily Life",
    duration: "5 min",
  },
  {
    id: "restaurant",
    emoji: "🍽️",
    japanese: "レストラン",
    title: "Restaurant",
    description:
      "Practice ordering food and communicating with restaurant staff.",
    level: "N4",
    category: "Daily Life",
    duration: "5 min",
  },
  {
    id: "station",
    emoji: "🚉",
    japanese: "駅",
    title: "Train Station",
    description:
      "Practice asking for directions and train information.",
    level: "N4–N3",
    category: "Travel",
    duration: "6 min",
  },
  {
    id: "interview",
    emoji: "💼",
    japanese: "面接",
    title: "Job Interview",
    description:
      "Practice common Japanese job interview questions.",
    level: "N3–N2",
    category: "Career",
    duration: "8 min",
  },
];

function Scenarios() {
  const navigate = useNavigate();

  // ========================================
  // AUTHENTICATION
  // ========================================

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authChecking, setAuthChecking] =
    useState(true);

  // ========================================
  // CHECK LOGIN
  // ========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // User login qilmagan
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      // User ma'lumoti noto'g'ri
      if (!parsedUser || !parsedUser.id) {
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // User login qilgan
      setIsAuthenticated(true);
    } catch (error) {
      console.error(
        "Could not read logged-in user:",
        error
      );

      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });
    } finally {
      setAuthChecking(false);
    }
  }, [navigate]);

  // ========================================
  // CHECKING LOGIN
  // ========================================

  if (authChecking) {
    return (
      <div className="scenarios-page">
        <main className="scenarios-main">
          <div className="scenarios-help">
            <div className="help-icon">
              🔐
            </div>

            <div>
              <h3>
                Checking your account...
              </h3>

              <p>
                Please wait a moment.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // NOT LOGGED IN
  // ========================================

  if (!isAuthenticated) {
    return null;
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="scenarios-page">

      {/* ================================
          HEADER
      ================================= */}

      <header className="scenarios-header">

        <Link
          to="/dashboard"
          className="scenarios-logo"
        >
          <span className="scenarios-logo-mark">
            日
          </span>

          <span>
            Nihongo Talk Trainer
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="back-dashboard"
        >
          ← Dashboard
        </Link>

      </header>

      {/* ================================
          MAIN
      ================================= */}

      <main className="scenarios-main">

        {/* ================================
            INTRO
        ================================= */}

        <section className="scenarios-intro">

          <div>

            <span className="scenarios-label">
              CONVERSATION PRACTICE
            </span>

            <h1>
              Choose a scenario
            </h1>

            <p>
              Practice Japanese conversation
              through realistic everyday
              situations.
            </p>

          </div>

        </section>

        {/* ================================
            SCENARIO GRID
        ================================= */}

        <section className="scenarios-grid">

          {scenarios.map((scenario) => (

            <article
              className="scenario-card"
              key={scenario.id}
            >

              {/* CARD HEADER */}

              <div className="scenario-card-header">

                <div className="scenario-icon">
                  {scenario.emoji}
                </div>

                <span className="scenario-level">
                  {scenario.level}
                </span>

              </div>

              {/* CARD CONTENT */}

              <div className="scenario-card-content">

                <span className="scenario-japanese">
                  {scenario.japanese}
                </span>

                <h2>
                  {scenario.title}
                </h2>

                <p>
                  {scenario.description}
                </p>

                <div className="scenario-info">

                  <span>
                    📂 {scenario.category}
                  </span>

                  <span>
                    ⏱️ {scenario.duration}
                  </span>

                </div>

              </div>

              {/* START BUTTON */}

              <Link
                to={`/scenarios/${scenario.id}`}
                className="scenario-start-button"
              >
                Start Practice
                <span>→</span>
              </Link>

            </article>

          ))}

        </section>

        {/* ================================
            BOTTOM INFO
        ================================= */}

        <section className="scenarios-help">

          <div className="help-icon">
            🎙️
          </div>

          <div>

            <h3>
              Practice speaking with confidence
            </h3>

            <p>
              Choose a situation and start a
              Japanese conversation. Listen,
              speak, and improve step by step.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Scenarios;