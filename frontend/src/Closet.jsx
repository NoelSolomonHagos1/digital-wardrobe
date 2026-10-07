import { useMemo, useState } from "react";
import "./Closet.css";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "shirts", label: "Shirts", icon: true },
  { id: "pants", label: "Pants" },
  { id: "jackets", label: "Jackets" },
  { id: "shoes", label: "Shoes" },
];

const svg = (children, size = 24) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const SearchIcon = () => svg(<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>, 26);
const SlidersIcon = () => svg(<><path d="M5 4v16M12 4v16M19 4v16" /><path d="M3 9h4M10 15h4M17 8h4" /></>, 26);
const ShirtIcon = ({ size = 18 }) => svg(<path d="M9 4l-6 3 2 4 2-1v10h10V10l2 1 2-4-6-3a3 3 0 0 1-6 0z" />, size);

const HomeIcon = () => svg(<><path d="M4 11l8-7 8 7" /><path d="M6 10v9h4v-5h4v5h4v-9" /></>);
const OutfitIcon = () => svg(<><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></>);
const UserIcon = () => svg(<><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 4-6 8-6s7 2 8 6" /></>);
const PlusIcon = () => svg(<path d="M12 5v14M5 12h14" />, 28);

const TABS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "closet", label: "Closet", Icon: () => <ShirtIcon size={24} /> },
  { id: "fab" },
  { id: "outfits", label: "Outfits", Icon: OutfitIcon },
  { id: "profile", label: "Profile", Icon: UserIcon },
];

/**
 * items: [{ id, name, brand, category: "tops" | "pants" | "jackets" | "shoes", imageUrl }]
 */
export default function Closet({ items = [], onSelectItem, onFilter, onNavigate }) {
  const [category, setCategory] = useState("all");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (it) =>
        (category === "all" || (category === "shirts" && (it.category === "shirts" || it.category === "tops")) || it.category === category) &&
        (!q || it.name.toLowerCase().includes(q) || it.brand?.toLowerCase().includes(q))
    );
  }, [items, category, query]);

  const toggleSearch = () => {
    setSearching((s) => !s);
    setQuery("");
  };

  return (
    <div className="closet">
      <main className="closet-content">
        <header className="closet-head">
          <h1>My Closet</h1>
          <div className="head-actions">
            <button className="icon-btn" type="button" onClick={toggleSearch} aria-label="Search" aria-pressed={searching}>
              <SearchIcon />
            </button>
            <button className="icon-btn" type="button" onClick={onFilter} aria-label="Filters">
              <SlidersIcon />
            </button>
          </div>
        </header>

        {searching && (
          <div className="search">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your closet"
              aria-label="Search your closet"
            />
          </div>
        )}

        <div className="filters" role="tablist" aria-label="Categories">
          {CATEGORIES.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={category === id}
              className={`chip-btn${category === id ? " active" : ""}`}
              onClick={() => setCategory(id)}
            >
              {icon && <ShirtIcon />}
              {label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="empty">{items.length === 0 ? "Your closet is empty. Tap + to add clothes." : "No items found."}</p>
        ) : (
          <div className="grid-items">
            {visible.map((it) => (
              <button key={it.id} type="button" className="item" onClick={() => onSelectItem?.(it)}>
                <div className="photo">
                  {it.imageUrl ? <img src={it.imageUrl} alt="" loading="lazy" /> : <ShirtIcon size={32} />}
                </div>
                <div className="info">
                  <h2>{it.name}</h2>
                  {it.brand && <p>{it.brand}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <nav className="closet-tabbar" aria-label="Main">
        {TABS.map(({ id, label, Icon }) =>
          id === "fab" ? (
            <button key={id} className="closet-fab" type="button" onClick={() => onNavigate?.("add")} aria-label="Add clothes">
              <PlusIcon />
            </button>
          ) : (
            <button key={id} className={`closet-tab${id === "closet" ? " active" : ""}`} type="button"
                    onClick={() => onNavigate?.(id)} aria-current={id === "closet" ? "page" : undefined}>
              <Icon />
              {label}
            </button>
          )
        )}
      </nav>
    </div>
  );
}
