import { useEffect, useRef, useState } from "react";
import "./AddClothes.css";

const CATEGORIES = [
  { id: "tops", label: "Add Tops" },
  { id: "pants", label: "Add Pants" },
  { id: "jackets", label: "Add Jackets" },
  { id: "shoes", label: "Add Shoes" },
];

const COLORS = [
  "Black",
  "White",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Beige",
  "Other",
];

const SEASONS = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
];

const STYLES = [
  "Casual",
  "Formal",
  "Sporty",
  "Streetwear",
  "Other",
];

const CameraIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10 4l1.6 4.4L16 10l-4.4 1.6L10 16l-1.6-4.4L4 10l4.4-1.6L10 4z" />
    <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" />
  </svg>
);

const categoryName = {
  tops: "Top",
  pants: "Pants",
  jackets: "Jacket",
  shoes: "Shoes",
};

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 800;

        let width = image.width;
        let height = image.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not process image"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };

      image.onerror = () => {
        reject(new Error("Could not load image"));
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      reject(new Error("Could not read image"));
    };

    reader.readAsDataURL(file);
  });
}

export default function AddClothes({ onAnalyze, onSkip }) {
  const [photos, setPhotos] = useState({
    tops: [],
    pants: [],
    jackets: [],
    shoes: [],
  });

  const [busy, setBusy] = useState(false);
  const inputs = useRef({});
  const photosRef = useRef(photos);

  photosRef.current = photos;

  useEffect(() => {
    return () => {
      Object.values(photosRef.current)
        .flat()
        .forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  const handleFiles = (id) => (e) => {
    const added = Array.from(e.target.files || []).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      color: "",
      season: "",
      style: "",
    }));

    if (added.length) {
      setPhotos((prev) => ({
        ...prev,
        [id]: [...prev[id], ...added],
      }));
    }

    e.target.value = "";
  };

  const updatePhoto = (category, index, field, value) => {
    setPhotos((prev) => ({
      ...prev,
      [category]: prev[category].map((photo, photoIndex) =>
        photoIndex === index
          ? { ...photo, [field]: value }
          : photo
      ),
    }));
  };

  const total = Object.values(photos).reduce(
    (count, list) => count + list.length,
    0
  );

  const handleAnalyze = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    setBusy(true);

    try {
      for (const [category, list] of Object.entries(photos)) {
        for (let index = 0; index < list.length; index++) {
          const photo = list[index];

          const imageData = await compressImage(photo.file);

          const response = await fetch(
            "http://localhost:3001/api/clothes",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                image_url: imageData,
                name: `${categoryName[category]} ${index + 1}`,
                category,
                color: photo.color || null,
                season: photo.season || null,
                style: photo.style || null,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to save clothing item"
            );
          }
        }
      }

      alert(`${total} clothing item(s) added successfully!`);

      await onAnalyze?.();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save clothing items"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="add-screen">
      <h1>Add your clothes</h1>

      <p className="sub">
        Upload photos of your items to feed Drobe's AI.
      </p>

      <div className="grid">
        {CATEGORIES.map(({ id, label }) => {
          const list = photos[id];
          const filled = list.length > 0;

          return (
            <div key={id}>
              <button
                type="button"
                className={`tile${filled ? " filled" : ""}`}
                style={
                  filled
                    ? {
                        backgroundImage: `url(${
                          list[list.length - 1].url
                        })`,
                      }
                    : undefined
                }
                onClick={() => inputs.current[id]?.click()}
                aria-label={
                  filled
                    ? `${label} (${list.length} photos added)`
                    : label
                }
              >
                {filled && (
                  <span className="badge">
                    {list.length}
                  </span>
                )}

                <span className="icon">
                  {id === "tops" ? <CameraIcon /> : <PlusIcon />}
                </span>

                <span className="label">
                  {label}
                </span>
              </button>

              <input
                ref={(element) => {
                  inputs.current[id] = element;
                }}
                className="hidden-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles(id)}
              />

              {list.map((photo, index) => (
                <div className="clothing-details" key={photo.url}>
                  <p className="clothing-details-title">
                    {categoryName[id]} {index + 1}
                  </p>

                  <select
                    value={photo.color}
                    onChange={(e) =>
                      updatePhoto(
                        id,
                        index,
                        "color",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Color</option>
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>

                  <select
                    value={photo.season}
                    onChange={(e) =>
                      updatePhoto(
                        id,
                        index,
                        "season",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Season</option>
                    {SEASONS.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>

                  <select
                    value={photo.style}
                    onChange={(e) =>
                      updatePhoto(
                        id,
                        index,
                        "style",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Style</option>
                    {STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="tip">
        <SparkleIcon />

        <p style={{ margin: 0 }}>
          <strong>Tip:</strong> Take photos against a plain wall.
          Drobe automatically removes backgrounds for beautiful
          inventory views!
        </p>
      </div>

      <div className="actions">
        <button
          className="analyze"
          type="button"
          onClick={handleAnalyze}
          disabled={total === 0 || busy}
        >
          {busy ? "Saving..." : "Analyze Wardrobe"}
        </button>

        <button
          className="skip"
          type="button"
          onClick={onSkip}
          disabled={busy}
        >
          Skip for now
        </button>
      </div>
    </main>
  );
}