const pool = require("../config/db");
const createLook = async (req, res) => {
  try {
    const { collection_id, look_number, description, image_url } = req.body;

    if (!collection_id || !look_number) {
      return res.status(400).json({ message: "collection_id and look_number are required" });
    }

    const owner = await pool.query(
      `SELECT designer_id FROM collections WHERE id = $1`,
      [collection_id]
    );

    if (owner.rows.length === 0) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (req.user.role !== "admin" && owner.rows[0].designer_id !== req.user.id) {
      return res.status(403).json({ message: "You do not own this collection" });
    }

    const result = await pool.query(
      `INSERT INTO looks (collection_id, look_number, description, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [collection_id, look_number, description || null, image_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Look number already exists in this collection" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getLooksByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const result = await pool.query(
      `SELECT * FROM looks WHERE collection_id = $1 ORDER BY look_number ASC`,
      [collectionId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createLook, getLooksByCollection };