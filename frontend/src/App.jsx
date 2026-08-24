import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Scenarios from "./pages/scenarios";
import Conversation from "./pages/conversation";

import "./App.css";


function Home() {
  // ==============================
  // Backend connection
  // ==============================

  const [backendMessage, setBackendMessage] =
    useState("");

  const [backendConnected, setBackendConnected] =
    useState(false);


  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log(
          "Backend response:",
          data
        );

        setBackendMessage(data.message);
        setBackendConnected(true);
      })
      .catch((error) => {
        console.error(
          "Backend connection error:",
          error
        );

        setBackendConnected(false);
      });
  }, []);


  return (
    <div className="app">

      {/* ==================================
          Navigation
          ================================== */}

      <header className="navbar">

        <div className="logo">

          <span className="logo-mark">
            日
          </span>

          <span>
            Nihongo Talk
          </span>

        </div>


        <nav>

          <a href="#features">
            Features
          </a>

          <a href="#scenarios">
            Scenarios
          </a>

          <a href="#about">
            About
          </a>

        </nav>


        <div className="nav-buttons">

          <Link
            to="/login"
            className="login-btn"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="signup-btn"
          >
            Start Learning
          </Link>

        </div>

      </header>


      {/* ==================================
          Backend Connection Status
          ================================== */}

      {backendConnected && (
        <div
          style={{
            padding: "12px 20px",
            margin: "20px auto",
            maxWidth: "900px",
            background: "#e8f7e8",
            borderRadius: "10px",
            textAlign: "center",
            color: "#267a35",
            fontWeight: "600",
          }}
        >
          🟢 {backendMessage}
        </div>
      )}


      {/* ==================================
          Hero
          ================================== */}

      <main>

        <section className="hero">

          <div className="hero-content">

            <div className="badge">
              🇯🇵 Japanese Conversation Practice
            </div>


            <h1>
              Speak Japanese
              <br />

              <span>
                with confidence.
              </span>

            </h1>


            <p>
              Practice natural Japanese
              conversation through realistic
              everyday scenarios. Listen,
              speak, practice, and improve
              step by step.
            </p>


            <div className="hero-buttons">

              <Link
                to="/register"
                className="primary-btn"
              >
                Start Learning →
              </Link>


              <a
                href="#scenarios"
                className="secondary-btn"
              >
                Explore Scenarios
              </a>

            </div>


            <div className="hero-info">

              <div>

                <strong>
                  5+
                </strong>

                <span>
                  Scenarios
                </span>

              </div>


              <div>

                <strong>
                  🎙️
                </strong>

                <span>
                  Voice Practice
                </span>

              </div>


              <div>

                <strong>
                  📊
                </strong>

                <span>
                  Learning History
                </span>

              </div>

            </div>

          </div>


          {/* ==================================
              Conversation Preview
              ================================== */}

          <div className="conversation-card">

            <div className="card-header">

              <div>

                <small>
                  SCENARIO
                </small>

                <h3>
                  🍽️ Restaurant
                </h3>

              </div>


              <span className="level">
                N4
              </span>

            </div>


            <div className="chat">

              <div className="message teacher">

                <span className="avatar">
                  👩🏻
                </span>


                <div>

                  <small>
                    Staff
                  </small>

                  <p>
                    いらっしゃいませ。
                  </p>

                  <button
                    className="sound-btn"
                    type="button"
                  >
                    🔊 Listen
                  </button>

                </div>

              </div>


              <div className="message user">

                <div>

                  <small>
                    You
                  </small>

                  <p>
                    二人です。
                  </p>

                  <span className="score">
                    ✓ Good pronunciation
                  </span>

                </div>


                <span className="avatar user-avatar">
                  👤
                </span>

              </div>

            </div>


            <Link
              to="/scenarios/restaurant"
              className="practice-btn"
            >
              🎙️ Practice speaking
            </Link>

          </div>

        </section>


        {/* ==================================
            Features
            ================================== */}

        <section
          id="features"
          className="features-section"
        >

          <div className="section-heading">

            <span>
              FEATURES
            </span>

            <h2>
              Everything you need to
              practice speaking.
            </h2>

            <p>
              Build your Japanese
              conversation skills with
              interactive practice.
            </p>

          </div>


          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-icon">
                🎙️
              </div>

              <h3>
                Voice Practice
              </h3>

              <p>
                Speak Japanese using
                your microphone and
                practice real conversation.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🔊
              </div>

              <h3>
                Listen & Repeat
              </h3>

              <p>
                Listen to Japanese
                pronunciation and repeat
                naturally.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Track Progress
              </h3>

              <p>
                Review your practice
                history and see how your
                performance improves.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🔄
              </div>

              <h3>
                Practice Again
              </h3>

              <p>
                Repeat previous
                conversations whenever
                you want to improve.
              </p>

            </div>

          </div>

        </section>


        {/* ==================================
            Scenarios
            ================================== */}

        <section
          id="scenarios"
          className="scenarios-section"
        >

          <div className="section-heading">

            <span>
              SCENARIOS
            </span>

            <h2>
              Practice Japanese
              for real life.
            </h2>

          </div>


          <div className="scenario-grid">

            {/* Self Introduction */}

            <Link
              to="/scenarios/introduce"
              className="scenario-card"
            >

              <span>
                👋
              </span>

              <h3>
                自己紹介
              </h3>

              <p>
                Self Introduction
              </p>

            </Link>


            {/* Shopping */}

            <Link
              to="/scenarios/shopping"
              className="scenario-card"
            >

              <span>
                🛍️
              </span>

              <h3>
                買い物
              </h3>

              <p>
                Shopping
              </p>

            </Link>


            {/* Restaurant */}

            <Link
              to="/scenarios/restaurant"
              className="scenario-card"
            >

              <span>
                🍽️
              </span>

              <h3>
                レストラン
              </h3>

              <p>
                Restaurant
              </p>

            </Link>


            {/* Train Station */}

            <Link
              to="/scenarios/station"
              className="scenario-card"
            >

              <span>
                🚉
              </span>

              <h3>
                駅
              </h3>

              <p>
                Train Station
              </p>

            </Link>


            {/* Job Interview */}

            <Link
              to="/scenarios/interview"
              className="scenario-card"
            >

              <span>
                💼
              </span>

              <h3>
                面接
              </h3>

              <p>
                Job Interview
              </p>

            </Link>

          </div>

        </section>


        {/* ==================================
            About
            ================================== */}

        <section
          id="about"
          className="about-section"
        >

          <div>

            <span>
              ABOUT NIHONGO TALK TRAINER
            </span>

            <h2>
              Japanese practice that
              feels like a real
              conversation.
            </h2>

          </div>


          <p>
            Nihongo Talk Trainer helps
            Japanese learners practice
            speaking through realistic
            situations. Choose a scenario,
            listen to Japanese, respond,
            and review your results.
          </p>

        </section>

      </main>


      {/* ==================================
          Footer
          ================================== */}

      <footer>

        <div className="logo">

          <span className="logo-mark">
            日
          </span>

          <span>
            Nihongo Talk Trainer
          </span>

        </div>


        <p>
          © 2026 Nihongo Talk Trainer
        </p>

      </footer>

    </div>
  );
}


/* =========================================
   APP ROUTES
   ========================================= */

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/scenarios"
          element={<Scenarios />}
        />

        <Route
          path="/scenarios/:scenarioId"
          element={<Conversation />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;