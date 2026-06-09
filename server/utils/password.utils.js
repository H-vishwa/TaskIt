import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const keyLength = 64;

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, keyLength);

  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password, storedPassword) => {
  const [salt, storedKey] = storedPassword.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt, keyLength);
  const storedBuffer = Buffer.from(storedKey, "hex");

  return (
    storedBuffer.length === derivedKey.length &&
    crypto.timingSafeEqual(storedBuffer, derivedKey)
  );
};
