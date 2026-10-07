import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      const user = response.data.user;

      setUser(user);

      if (user.user_role === "owner") {
        navigate("/owner");
      } else {
        navigate("/player");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "mt-2 w-full rounded-[10px] border border-white/10 bg-ink/40 px-3 py-2.5 text-sm text-bone placeholder:text-bone-2/50 outline-none transition focus:border-brass/70 focus:bg-ink/60 focus:ring-2 focus:ring-brass/25 disabled:opacity-50";

  const labelClasses =
    "font-mono text-[10px] uppercase tracking-[0.25em] text-bone-2";

  return (
    <div className="relative max-w-full rounded-[18px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute -top-px left-8 h-px w-24 bg-linear-to-r" />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link to="/">
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-brass">
              ←Back
            </p>
          </Link>

          <h2 className="mt-2 font-display text-3xl tracking-tight text-bone">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-bone-2">Login to your account</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className={labelClasses}>
            Username
          </label>

          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            placeholder="Enter Username"
            className={inputClasses}
          />
        </div>

        <div className="relative w-full">
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Enter Password"
            className={inputClasses}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 bottom-2.5 text-bone-2/60 hover:text-bone"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-brass/70 px-4 py-3 text-sm font-semibold tracking-wide text-ink transition hover:bg-[#d9b45f] focus:outline-none focus:ring-2 focus:ring-brass/50 disabled:cursor-default disabled:bg-brass/70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-bone-2">
        New player?{" "}
        <Link className="text-brass" to="/signup">
          Create account
        </Link>
      </p>
    </div>
  );
}

export default Login;
