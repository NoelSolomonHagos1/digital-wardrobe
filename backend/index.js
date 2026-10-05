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
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Outfit name is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO outfits (user_id, name)
       VALUES ($1, $2)
       RETURNING id, name, created_at`,
      [req.user.userId, name]
    );

    res.status(201).json({
      message: "Outfit created successfully",
      outfit: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create outfit",
    });
  }
});

app.get("/api/outfits", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, created_at
       FROM outfits
       WHERE user_id = $1
       ORDER BY created_at DESC`,
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
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          current: "temperature_2m,precipitation,wind_speed_10m",
        },
      }
    );

    res.json({
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      current: response.data.current,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch weather data",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});