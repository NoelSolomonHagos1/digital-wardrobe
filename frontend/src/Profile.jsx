import "./Profile.css";

export default function Profile({ user = {}, itemCount = 0, outfitCount = 0, onLogout, onNavigate }) {
  const name = user.name || "Drobe member";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="page-wrap profile-page">
    <header className="page-heading"><div><span className="section-kicker">YOUR ACCOUNT</span><h1>Profile</h1><p>Manage your Drobe account and wardrobe.</p></div></header>
    <section className="profile-overview panel"><div className="profile-avatar">{initials}</div><div className="profile-person"><h2>{name}</h2><p>{user.email || "Your Drobe account"}</p><span className="member-tag"><span /> Drobe member</span></div><button className="button-secondary" onClick={() => onNavigate?.("closet")}>View my closet</button></section>
    <div className="profile-columns"><section className="panel profile-card"><div className="profile-card-head"><div><span className="section-kicker">YOUR WARDROBE</span><h2>A little about your closet</h2></div><span className="profile-glyph">♧</span></div><div className="profile-stats"><div><strong>{itemCount}</strong><span>Clothing items</span></div><div><strong>{outfitCount}</strong><span>Saved outfits</span></div></div><button className="profile-row" onClick={() => onNavigate?.("closet")}><span><b>Browse your clothes</b><small>See everything in your digital closet</small></span><span>→</span></button><button className="profile-row" onClick={() => onNavigate?.("outfits")}><span><b>Saved outfits</b><small>Revisit the combinations you love</small></span><span>→</span></button></section>
      <section className="panel profile-card"><div className="profile-card-head"><div><span className="section-kicker">ACCOUNT DETAILS</span><h2>Your information</h2></div><span className="profile-glyph">◎</span></div><div className="account-detail"><span>Name</span><strong>{name}</strong></div><div className="account-detail"><span>Email address</span><strong>{user.email || "Not provided"}</strong></div><div className="profile-note"><span>✦</span><p>Your wardrobe stays yours. Drobe uses your closet to help make getting dressed feel easier.</p></div><button className="logout-button" onClick={onLogout}>Log out of Drobe <span>↗</span></button></section></div>
  </div>;
}
