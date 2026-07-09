const pool = require("../config/db");

const createAssignment = async (req, res) => {
  try {
    const { look_id, model_id, show_id, walk_order } = req.body;

    if (!look_id || !model_id || !show_id || !walk_order) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const application = await pool.query(
      `SELECT status FROM model_applications WHERE show_id = $1 AND model_id = $2`,
      [show_id, model_id]
    );

    if (application.rows.length === 0 || application.rows[0].status !== "accepted") {
      return res.status(400).json({
        message: "Model must have an accepted application for this show before being assigned a look",
      });
    }

    const result = await pool.query(
      `INSERT INTO look_assignments (look_id, model_id, show_id, walk_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [look_id, model_id, show_id, walk_order]
    );

    console.log(`[ASSIGNMENT] organizer ${req.user.id} assigned look ${look_id} to model ${model_id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "That look, model, or walk order is already taken for this show" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getShowScript = async (req, res) => {
  try {
    const { showId } = req.params;

    const result = await pool.query(
      `SELECT la.*, l.description AS look_description, 
              c.title AS collection_title, 
              u.name AS model_name
       FROM look_assignments la
       JOIN looks l ON la.look_id = l.id
       JOIN collections c ON l.collection_id = c.id
       JOIN users u ON la.model_id = u.id
       WHERE la.show_id = $1
       ORDER BY la.walk_order ASC`,
      [showId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createAssignment, getShowScript };