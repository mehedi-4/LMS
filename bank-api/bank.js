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

// Start server
app.listen(3000, () => {
  console.log("Bank API running on port 3000");
});
