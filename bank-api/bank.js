import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// MySQL2 Database Pool
const bankDb = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "iammhe",       // your MySQL password
  database: "bank",   // database where `users` table exists
});

// ===============================
//   POST /bank-api/balance
//   Get balance using account_no
// ===============================
app.post("/bank-api/balance", async (req, res) => {
  try {
    const { account_no } = req.body;

    if (!account_no) {
      return res.status(400).json({ error: "account_no is required" });
    }

    const [rows] = await bankDb.execute(
      "SELECT balance FROM users WHERE account_no = ?",
      [account_no]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    return res.json({
      account_no,
      balance: rows[0].balance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Bank API running on port 3000");
});
