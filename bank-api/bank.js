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

// Initialize transactions table if it doesn't exist
async function initializeTransactionsTable() {
  try {
    const connection = await bankDb.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        from_account_no VARCHAR(50),
        to_account_no VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type ENUM('debit', 'credit') NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_from_account (from_account_no),
        INDEX idx_to_account (to_account_no),
        INDEX idx_created_at (created_at)
      )
    `);
    connection.release();
  } catch (error) {
    console.error("Error initializing transactions table:", error);
  }
}

// Initialize on startup
initializeTransactionsTable();

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

// ===============================
//   POST /bank-api/transfer
//   Transfer money from student to LMS
// ===============================
app.post("/bank-api/transfer", async (req, res) => {
  const connection = await bankDb.getConnection();
  
  try {
    await connection.beginTransaction();

    const { from_account_no, secret_key, amount } = req.body;

    if (!from_account_no || !secret_key || !amount) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "from_account_no, secret_key, and amount are required" 
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "Amount must be a positive number" 
      });
    }

    const LMS_ACCOUNT = "9999999999999999";

    // Verify student account and secret key
    const [studentRows] = await connection.execute(
      "SELECT balance FROM users WHERE account_no = ? AND secret_key = ?",
      [from_account_no, secret_key]
    );

    if (studentRows.length === 0) {
      await connection.rollback();
      return res.status(401).json({ 
        success: false,
        error: "Invalid account number or secret key" 
      });
    }

    const studentBalance = parseFloat(studentRows[0].balance);

    // Check if student has sufficient balance
    if (studentBalance < parsedAmount) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "Insufficient balance" 
      });
    }

    // Verify LMS account exists
    const [lmsRows] = await connection.execute(
      "SELECT balance FROM users WHERE account_no = ?",
      [LMS_ACCOUNT]
    );

    if (lmsRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        error: "LMS account not found" 
      });
    }

    const lmsBalance = parseFloat(lmsRows[0].balance);

    // Deduct from student account
    await connection.execute(
      "UPDATE users SET balance = balance - ? WHERE account_no = ?",
      [parsedAmount, from_account_no]
    );

    // Add to LMS account
    await connection.execute(
      "UPDATE users SET balance = balance + ? WHERE account_no = ?",
      [parsedAmount, LMS_ACCOUNT]
    );

    // Record transaction (one record for the transfer)
    await connection.execute(
      "INSERT INTO transactions (from_account_no, to_account_no, amount, transaction_type, description) VALUES (?, ?, ?, 'debit', ?)",
      [from_account_no, LMS_ACCOUNT, parsedAmount, `Course payment to LMS`]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Payment processed successfully",
      from_account_no,
      to_account_no: LMS_ACCOUNT,
      amount: parsedAmount,
      new_balance: studentBalance - parsedAmount,
    });

  } catch (error) {
    await connection.rollback();
    console.error("Transfer error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error during transfer" 
    });
  } finally {
    connection.release();
  }
});

// ===============================
//   POST /bank-api/transfer-lms-to-instructor
//   Transfer money from LMS to instructor account
// ===============================
app.post("/bank-api/transfer-lms-to-instructor", async (req, res) => {
  const connection = await bankDb.getConnection();
  
  try {
    await connection.beginTransaction();

    const { to_account_no, amount } = req.body;

    if (!to_account_no || !amount) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "to_account_no and amount are required" 
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "Amount must be a positive number" 
      });
    }

    const LMS_ACCOUNT = "9999999999999999";

    // Verify LMS account exists and has sufficient balance
    const [lmsRows] = await connection.execute(
      "SELECT balance FROM users WHERE account_no = ?",
      [LMS_ACCOUNT]
    );

    if (lmsRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        error: "LMS account not found" 
      });
    }

    const lmsBalance = parseFloat(lmsRows[0].balance);

    if (lmsBalance < parsedAmount) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "LMS account has insufficient balance" 
      });
    }

    // Verify instructor account exists
    const [instructorRows] = await connection.execute(
      "SELECT balance FROM users WHERE account_no = ?",
      [to_account_no]
    );

    if (instructorRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        error: "Instructor account not found" 
      });
    }

    const instructorBalance = parseFloat(instructorRows[0].balance);

    // Deduct from LMS account
    await connection.execute(
      "UPDATE users SET balance = balance - ? WHERE account_no = ?",
      [parsedAmount, LMS_ACCOUNT]
    );

    // Add to instructor account
    await connection.execute(
      "UPDATE users SET balance = balance + ? WHERE account_no = ?",
      [parsedAmount, to_account_no]
    );

    // Record transaction (one record for the transfer)
    await connection.execute(
      "INSERT INTO transactions (from_account_no, to_account_no, amount, transaction_type, description) VALUES (?, ?, ?, 'credit', ?)",
      [LMS_ACCOUNT, to_account_no, parsedAmount, `Course revenue share (50%)`]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Payment processed successfully",
      from_account_no: LMS_ACCOUNT,
      to_account_no,
      amount: parsedAmount,
      lms_new_balance: lmsBalance - parsedAmount,
      instructor_new_balance: instructorBalance + parsedAmount,
    });

  } catch (error) {
    await connection.rollback();
    console.error("Transfer error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error during transfer" 
    });
  } finally {
    connection.release();
  }
});

// ===============================
//   GET /bank-api/transactions/:account_no
//   Get all transactions for an account
// ===============================
app.get("/bank-api/transactions/:account_no", async (req, res) => {
  try {
    const { account_no } = req.params;

    if (!account_no) {
      return res.status(400).json({ 
        success: false,
        error: "account_no is required" 
      });
    }

    // Get all transactions where account is involved (as sender or receiver)
    const [transactions] = await bankDb.execute(
      `SELECT 
        id,
        from_account_no,
        to_account_no,
        amount,
        transaction_type,
        description,
        created_at,
        CASE 
          WHEN from_account_no = ? THEN 'outgoing'
          WHEN to_account_no = ? THEN 'incoming'
        END AS direction
      FROM transactions
      WHERE from_account_no = ? OR to_account_no = ?
      ORDER BY created_at DESC
      LIMIT 100`,
      [account_no, account_no, account_no, account_no]
    );

    return res.json({
      success: true,
      transactions: transactions,
    });

  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Bank API running on port 3000");
});
