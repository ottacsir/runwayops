const pool = require("../config/db");
const createApplication = async (req, res) => {
  try {
    const { show_id } = req.body;
    const model_id = req.user.id;

    if (!show_id) {
      return res.status(400).json({ message: "show_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO model_applications (show_id, model_id)
       VALUES ($1, $2)
       RETURNING *`,
      [show_id, model_id]
    );

    console.log(`[APPLICATION] model ${model_id} applied to show ${show_id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "You already applied to this show" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const model_id = req.user.id;
    const result = await pool.query(
      `SELECT ma.*, s.title AS show_title, s.show_date
       FROM model_applications ma
       JOIN shows s ON ma.show_id = s.id
       WHERE ma.model_id = $1
       ORDER BY ma.applied_at DESC`,
      [model_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getApplicationsByShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const result = await pool.query(
      `SELECT ma.*, u.name AS model_name, u.email AS model_email
       FROM model_applications ma
       JOIN users u ON ma.model_id = u.id
       WHERE ma.show_id = $1
       ORDER BY ma.applied_at ASC`,
      [showId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["applied", "shortlisted", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE model_applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    console.log(`[APPLICATION] application ${id} set to ${status} by user ${req.user.id}`);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationsByShow,
  updateApplicationStatus,
};