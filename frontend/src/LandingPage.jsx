import "./LandingPage.css";
import DrobeLogo from "./DrobeLogo";

const JacketArt = () => (
  <svg className="garment-art jacket-art" viewBox="0 0 280 220" role="img" aria-label="Golden canvas jacket">
    <defs><linearGradient id="canvas" x1="0" x2="1"><stop stopColor="#d79b32"/><stop offset=".48" stopColor="#efbd59"/><stop offset="1" stopColor="#c88c27"/></linearGradient></defs>
    <path d="m96 32-39 17-23 48 25 12 13-21-5 88h146l-5-88 13 21 25-12-23-48-39-17c-8 14-18 22-44 22s-36-8-44-22Z" fill="url(#canvas)" stroke="#b88025" strokeWidth="3" strokeLinejoin="round"/>
    <path d="m96 32 22 25 22-3 22 3 22-25-24-12c-8 13-18 19-40 19s-32-6-40-19L96 32Z" fill="#f5cf7d" stroke="#b88025" strokeWidth="2"/>
    <path d="m140 54 2 120M108 96l-4 34h28l2-34m14 0 2 34h28l-4-34" fill="none" stroke="#9f6c21" strokeWidth="3"/>
    <path d="M116 58 93 48m71 10 23-10M79 104l17 7m105-7-17 7" fill="none" stroke="#f6d387" strokeWidth="3"/>
    <circle cx="145" cy="78" r="2.5" fill="#80551c"/><circle cx="145" cy="91" r="2.5" fill="#80551c"/><circle cx="145" cy="104" r="2.5" fill="#80551c"/>
  </svg>
);
const PantsArt = () => (
  <svg className="garment-art pants-art" viewBox="0 0 280 220" role="img" aria-label="Relaxed linen trousers">
    <defs><linearGradient id="linen" x1="0" x2="1"><stop stopColor="#cfc3a9"/><stop offset=".5" stopColor="#efe7d7"/><stop offset="1" stopColor="#c7baa0"/></linearGradient></defs>
    <path d="M77 30h126l14 150-51 7-25-92-25 92-51-7 12-150Z" fill="url(#linen)" stroke="#b6a98f" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M78 48h124M141 49v41m-39-37 3 14m72-14-3 14M89 164l44 6m58-6-44 6" fill="none" stroke="#b5a88f" strokeWidth="3"/>
    <circle cx="145" cy="57" r="3" fill="#9d9078"/>
  </svg>
);

export default function LandingPage({ onSignUp, onLogin }) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a href="#top" className="brand-link" aria-label="Drobe home"><DrobeLogo /></a>
        <nav aria-label="Main navigation">
          <a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#closet-ai">Closet AI</a><a href="#testimonials">About</a>
        </nav>
        <div className="landing-actions"><button className="text-button" onClick={onLogin}>Log in</button><button className="button-primary" onClick={onSignUp}>Get started free</button></div>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="eyebrow-pill">INTRODUCING DROBE</span>
            <h1>Your digital wardrobe.<br />Weather-based style.</h1>
            <p>Never second-guess your outfit again. Drobe brings your closet together and helps you get dressed for the day ahead.</p>
            <div className="hero-buttons"><button className="button-primary" onClick={onSignUp}>Style my closet</button><a className="button-secondary" href="#how-it-works">See how it works</a></div>
            <div className="hero-note"><span className="tiny-check">✓</span> Your wardrobe, ready for every forecast</div>
          </div>
          <div className="suggestion-card">
            <div className="suggestion-head"><div><strong>Today’s outfit suggestion</strong><span>Partly cloudy · Helsinki</span></div><span className="weather-badge">Cloudy comfort</span></div>
            <div className="suggestion-items">
              <article className="suggestion-item"><div className="garment-stage jacket-stage"><JacketArt /></div><div className="suggestion-label"><small>DROBE EDIT</small><strong>Canvas jacket</strong></div></article>
              <article className="suggestion-item"><div className="garment-stage pants-stage"><PantsArt /></div><div className="suggestion-label"><small>EVERYDAY LINEN</small><strong>Relaxed trousers</strong></div></article>
            </div>
            <div className="suggestion-footer"><span className="sun-dot">☼</span> A comfortable layer for a cool morning</div>
          </div>
        </section>

        <section className="benefit-strip" aria-label="Drobe benefits"><div><strong>One place</strong><span>For everything you wear</span></div><div><strong>Day by day</strong><span>Outfits that fit the weather</span></div><div><strong>Your style</strong><span>Recommendations from your closet</span></div></section>

        <section className="feature-section" id="features">
          <div className="section-heading"><span className="section-kicker">MADE FOR REAL MORNINGS</span><h2>A little more ease,<br />every time you get dressed.</h2></div>
          <div className="feature-grid" id="closet-ai">
            <article className="feature-card"><span className="feature-icon">▧</span><h3>Your closet, organized</h3><p>Bring your everyday pieces into one clear, visual wardrobe you can browse any time.</p></article>
            <article className="feature-card"><span className="feature-icon sparkle">✣</span><h3>Weather-aware outfits</h3><p>See the forecast alongside your clothes and make a plan that feels right for the day.</p></article>
            <article className="feature-card"><span className="feature-icon">♧</span><h3>Wear what you own</h3><p>Save outfit ideas and notice the pieces you reach for most often.</p></article>
          </div>
        </section>

        <section className="steps-section" id="how-it-works"><div className="section-heading"><span className="section-kicker">A SIMPLE PLACE TO START</span><h2>Three steps to a smoother morning.</h2></div><div className="steps-grid"><article><b>01</b><h3>Add your pieces</h3><p>Build a digital closet with photos of the clothes you already own.</p></article><article><b>02</b><h3>Make it yours</h3><p>Organize by category, color, season, and the way you like to dress.</p></article><article><b>03</b><h3>Get ready with Drobe</h3><p>Check the weather, browse your closet, and save outfits for later.</p></article></div></section>

        <section className="closing-cta" id="testimonials"><span className="section-kicker">YOUR CLOSET, A FRESH START</span><h2>Make getting dressed<br />the easy part of your day.</h2><p>Start with the clothes you love. Drobe helps bring your wardrobe into focus.</p><button className="button-primary" onClick={onSignUp}>Create my free account</button></section>
      </main>
      <footer className="landing-footer"><div className="footer-main"><div><DrobeLogo light /><p>Everyday style, with a little more intention.</p></div><div className="footer-links"><div><b>EXPLORE</b><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#closet-ai">Closet AI</a></div><div><b>ACCOUNT</b><button onClick={onLogin}>Log in</button><button onClick={onSignUp}>Create account</button></div><div><b>ABOUT</b><a href="#testimonials">About Drobe</a><a href="mailto:hello@drobe.app">Contact</a></div></div></div><div className="footer-bottom"><span>© 2026 Drobe. Made for everyday.</span><span>Powered by your wardrobe and the weather.</span></div></footer>
    </div>
  );
}
