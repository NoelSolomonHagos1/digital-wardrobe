const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const ESPOO_LOCATION = {
  name: "Espoon keskus, Espoo",
  latitude: 60.2055,
  longitude: 24.6559,
};

const describeWeatherCode = (code) => {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Current conditions";
};

async function fetchEspooWeather() {
  const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: ESPOO_LOCATION.latitude,
      longitude: ESPOO_LOCATION.longitude,
      current: "temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code",
      wind_speed_unit: "ms",
      timezone: "Europe/Helsinki",
    },
    timeout: 12000,
  });

  return {
    location: ESPOO_LOCATION,
    current: {
      ...response.data.current,
      condition: describeWeatherCode(response.data.current.weather_code),
    },
    units: {
      temperature: response.data.current_units?.temperature_2m || "°C",
      windSpeed: response.data.current_units?.wind_speed_10m || "m/s",
      precipitation: response.data.current_units?.precipitation || "mm",
    },
  };
}

function makeClosetFallback(weather, clothes) {
  if (clothes.length === 0) {
    return {
      title: "Start with your closet",
      reason: "Add a few clothes to your wardrobe and Drobe can suggest a look for Espoo's weather.",
      items: [],
      source: "closet-fallback",
    };
  }

  const temperature = weather?.current?.apparent_temperature ?? weather?.current?.temperature_2m;
  const orderedCategories = [];
  if (temperature !== undefined && temperature < 16) orderedCategories.push("jackets");
  orderedCategories.push("shirts", "tops", "pants", "shoes");
  if (temperature !== undefined && temperature >= 16) orderedCategories.push("jackets");

  const chosen = [];
  for (const category of orderedCategories) {
    const item = clothes.find((entry) =>
      entry.category === category && !chosen.some((selected) => selected.id === entry.id)
    );
    if (item) chosen.push(item);
    if (chosen.length >= 3) break;
  }
  if (chosen.length === 0) chosen.push(...clothes.slice(0, 3));

  return {
    title: "A look from your closet",
    reason: temperature === undefined
      ? "A few pieces from your wardrobe to get you started."
      : `Chosen from your closet for ${weather.current.condition.toLowerCase()} and a feels-like temperature of ${Math.round(temperature)}°C in Espoo.`,
    items: chosen,
    source: "closet-fallback",
  };
}

async function recommendFromCloset(weather, clothes) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || clothes.length === 0 || !weather?.current) return makeClosetFallback(weather, clothes);

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const closetForPrompt = clothes.map(({ id, name, category, color, season, style }) => ({
    id,
    name,
    category: category === "tops" ? "shirts" : category,
    color,
    season,
    style,
  }));
  const prompt = `You are Drobe, a practical menswear outfit stylist. Use only the clothing items listed in the user's closet. Recommend one wearable outfit for the current weather in Espoo, Finland. Prefer a shirt and trousers when available; add a jacket when it is cold or windy, and account for rain or snow. Do not invent garments or claim an item has a feature not listed. Return a short title, one concise reason, and one to four item IDs from the closet as strings. Do not duplicate IDs.\n\nCurrent Espoo weather: ${JSON.stringify(weather?.current || { condition: "not currently available" })}\nCloset items: ${JSON.stringify(closetForPrompt)}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              reason: { type: "STRING" },
              clothesIds: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["title", "reason", "clothesIds"],
          },
          temperature: 0.4,
        },
      },
      { headers: { "x-goog-api-key": apiKey }, timeout: 25000 }
    );

    const outputText = response.data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");
    const result = JSON.parse(outputText || "{}");
    const validIds = new Set(clothes.map((item) => String(item.id)));
    const selectedIds = [...new Set((Array.isArray(result.clothesIds) ? result.clothesIds : [])
      .map(String)
      .filter((id) => validIds.has(id)))].slice(0, 4);
    const items = selectedIds
      .map((id) => clothes.find((item) => String(item.id) === id))
      .filter(Boolean);

    if (items.length === 0) return makeClosetFallback(weather, clothes);
    return {
      title: typeof result.title === "string" ? result.title.slice(0, 80) : "Today's outfit idea",
      reason: typeof result.reason === "string" ? result.reason.slice(0, 280) : "A combination picked from your closet for today's weather.",
      items,
      source: "gemini",
    };
  } catch (error) {
    console.error("Gemini outfit recommendation failed:", error.response?.data?.error?.message || error.message);
    return makeClosetFallback(weather, clothes);
  }
}

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Backend and database are working!",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const token = jwt.sign(
      {
        userId: result.rows[0].id,
        email: result.rows[0].email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

app.get("/api/clothes", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, image_url, name, category, color, season, style, created_at
       FROM clothes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch clothes",
    });
  }
});

app.post("/api/clothes", authenticateToken, async (req, res) => {
  try {
    const {
      image_url,
      name,
      category,
      color,
      season,
      style,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO clothes
       (user_id, image_url, name, category, color, season, style)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, image_url, name, category, color, season, style, created_at`,
      [
        req.user.userId,
        image_url || null,
        name,
        category,
        color || null,
        season || null,
        style || null,
      ]
    );

    res.status(201).json({
      message: "Clothing item added successfully",
      clothing: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add clothing item",
    });
  }
});

