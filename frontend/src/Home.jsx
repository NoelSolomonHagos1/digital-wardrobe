import "./Home.css";

const icon = (children, size = 24) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const HomeIcon = () => icon(<><path d="M4 11l8-7 8 7" /><path d="M6 10v9h4v-5h4v5h4v-9" /></>);
const ShirtIcon = ({ size }) => icon(<path d="M9 4l-6 3 2 4 2-1v10h10V10l2 1 2-4-6-3a3 3 0 0 1-6 0z" />, size);
const CameraIcon = () => icon(<><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>);
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
  { id: "scan", label: "Scan", Icon: CameraIcon },
  { id: "profile", label: "Profile", Icon: UserIcon },
];

export default function Home({
  user = { name: "George" },
  weather = { temp: 20, condition: "Partly Cloudy", hint: "Perfect for light layering" },
  itemCount = 128,
  active = "home",
  onNavigate,
}) {
  const go = (id) => () => onNavigate?.(id);
  const weatherWord = (weather.short ?? weather.condition).toLowerCase();

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
            <div className="temp">{weather.temp}°C</div>
            <h2>{weather.condition}</h2>
            <p>{weather.hint}</p>
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

        <button className="card" type="button" onClick={go("recommendations")}>
          <div>
            <h2>Recommendations</h2>
            <p>Styled for {weatherWord} weather</p>
          </div>
          <span className="chip blue"><SparkleIcon /></span>
        </button>
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
