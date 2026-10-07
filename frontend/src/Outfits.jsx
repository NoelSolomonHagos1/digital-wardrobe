import { useState } from "react";
import "./Outfits.css";

export default function Outfits({ outfits = [], items = [], initialSelection = [], onCreate, onNavigate }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(initialSelection);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) { setError("Give this outfit a name first."); return; }
    setSaving(true); setError("");
    try { const ok = await onCreate?.({ name: name.trim(), clothesIds: selected }); if (ok) { setName(""); setSelected([]); } }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save this outfit."); }
    finally { setSaving(false); }
  };

  return <div className="page-wrap outfits-page">
    <header className="page-heading"><div><span className="section-kicker">OUTFIT PLANNING</span><h1>Your outfits</h1><p>Put your favorite pieces together and keep the looks you love.</p></div><button className="button-primary" onClick={() => document.getElementById("outfit-builder")?.scrollIntoView({ behavior: "smooth" })}>＋ Create an outfit</button></header>
    <div className="outfits-layout"><section className="saved-outfits"><div className="subsection-heading"><div><h2>Saved looks</h2><p>{outfits.length} outfit{outfits.length === 1 ? "" : "s"} in your collection</p></div></div>
      {outfits.length ? <div className="outfit-grid">{outfits.map((outfit) => <article className="saved-outfit panel" key={outfit.id}><div className="outfit-preview">{outfit.items?.length ? outfit.items.slice(0, 3).map((item) => item.image_url ? <img key={item.id} src={item.image_url} alt=""/> : <span key={item.id} className={`outfit-swatch swatch-${item.category}`}>♧</span>) : <span className="outfit-placeholder">✳</span>}</div><div className="saved-outfit-info"><h3>{outfit.name}</h3><p>{outfit.items?.length || 0} wardrobe pieces</p></div></article>)}</div> : <div className="empty-outfits panel"><span className="empty-symbol">✳</span><h3>Your first look starts here</h3><p>Select a few pieces from your closet, give the outfit a name, and save it for later.</p><button className="button-secondary" onClick={() => document.getElementById("outfit-builder")?.scrollIntoView({ behavior: "smooth" })}>Build an outfit</button></div>}
      <button className="outfit-link" onClick={() => onNavigate?.("closet")}>Browse your closet <span>→</span></button>
    </section>
    <section className="outfit-builder panel" id="outfit-builder"><span className="section-kicker">OUTFIT BUILDER</span><h2>Make a look</h2><p className="builder-copy">Choose the pieces that belong together.</p><form onSubmit={submit}><label className="outfit-name-label">Outfit name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Easy Monday" maxLength={80}/></label><div className="builder-items-heading"><strong>Choose items</strong><span>{selected.length} selected</span></div>
      {items.length ? <div className="builder-items">{items.map((item) => <button type="button" key={item.id} className={`builder-item${selected.includes(item.id) ? " selected" : ""}`} onClick={() => toggle(item.id)} aria-pressed={selected.includes(item.id)}><span className="builder-thumb">{item.imageUrl ? <img src={item.imageUrl} alt=""/> : <span>♧</span>}</span><span><b>{item.name}</b><small>{item.category}</small></span><span className="select-check">{selected.includes(item.id) ? "✓" : "+"}</span></button>)}</div> : <div className="builder-empty">Your closet is empty. Add a few clothing items first.</div>}
      {error && <p className="form-error" role="alert">{error}</p>}<button className="button-primary save-outfit" type="submit" disabled={saving || !items.length}>{saving ? "Saving outfit…" : "Save outfit"}</button></form></section></div>
  </div>;
}
