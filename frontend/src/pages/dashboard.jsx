import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    practiceSessions: 0,
    averageScore: null,
    completed: 0,
    practiceStreak: 0,
  });

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  // ========================================
  // SCENARIO INFORMATION
  // ========================================

  const scenarioInfo = {
    introduce: {
      emoji: "👋",
      japanese: "自己紹介",
      english: "Self Introduction",
    },

    shopping: {
      emoji: "🛍️",
      japanese: "買い物",
      english: "Shopping",
    },

    restaurant: {
      emoji: "🍽️",
      japanese: "レストラン",
      english: "Restaurant",
    },

    station: {
      emoji: "🚉",
      japanese: "駅",
      english: "Train Station",
    },

    interview: {
      emoji: "💼",
      japanese: "面接",
      english: "Job Interview",
    },
  };

  // ========================================
  // CALCULATE PRACTICE STREAK
  // ========================================

  const calculateStreak = (practiceHistory) => {
    if (
      !Array.isArray(practiceHistory) ||
      practiceHistory.length === 0
    ) {
      return 0;
    }

    // Get unique practice dates
    const dates = practiceHistory
      .map((item) => {
        const dateValue =
          item.completed_at ||
          item.created_at;

        if (!dateValue) {
          return null;
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
          return null;
        }

        return date.toISOString().split("T")[0];
      })
      .filter(Boolean);

    const uniqueDates = [...new Set(dates)];

    if (uniqueDates.length === 0) {
      return 0;
    }

    // Sort newest -> oldest
    uniqueDates.sort(
      (a, b) =>
        new Date(b) - new Date(a)
    );

    const today = new Date();

    const todayString =
      today.toISOString().split("T")[0];

    const yesterday = new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const yesterdayString =
      yesterday.toISOString().split("T")[0];

    // Streak must start from today or yesterday
    if (
      uniqueDates[0] !== todayString &&
      uniqueDates[0] !== yesterdayString
    ) {
      return 0;
    }

    let streak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const previousDate =
        new Date(uniqueDates[i - 1]);

      const currentDate =
        new Date(uniqueDates[i]);

      const difference =
        Math.round(
          (previousDate - currentDate) /
            (1000 * 60 * 60 * 24)
        );

      if (difference === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // ========================================
  // LOAD USER + STATISTICS + HISTORY
  // ========================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(savedUser);

      setUser(parsedUser);

      fetch(
        `http://127.0.0.1:5001/api/practice/stats/${parsedUser.id}`
      )
        .then(async (response) => {
          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Could not load statistics."
            );
          }

          return data;
        })
        .then((data) => {
          console.log(
            "Dashboard API data:",
            data
          );

          if (!data.success) {
            return;
          }

          // ========================================
          // HISTORY
          // ========================================

          let practiceHistory = [];

          if (
            Array.isArray(data.history)
          ) {
            practiceHistory =
              data.history;

            setHistory(
              data.history
            );
          }

          // ========================================
          // CALCULATE STREAK
          // ========================================

          const calculatedStreak =
            calculateStreak(
              practiceHistory
            );

          // ========================================
          // STATISTICS
          // ========================================

          if (data.stats) {
            setStats({
              practiceSessions:
                Number(
                  data.stats.practiceSessions
                ) || 0,

              averageScore:
                data.stats.averageScore !==
                null
                  ? Number(
                      data.stats.averageScore
                    )
                  : null,

              completed:
                Number(
                  data.stats.completed
                ) || 0,

              practiceStreak:
                Number(
                  data.stats.practiceStreak
                ) ||
                Number(
                  data.stats.streak
                ) ||
                calculatedStreak,
            });
          } else {
            setStats((previous) => ({
              ...previous,
              practiceStreak:
                calculatedStreak,
            }));
          }
        })
        .catch((error) => {
          console.error(
            "Statistics loading error:",
            error
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error(
        "Could not read user data:",
        error
      );

      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ========================================
  // LOADING
  // ========================================

  if (!user || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffaf8",
          color: "#1b1720",
          fontSize: "16px",
        }}
      >
        Loading...
      </div>
    );
  }

  // ========================================
  // USER DATA
  // ========================================

  const userName =
    user.name || "Student";

  const userLevel =
    user.level || "N5";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date =
      new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // ========================================
  // GET SCENARIO INFO
  // ========================================

  const getScenarioInfo = (
    scenario
  ) => {
    return (
      scenarioInfo[scenario] || {
        emoji: "💬",
        japanese: scenario,
        english: "Practice",
      }
    );
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="dashboard-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="dashboard-header">

        <Link
          to="/"
          className="dashboard-logo"
        >
          <span className="logo-mark">
            日
          </span>

          <span>
            Nihongo Talk Trainer
          </span>
        </Link>

        <div className="dashboard-user">

          <span className="user-avatar">
            {avatarLetter}
          </span>

          <span>
            {userName}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginLeft: "12px",
              padding: "7px 12px",
              border:
                "1px solid #ead7da",
              borderRadius: "7px",
              background: "#ffffff",
              color: "#a53d55",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="dashboard-main">

        {/* ===================================
            WELCOME
        ==================================== */}

        <section className="welcome-section">

          <div>

            <span className="dashboard-label">
              MY LEARNING
            </span>

            <h1>
              こんにちは, {userName}! 👋
            </h1>

            <p>
              Ready to practice your
              Japanese conversation today?
            </p>

          </div>

          <div className="level-badge">

            <span>
              Japanese Level
            </span>

            <strong>
              {userLevel}
            </strong>

          </div>

        </section>

        {/* ===================================
            STATISTICS
        ==================================== */}

        <section className="stats-grid">

          {/* Practice Sessions */}

          <div className="stat-card">

            <span className="stat-icon">
              🎯
            </span>

            <div>

              <span>
                Practice Sessions
              </span>

              <strong>
                {stats.practiceSessions}
              </strong>

            </div>

          </div>

          {/* Average Score */}

          <div className="stat-card">

            <span className="stat-icon">
              📊
            </span>

            <div>

              <span>
                Average Score
              </span>

              <strong>
                {stats.averageScore !== null
                  ? stats.averageScore
                  : "--"}
              </strong>

            </div>

          </div>

          {/* Practice Streak */}

          <div className="stat-card">

            <span className="stat-icon">
              🔥
            </span>

            <div>

              <span>
                Practice Streak
              </span>

              <strong>
                {stats.practiceStreak}{" "}
                {stats.practiceStreak === 1
                  ? "day"
                  : "days"}
              </strong>

            </div>

          </div>

          {/* Completed */}

          <div className="stat-card">

            <span className="stat-icon">
              🏆
            </span>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {stats.completed}
              </strong>

            </div>

          </div>

        </section>

        {/* ===================================
            PRACTICE
        ==================================== */}

        <section className="practice-section">

          <div className="section-title">

            <div>

              <span className="dashboard-label">
                PRACTICE
              </span>

              <h2>
                Choose a scenario
              </h2>

              <p>
                Practice Japanese
                conversation in realistic
                situations.
              </p>

            </div>

            <Link
              to="/scenarios"
              className="view-all-btn"
            >
              View all →
            </Link>

          </div>

          <div className="dashboard-scenarios">

            {/* Self Introduction */}

            <Link
              to="/scenarios/introduce"
              className="dashboard-scenario-card"
            >
              <span className="scenario-emoji">
                👋
              </span>

              <div>

                <span className="scenario-level">
                  N5–N4
                </span>

                <h3>
                  自己紹介
                </h3>

                <p>
                  Self Introduction
                </p>

              </div>

              <span className="scenario-arrow">
                →
              </span>

            </Link>

            {/* Shopping */}

            <Link
              to="/scenarios/shopping"
              className="dashboard-scenario-card"
            >
              <span className="scenario-emoji">
                🛍️
              </span>

              <div>

                <span className="scenario-level">
                  N4
                </span>

                <h3>
                  買い物
                </h3>

                <p>
                  Shopping
                </p>

              </div>

              <span className="scenario-arrow">
                →
              </span>

            </Link>

            {/* Restaurant */}

            <Link
              to="/scenarios/restaurant"
              className="dashboard-scenario-card"
            >
              <span className="scenario-emoji">
                🍽️
              </span>

              <div>

                <span className="scenario-level">
                  N4
                </span>

                <h3>
                  レストラン
                </h3>

                <p>
                  Restaurant
                </p>

              </div>

              <span className="scenario-arrow">
                →
              </span>

            </Link>

            {/* Job Interview */}

            <Link
              to="/scenarios/interview"
              className="dashboard-scenario-card"
            >
              <span className="scenario-emoji">
                💼
              </span>

              <div>

                <span className="scenario-level">
                  N3–N2
                </span>

                <h3>
                  面接
                </h3>

                <p>
                  Job Interview
                </p>

              </div>

              <span className="scenario-arrow">
                →
              </span>

            </Link>

          </div>

        </section>

        {/* ===================================
            RECENT ACTIVITY
        ==================================== */}

        <section className="recent-section">

          <div className="section-title">

            <div>

              <span className="dashboard-label">
                HISTORY
              </span>

              <h2>
                Recent practice
              </h2>

              <p>
                Your latest Japanese
                practice sessions.
              </p>

            </div>

          </div>

          {/* ===================================
              HISTORY LIST
          ==================================== */}

          {history.length > 0 ? (

            <div
              className="practice-history"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >

              {history.map((item) => {

                const info =
                  getScenarioInfo(
                    item.scenario
                  );

                return (
                  <div
                    key={item.id}
                    className="history-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      padding: "18px 20px",
                      background:
                        "#ffffff",
                      border:
                        "1px solid #eadfe1",
                      borderRadius: "14px",
                    }}
                  >

                    {/* LEFT */}

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "15px",
                      }}
                    >

                      <span
                        style={{
                          width: "48px",
                          height: "48px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderRadius:
                            "12px",
                          background:
                            "#f8edef",
                          fontSize: "23px",
                        }}
                      >
                        {info.emoji}
                      </span>

                      <div>

                        <strong
                          style={{
                            display:
                              "block",
                            fontSize:
                              "16px",
                            color:
                              "#1b1720",
                          }}
                        >
                          {info.japanese}
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop:
                              "3px",
                            fontSize:
                              "13px",
                            color:
                              "#83757d",
                          }}
                        >
                          {info.english}
                        </span>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                            fontSize:
                              "12px",
                            color:
                              "#a4979d",
                          }}
                        >
                          {formatDate(
                            item.completed_at ||
                              item.created_at
                          )}
                        </span>

                      </div>

                    </div>

                    {/* SCORE */}

                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >

                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            "24px",
                          color:
                            item.score >= 90
                              ? "#3c8b52"
                              : item.score >= 70
                              ? "#c18b32"
                              : "#c94e68",
                        }}
                      >
                        {item.score}
                      </strong>

                      <span
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#a4979d",
                        }}
                      >
                        / 100
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          ) : (

            /* EMPTY HISTORY */

            <div className="empty-history">

              <div className="empty-icon">
                📚
              </div>

              <h3>
                No practice sessions yet
              </h3>

              <p>
                Complete your first
                conversation to see your
                learning history here.
              </p>

              <Link
                to="/scenarios"
                className="start-practice-btn"
              >
                Start your practice
              </Link>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;