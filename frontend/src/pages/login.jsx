import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}

        <div className="auth-logo">

          <span className="logo-mark">
            日
          </span>

          <span>
            Nihongo Talk Trainer
          </span>

        </div>


        {/* Title */}

        <h1>
          Welcome back
        </h1>

        <p className="auth-subtitle">
          Continue your Japanese conversation practice.
        </p>


        {/* Error */}

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fdecec",
              color: "#c0392b",
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        )}


        {/* Login Form */}

        <form onSubmit={handleSubmit}>

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* Register */}

        <p className="auth-switch">

          Don't have an account?{" "}

          <Link to="/register">
            Create account
          </Link>

        </p>


        {/* Home */}

        <Link
          to="/"
          className="back-home"
        >
          ← Back to home
        </Link>

      </div>
    </div>
  );
}

export default Login;