import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Get all approved properties (for Guest Users/End Users)
router.get("/properties", async (req, res) => {
    try {
        const { city, gender, type } = req.query;

        let query = `
      SELECT p.*, o.name as owner_name 
      FROM properties p 
      JOIN owners o ON p.owner_id = o.id 
      WHERE p.is_approved = true
    `;
        const params = [];

        if (city) {
            params.push(`%${city}%`);
            query += ` AND p.city ILIKE $${params.length}`;
        }
        if (gender && gender !== 'all') {
            params.push(gender);
            query += ` AND p.gender = $${params.length}`;
        }
        if (type && type !== 'all') {
            params.push(type);
            query += ` AND p.property_type = $${params.length}`;
        }

        const { rows } = await pool.query(query, params);
        res.json({ properties: rows });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;

