import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("auth/verify-email/", {
        email,
        otp,
      });

      setMessage(response.data.message);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error || "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setMessage("");

    try {
      const response = await api.post("auth/resend-verification/", {
        email,
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to resend OTP."
      );
    }
  };

  return (
    <main>
      <h1>Verify Your Email</h1>
      <p>Enter the 6-digit OTP sent to your email.</p>

      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]{6}"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button type="button" onClick={resendOtp}>
        Resend OTP
      </button>

      {message && <p>{message}</p>}
      {error && <p role="alert">{error}</p>}

      <Link to="/login">Back to Login</Link>
    </main>
  );
}