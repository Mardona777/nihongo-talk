import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    level: "",
  });

  const [message, setMessage] = useState("");
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

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/auth/register",
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
          data.message || "Registration failed."
        );
      }

      setMessage(data.message);

      // Account successfully created
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Register error:", error);

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
          Create your account
        </h1>

        <p className="auth-subtitle">
          Start practicing Japanese conversation today.
        </p>


        {/* Success message */}

        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: "#e8f7e8",
              color: "#267a35",
              textAlign: "center",
            }}
          >
            ✅ {message}
          </div>
        )}


        {/* Error message */}

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: "#fdecec",
              color: "#c0392b",
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        )}


        {/* Register Form */}

        <form onSubmit={handleSubmit}>

          {/* Name */}

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>


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
              minLength="6"
              required
            />

          </div>


          {/* Japanese Level */}

          <div className="form-group">

            <label htmlFor="level">
              Japanese Level
            </label>

            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >

              <option value="" disabled>
                Select your level
              </option>

              <option value="N5">
                N5 - Beginner
              </option>

              <option value="N4">
                N4 - Elementary
              </option>

              <option value="N3">
                N3 - Intermediate
              </option>

              <option value="N2">
                N2 - Upper Intermediate
              </option>

              <option value="N1">
                N1 - Advanced
              </option>

            </select>

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>


        {/* Login link */}

        <p className="auth-switch">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>


        {/* Home link */}

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

export default Register;