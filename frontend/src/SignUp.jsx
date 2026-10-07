import { useState } from "react";
import "./SignUp.css";
import DrobeLogo from "./DrobeLogo";

const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>;
const AppleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.63c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.87.69 1.19-.02 1.94-1.08 2.66-2.15.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5zM14.2 6.1c.6-.74 1.01-1.76.9-2.78-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.69-.92 2.69.97.07 1.96-.49 2.57-1.22z"/></svg>;

export default function SignUp({ onSubmit, onApple, onGoogle, onLogin, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validate(); setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try { await onSubmit?.(form); } finally { setBusy(false); }
  };
  const field = (key, label, type, placeholder, autoComplete) => (
    <div className="auth-field-wrap" key={key}>
      <label className={`field${errors[key] ? " invalid" : ""}`}><span>{label}</span><input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={!!errors[key]} /></label>
      {errors[key] && <p className="error" role="alert">{errors[key]}</p>}
    </div>
  );

  return (
    <main className="auth-page">
      <aside className="auth-aside"><button className="auth-brand-button" onClick={onBack} aria-label="Back to Drobe"><DrobeLogo light={false} /></button><div className="auth-message"><h2>Step into an effortlessly organized morning.</h2><p>Catalog your items, track outfit frequency, and enjoy thoughtful recommendations shaped around your wardrobe and the weather.</p></div><span className="auth-credit">Powered by Weather-Based Styling · v1.0</span></aside>
      <section className="auth-stage"><div className="auth-card"><header><h1>Create account</h1><p className="sub">Organize your wardrobe in seconds</p></header>
        <form onSubmit={handleSubmit} noValidate>{field("name", "Name", "text", "Your name", "name")}{field("email", "Email address", "email", "you@example.com", "email")}{field("password", "Password", "password", "Choose a strong password", "new-password")}<button className="btn primary" type="submit" disabled={busy}>{busy ? "Creating account…" : "Sign Up with Email"}</button></form>
        <div className="divider">OR</div>
        <div className="social-row"><button className="btn social" type="button" onClick={onApple}><AppleIcon /> Apple</button><button className="btn social" type="button" onClick={onGoogle}><CloseIcon /> Google</button></div>
        <p className="login">Already have an account? <a href="#login" onClick={(event) => { event.preventDefault(); onLogin?.(); }}>Log In</a></p>
      </div></section>
    </main>
  );
}
