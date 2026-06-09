import jwt from "jsonwebtoken";
import dns from "dns";
import { promisify } from "util";
import User from "../users/user.model.js";
import { hashPassword, verifyPassword } from "../../utils/password.utils.js";

const resolveMx = promisify(dns.resolveMx);

/**
 * Validates that the email domain has real MX (Mail Exchange) records.
 * Only domains with MX records are capable of receiving email.
 * NOTE: We intentionally do NOT fall back to A records — a domain like
 * example.com has an A record but no MX records, so it cannot receive email.
 */
const validateEmailDomain = async (email) => {
  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const mxRecords = await resolveMx(domain);
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch {
    // DNS lookup failed or no MX records found — domain cannot receive email
    return false;
  }
};

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate email domain via DNS MX / A record lookup
    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({ message: "Email domain does not exist or cannot receive emails" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }


    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

export const getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
};
