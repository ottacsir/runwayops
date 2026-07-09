const pool = require("../config/db");

const createShow = async (req, res) => {
  try {
    const { title, venue, show_date } = req.body;
    const organizer_id = req.user.id;

    if (!title || !show_date) {
      return res.status(400).json({ message: "title and show_date are required" });
    }

    const result = await pool.query(
      `INSERT INTO shows (organizer_id, title, venue, show_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [organizer_id, title, venue || null, show_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getShows = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT shows.*, users.name AS organizer_name
       FROM shows
       JOIN users ON shows.organizer_id = users.id
       ORDER BY shows.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT shows.*, users.name AS organizer_name
       FROM shows
       JOIN users ON shows.organizer_id = users.id
       WHERE shows.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Show not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateShowStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["planning", "casting_open", "scheduled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE shows SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Show not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM shows WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Show not found"
      });
    }

    res.json({
      message: "Show deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = { createShow, getShows, getShowById, updateShowStatus, deleteShow };