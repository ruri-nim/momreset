import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFirebaseAdminDb, hasFirebaseAdminEnv } from "@/lib/firebase-admin";
import { getAccountKey } from "@/lib/firebase-dailyok";

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
  const accountKey = getAccountKey(session?.user?.email);
  let firestoreWrite = false;
  let firestoreError: string | null = null;

  if (accountKey && hasFirebaseAdminEnv()) {
    try {
      await getFirebaseAdminDb()
        .collection("users")
        .doc(accountKey)
        .collection("diagnostics")
        .doc("latest")
        .set(
          {
            checkedAt: new Date().toISOString(),
            source: "dailyok-health",
          },
          { merge: true },
        );
      firestoreWrite = true;
    } catch (error) {
      firestoreError = error instanceof Error ? error.message : "unknown firestore error";
    }
  }

  return NextResponse.json({
    authenticated: Boolean(session?.user?.email),
    user: maskEmail(session?.user?.email),
    firebaseConfigured: hasFirebaseAdminEnv(),
    firestoreWrite,
    firestoreError,
  });
}
