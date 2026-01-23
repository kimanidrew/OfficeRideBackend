import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!; // ensure this is set in .env

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT payload
    const payload = { id: admin.id, email: admin.email, role: admin.role };

    // Sign token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Remove sensitive fields before returning
    const { passwordHash, ...safeAdmin } = admin;

    return NextResponse.json({
      message: "Login successful",
      user: safeAdmin,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
