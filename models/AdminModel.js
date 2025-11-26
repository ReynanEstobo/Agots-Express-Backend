import pool from "../config/db.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getuser = async () => {
  const [rows] = await pool.query("SELECT * FROM tbadmin");
  return rows;
};

export const createUser = async (username, password) => {
  if (!username || !password) {
    const error = new Error("Username and Password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
    const error = new Error("Password is not strong enough");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    "INSERT INTO tbadmin(username, password) VALUES (?, ?)",
    [username, hashedPassword]
  );

  return { id: result.insertId };
};

export const login = async (username, password) => {
  const [rows] = await pool.query("SELECT * FROM tbadmin WHERE username = ?", [username]);
  const admin = rows[0];

  if (!admin) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = bcrypt.compareSync(password, admin.password);
  if (!isMatch) {
    const error = new Error("Incorrect password");
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign({ id: admin.id }, process.env.SECRET, { expiresIn: "1d" });

  return {
    token,
    id: admin.id,
  };
};

export const getUser = async (ID) => {
  const [rows] = await pool.query("SELECT * FROM tbadmin WHERE id = ?", [ID]);
  return rows[0];
};
