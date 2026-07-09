const pool = require("../config/db");

const createCollection = async (req, res) => {
  try {
    const { show_id, title, description } = req.body;
    const designer_id = req.user.id;

    if (!show_id || !title) {
      return res.status(400).json({ message: "show_id and title are required" });
    }

    const result = await pool.query(
      `INSERT INTO collections (designer_id, show_id, title, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [designer_id, show_id, title, description || null]
    );

    console.log(`[COLLECTION] designer ${designer_id} created collection for show ${show_id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyCollections = async (req, res) => {
  try {
    const designer_id = req.user.id;
    const result = await pool.query(
      `SELECT * FROM collections WHERE designer_id = $1 ORDER BY created_at DESC`,
      [designer_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCollectionsByShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.name AS designer_name
       FROM collections c
       JOIN users u ON c.designer_id = u.id
       WHERE c.show_id = $1
       ORDER BY c.created_at ASC`,
      [showId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["submitted", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE collections SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Collection not found" });
    }

    console.log(`[COLLECTION] collection ${id} set to ${status} by user ${req.user.id}`);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCollection,
  getMyCollections,
  getCollectionsByShow,
  updateCollectionStatus,
};