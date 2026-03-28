import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user exists — same response to prevent enumeration
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { data: { message: "Registrierung verarbeitet." } },
        { status: 200 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        tier: "FREE",
      },
    });

    return NextResponse.json({ data: { message: "Registrierung erfolgreich." } }, { status: 201 });
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
