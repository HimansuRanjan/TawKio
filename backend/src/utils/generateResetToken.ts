import crypto from "crypto";

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { resetToken, hashedToken, expireTime };
};