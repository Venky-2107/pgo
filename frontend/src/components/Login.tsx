import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

export default function LoginComponent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"owner" | "admin">("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contact: "",
    agreedToTerms: false,
  });

  const API_URL = "http://localhost:5000/api/auth";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Simple frontend validation
    if (!isLogin && !formData.agreedToTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }
    if (!isLogin && formData.contact.length < 10) {
      setError("Please enter a valid 10-digit contact number.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const endpoint = role === "admin" ? "/admin/login" : "/owner/login";
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          login(data.user, data.token);
          navigate(role === "admin" ? "/admin" : "/owner");
        } else {
          setError(data.message || "Invalid credentials. Please try again.");
        }
      } else {
        if (role === "admin") {
          setError("Admin registration is not allowed via this interface.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/owner/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password,
            contact: formData.contact,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          login(data.user, data.token);
          navigate("/owner");
        } else {
          setError(data.message || "Registration failed. Email might be taken.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Connection to server failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative py-20 px-4 mt-10">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-primary opacity-10 blur-[100px] -z-10 rounded-full"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent opacity-10 blur-[80px] -z-10 rounded-full"></div>

      <div className="w-full max-w-xl animate-fade">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 blur-3xl -z-10"></div>

          <div className="text-center mb-8">
            <NavLink to="/" className="inline-block text-4xl font-black tracking-tighter text-white mb-6 no-underline">
              PGO<span className="text-primary">.</span>
            </NavLink>
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Partner with Us"}
            </h2>
            <p className="text-text-muted">
              {isLogin
                ? `Log in to manage your ${role === 'admin' ? 'platform' : 'properties'}`
                : "Register as a PG Owner to list your properties"}
            </p>
          </div>

          {/* Role & Mode Switchers */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="glass p-1 rounded-xl flex gap-1">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'owner' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                onClick={() => { setRole('owner'); setError(""); }}
              >
                PG Owner
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                onClick={() => { setRole('admin'); setIsLogin(true); setError(""); }}
              >
                Platform Admin
              </button>
            </div>

            <div className="flex justify-center gap-4 text-sm font-medium">
              <button
                className={`transition-colors ${isLogin ? 'text-primary' : 'text-text-muted hover:text-white'}`}
                onClick={() => setIsLogin(true)}
              >
                Log In
              </button>
              {role === 'owner' && (
                <button
                  className={`transition-colors ${!isLogin ? 'text-primary' : 'text-text-muted hover:text-white'}`}
                  onClick={() => setIsLogin(false)}
                >
                  Create Account
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error p-4 rounded-xl mb-6 text-sm animate-fade">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted ml-1">FIRST NAME</label>
                  <input
                    type="text"
                    name="firstName"
                    className="input-premium"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted ml-1">LAST NAME</label>
                  <input
                    type="text"
                    name="lastName"
                    className="input-premium"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted ml-1">CONTACT NUMBER</label>
                <input
                  type="text"
                  name="contact"
                  className="input-premium"
                  placeholder="+91 00000 00000"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted ml-1">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                className="input-premium"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-text-muted">PASSWORD</label>
                {isLogin && <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input-premium pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 p-1">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  id="terms"
                  className="mt-1 accent-primary"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                />
                <label htmlFor="terms" className="text-xs text-text-muted leading-relaxed">
                  I agree to the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="btn-premium btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-glass-border">
            <p className="text-center text-xs text-text-muted mb-4">OR CONTINUE WITH</p>
            <div className="grid grid-cols-2 gap-4">
              <button className="glass py-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                <span className="text-lg">G</span> Google
              </button>
              <button className="glass py-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                <span className="text-lg"></span> Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
