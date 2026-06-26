import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasFirebaseAdminEnv } from "@/lib/firebase-admin";

function maskEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  const [name, domain] = email.split("@");

  if (!domain) {
    return "connected";
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

export async function GET() {
  const session = await auth();

  return NextResponse.json({
    authenticated: Boolean(session?.user?.email),
    user: maskEmail(session?.user?.email),
    firebaseConfigured: hasFirebaseAdminEnv(),
  });
}
