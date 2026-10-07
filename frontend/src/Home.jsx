import "./Home.css";

const icon = (children, size = 24) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const HomeIcon = () => icon(<><path d="M4 11l8-7 8 7" /><path d="M6 10v9h4v-5h4v5h4v-9" /></>);
const ShirtIcon = ({ size }) => icon(<path d="M9 4l-6 3 2 4 2-1v10h10V10l2 1 2-4-6-3a3 3 0 0 1-6 0z" />, size);
const UserIcon = () => icon(<><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 4-6 8-6s7 2 8 6" /></>);
const PlusIcon = () => icon(<path d="M12 5v14M5 12h14" />, 28);
const SparkleIcon = ({ size = 20 }) => icon(<><path d="M10 4l1.6 4.4L16 10l-4.4 1.6L10 16l-1.6-4.4L4 10l4.4-1.6L10 4z" /><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" /></>, size);
const PartlyCloudyIcon = () => icon(
  <>
    <path d="M8 4v1.5M3.5 8.5H5M4.8 5.3l1 1M11.2 5.3l-1 1" />
    <path d="M7 14a3.5 3.5 0 1 1 3-5.3" />
    <path d="M9 19h8a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 13.5 2.8 2.8 0 0 0 9 19z" />
  </>, 32);

const TABS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "closet", label: "Closet", Icon: ShirtIcon },
  { id: "fab" },
  { id: "outfits", label: "Outfits", Icon: SparkleIcon },
  { id: "profile", label: "Profile", Icon: UserIcon },
];

export default function Home({
  user = { name: "George" },
  weather,
  weatherError,
  recommendation,
  recommendationLoading,
  recommendationError,
  itemCount = 128,
  active = "home",
  onNavigate,
  onBuildRecommendation,
}) {
  const go = (id) => () => onNavigate?.(id);
  const temperature = weather?.current?.temperature_2m;
  const feelsLike = weather?.current?.apparent_temperature;
  const weatherCondition = weather?.current?.condition;
  const recommendationItems = recommendation?.items ?? [];

  return (
    <div className="home">
      <main className="home-content">
        <header className="greeting">
          <div>
            <h1>Hello, {user.name}</h1>
            <p>Let's style today's outfit</p>
          </div>
          <button className="avatar" type="button" onClick={go("profile")} aria-label="Open profile">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.name?.[0]?.toUpperCase()}
          </button>
        </header>

        <section className="card weather" aria-label="Today's weather">
          <div>
            <div className="weather-location">LIVE WEATHER <span>·</span> {weather?.location?.name || "Espoon keskus, Espoo"}</div>
            <div className="temp">{temperature == null ? "—" : `${Math.round(temperature)}°C`}</div>
            <h2>{weatherCondition || (weatherError ? "Weather unavailable" : "Loading Espoo weather…")}</h2>
            <p>{weather ? `Feels like ${Math.round(feelsLike ?? temperature)}°C · ${weather.current?.wind_speed_10m ?? "—"} m/s wind · ${weather.current?.precipitation ?? 0} mm precipitation` : weatherError || "Fetching current conditions from Open-Meteo"}</p>
            {weather?.current?.time && <span className="weather-updated">Updated {weather.current.time.replace("T", " ")}</span>}
            <a className="weather-source" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather by Open-Meteo</a>
          </div>
          <div className="weather-icon"><PartlyCloudyIcon /></div>
        </section>

        <button className="card" type="button" onClick={go("closet")}>
          <div>
            <h2>Browse Clothes</h2>
            <p>{itemCount} items cataloged</p>
          </div>
          <span className="chip"><ShirtIcon size={20} /></span>
        </button>

        <section className="card today-recommendation">
          <div className="recommendation-heading"><div><span className="recommendation-kicker"><SparkleIcon size={16} /> TODAY'S DROBE EDIT</span><h2>{recommendation?.title || (recommendationLoading ? "Finding a look in your closet…" : "Your outfit, weather-ready")}</h2><p>{recommendation?.reason || recommendationError || (weatherError ? "Live weather is unavailable, so Drobe can’t make a weather-matched suggestion yet." : "Drobe is checking your closet for a look that suits Espoo today.")}</p></div><span className="ai-badge">{recommendationLoading ? "GEMINI FLASH · THINKING" : recommendation?.source === "gemini" ? "GEMINI FLASH" : "CLOSET MATCH"}</span></div>
          {recommendationItems.length > 0 ? <div className="recommendation-items">{recommendationItems.map((item) => <article className="recommendation-item" key={item.id}><div className="recommendation-thumb">{item.image_url ? <img src={item.image_url} alt="" /> : <ShirtIcon size={22} />}</div><div><strong>{item.name}</strong><span>{item.category === "tops" ? "Shirt" : item.category}</span></div></article>)}</div> : <p className="recommendation-empty">{recommendationLoading ? "Gemini Flash is checking the pieces you have." : recommendationError ? "Try opening Overview again to refresh your suggestion." : recommendation ? "Add a few pieces to your closet to get a personalized look." : ""}</p>}
          <div className="recommendation-actions">{recommendationItems.length > 0 && <button type="button" className="button-primary" onClick={onBuildRecommendation}>Make this an outfit</button>}<button type="button" className="button-secondary" onClick={go(recommendationItems.length ? "closet" : "add")}>{recommendationItems.length ? "Browse closet" : "Add clothes"}</button></div>
        </section>
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ id, label, Icon }) =>
          id === "fab" ? (
            <button key={id} className="fab" type="button" onClick={go("add")} aria-label="Add clothes">
              <PlusIcon />
            </button>
          ) : (
            <button key={id} className={`tab${active === id ? " active" : ""}`} type="button"
                    onClick={go(id)} aria-current={active === id ? "page" : undefined}>
              <Icon />
              {label}
            </button>
          )
        )}
      </nav>
    </div>
  );
}
