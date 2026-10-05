import "./ItemDetail.css";

const svg = (children, size = 24) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const BackIcon = () =>
  svg(<path d="M19 12H5M11 6l-6 6 6 6" />);

const PlusIcon = () =>
  svg(<path d="M12 5v14M5 12h14" />, 20);

const ShirtIcon = ({ size = 22 }) =>
  svg(
    <path d="M9 4l-6 3 2 4 2-1v10h10V10l2 1 2-4-6-3a3 3 0 0 1-6 0z" />,
    size
  );

export default function ItemDetail({
  item,
  onBack,
  onAddToOutfit,
  onWearToday,
  onDelete,
}) {
  if (!item) {
    return null;
  }

  const categoryLabels = {
    tops: "Top",
    pants: "Pants",
    jackets: "Jacket",
    shoes: "Shoes",
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${item.name}"?`)) {
      onDelete?.(item);
    }
  };

  return (
    <div className="detail">
      <header className="detail-top">
        <button
          className="d-icon"
          type="button"
          onClick={onBack}
          aria-label="Back"
        >
          <BackIcon />
        </button>

        <h1>Clothing Details</h1>

        <div className="detail-spacer" />
      </header>

      <main className="detail-content">
        <div className="d-photo">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} />
          ) : (
            <ShirtIcon size={48} />
          )}
        </div>

        <section className="d-info">
          <h2>{item.name}</h2>

          <div className="d-details">
            <div className="d-detail">
              <span>Category</span>
              <strong>
                {categoryLabels[item.category] || item.category}
              </strong>
            </div>

            <div className="d-detail">
              <span>Color</span>
              <strong>{item.color || "Not specified"}</strong>
            </div>

            <div className="d-detail">
              <span>Season</span>
              <strong>{item.season || "Not specified"}</strong>
            </div>

            <div className="d-detail">
              <span>Style</span>
              <strong>{item.style || "Not specified"}</strong>
            </div>
          </div>
        </section>

        <div className="d-actions">
          <button
            className="d-btn primary"
            type="button"
            onClick={() => onAddToOutfit?.(item)}
          >
            <PlusIcon />
            Add to Outfit
          </button>

          <button
            className="d-btn outline"
            type="button"
            onClick={() => onWearToday?.(item)}
          >
            <ShirtIcon />
            Wear Today
          </button>
        </div>

        <div className="d-footer">
          <button
            className="d-link danger"
            type="button"
            onClick={handleDelete}
          >
            Delete Item
          </button>
        </div>
      </main>
    </div>
  );
}