import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Find the USER by email (referenced by the Route model)
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { adminProfile: true } 
    });

    // 2. Validate existence and Role
    // Ensure the user exists and has the 'admin' role in the User table
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash!);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Create JWT payload using the USER ID (Satisfies Route_adminId_fkey)
    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // 5. PREVENT FRONTEND CRASH: Combine names into a single 'name' field
    // This fixes the "Cannot read properties of undefined (reading 'split')" in Navbar.tsx
    const { passwordHash, ...safeUser } = user;
    const userWithLegacyFields = {
      ...safeUser,
      name: `${user.firstName} ${user.lastName || ""}`.trim(),
    };

    return NextResponse.json({
      message: "Login successful",
      user: userWithLegacyFields,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