app.delete("/api/clothes/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM clothes
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.json({
      message: "Clothing item deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete clothing item",
    });
  }
});

app.post("/api/outfits", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, clothesIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Outfit name is required",
      });
    }

    if (!Array.isArray(clothesIds)) {
      return res.status(400).json({
        message: "Clothing items must be provided as a list",
      });
    }

    const uniqueClothesIds = [...new Set(clothesIds.map(Number))];
    if (uniqueClothesIds.some((id) => !Number.isInteger(id) || id < 1)) {
      return res.status(400).json({
        message: "One or more clothing item IDs are invalid",
      });
    }

    await client.query("BEGIN");

    if (uniqueClothesIds.length > 0) {
      const ownedItems = await client.query(
        "SELECT id FROM clothes WHERE user_id = $1 AND id = ANY($2::bigint[])",
        [req.user.userId, uniqueClothesIds]
      );

      if (ownedItems.rows.length !== uniqueClothesIds.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "An outfit can only contain clothes from your closet",
        });
      }
    }

    const result = await client.query(
      `INSERT INTO outfits (user_id, name)
       VALUES ($1, $2)
       RETURNING id, name, created_at`,
      [req.user.userId, name]
    );

    for (const clothesId of uniqueClothesIds) {
      await client.query(
        "INSERT INTO outfit_clothes (outfit_id, clothes_id) VALUES ($1, $2)",
        [result.rows[0].id, clothesId]
      );
    }

    await client.query("COMMIT");

    const items = await pool.query(
      `SELECT c.id, c.name, c.category, c.image_url
       FROM outfit_clothes oc
       JOIN clothes c ON c.id = oc.clothes_id
       WHERE oc.outfit_id = $1
       ORDER BY c.id`,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: "Outfit created successfully",
      outfit: { ...result.rows[0], items: items.rows },
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(error);

    res.status(500).json({
      message: "Failed to create outfit",
    });
  } finally {
    client.release();
  }
});

app.get("/api/outfits", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.name, o.created_at,
              COALESCE((
                SELECT json_agg(json_build_object(
                  'id', c.id,
                  'name', c.name,
                  'category', c.category,
                  'image_url', c.image_url
                ) ORDER BY c.id)
                FROM outfit_clothes oc
                JOIN clothes c ON c.id = oc.clothes_id
                WHERE oc.outfit_id = o.id
              ), '[]'::json) AS items
       FROM outfits o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch outfits",
    });
  }
});

app.post("/api/wear-history", authenticateToken, async (req, res) => {
  try {
    const { outfit_id, notes } = req.body;

    if (outfit_id) {
      const outfit = await pool.query(
        `SELECT id
         FROM outfits
         WHERE id = $1 AND user_id = $2`,
        [outfit_id, req.user.userId]
      );

      if (outfit.rows.length === 0) {
        return res.status(404).json({
          message: "Outfit not found",
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO wear_history (user_id, outfit_id, notes)
       VALUES ($1, $2, $3)
       RETURNING id, outfit_id, worn_at, notes`,
      [req.user.userId, outfit_id || null, notes || null]
    );

    res.status(201).json({
      message: "Wear history saved",
      wearHistory: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to save wear history",
    });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    res.json(await fetchEspooWeather());
  } catch (error) {
    console.error("Open-Meteo request failed:", error.message);

    res.status(502).json({
      message: "Failed to fetch weather data",
    });
  }
});

app.post("/api/recommendation", authenticateToken, async (req, res) => {
  try {
    const weather = req.body?.weather || null;
    if (weather && (
      !weather.current ||
      !Number.isFinite(weather.current.temperature_2m) ||
      typeof weather.current.condition !== "string"
    )) {
      return res.status(400).json({ message: "Valid current weather is required" });
    }

    const closetResult = await pool.query(
      `SELECT id, name, category, color, season, style, image_url
       FROM clothes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );
    const recommendation = await recommendFromCloset(weather, closetResult.rows);

    res.json({
      recommendation,
      clothesCount: closetResult.rows.length,
    });
  } catch (error) {
    console.error("Overview recommendation failed:", error.message);
    res.status(500).json({
      message: "Could not generate a closet recommendation",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
