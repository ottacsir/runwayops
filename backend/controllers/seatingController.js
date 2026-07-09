const pool = require("../config/db");

const createSeating = async (req, res) => {
  try {
    const { show_id, guest_id, seat_section, seat_number } = req.body;

    if (!show_id || !guest_id || !seat_section || !seat_number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await pool.query(
      `INSERT INTO seating_assignments (show_id, guest_id, seat_section, seat_number)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [show_id, guest_id, seat_section, seat_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "That seat or guest is already assigned for this show" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ message: "That guest does not exist as a registered user" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSeatingByShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const result = await pool.query(
      `SELECT sa.*, u.name AS guest_name
       FROM seating_assignments sa
       JOIN users u ON sa.guest_id = u.id
       WHERE sa.show_id = $1
       ORDER BY sa.seat_section, sa.seat_number ASC`,
      [showId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createSeating, getSeatingByShow };