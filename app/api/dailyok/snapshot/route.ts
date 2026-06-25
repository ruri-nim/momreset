import { NextResponse } from "next/server";
import type { CollectionReference, DocumentData } from "firebase-admin/firestore";
import { auth } from "@/auth";
import { getFirebaseAdminDb, hasFirebaseAdminEnv } from "@/lib/firebase-admin";
import {
  buildProfileDocument,
  buildWeeklyFeedbackFromSnapshot,
  buildWidgetSummary,
  emptySnapshot,
  getAccountKey,
  hasAnySnapshotData,
  hydrateOnboardingProfile,
  normalizeSnapshot,
  toRuleItem,
} from "@/lib/firebase-dailyok";
import type { DietAppSnapshot, DietFoodItem, RuleHistoryEntry, WeightLogItem } from "@/types/diet-app";

async function clearCollection(collection: CollectionReference<DocumentData>) {
  const snapshot = await collection.get();

  if (snapshot.empty) {
    return;
  }

  const batch = collection.firestore.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

async function replaceCollection(
  collection: CollectionReference<DocumentData>,
  docs: Array<{ id: string; data: DocumentData }>,
) {
  await clearCollection(collection);

  if (!docs.length) {
    return;
  }

  const batch = collection.firestore.batch();

  docs.forEach((item) => {
    batch.set(collection.doc(item.id), item.data);
  });

  await batch.commit();
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ enabled: false, authenticated: false, snapshot: emptySnapshot() });
  }

  if (!hasFirebaseAdminEnv()) {
    return NextResponse.json({ enabled: false, authenticated: true, snapshot: emptySnapshot() });
  }

  const accountKey = getAccountKey(session.user.email);

  if (!accountKey) {
    return NextResponse.json({ enabled: false, authenticated: true, snapshot: emptySnapshot() });
  }

  const db = getFirebaseAdminDb();
  const userRef = db.collection("users").doc(accountKey);

  const [profileDoc, foodSnapshot, exerciseSnapshot, ruleTemplateSnapshot, ruleLogSnapshot, weightSnapshot] =
    await Promise.all([
      userRef.collection("profile").doc("main").get(),
      userRef.collection("foodLogs").orderBy("loggedAt", "desc").get(),
      userRef.collection("exerciseLogs").orderBy("loggedAt", "desc").get(),
      userRef.collection("ruleTemplates").orderBy("sortOrder", "asc").get(),
      userRef.collection("ruleLogs").orderBy("date", "desc").get(),
      userRef.collection("weightLogs").orderBy("date", "desc").get(),
    ]);

  const doRules = ruleTemplateSnapshot.docs
    .filter((doc) => doc.data().type === "do" && doc.data().isActive !== false)
    .map((doc) => toRuleItem(doc.id, doc.data()));
  const avoidRules = ruleTemplateSnapshot.docs
    .filter((doc) => doc.data().type === "avoid" && doc.data().isActive !== false)
    .map((doc) => toRuleItem(doc.id, doc.data()));

  const ruleHistory: RuleHistoryEntry[] = ruleLogSnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      date: String(data.date ?? doc.id),
      doRuleStatuses: (data.doRuleStatuses as RuleHistoryEntry["doRuleStatuses"]) ?? {},
      avoidRuleStatuses: (data.avoidRuleStatuses as RuleHistoryEntry["avoidRuleStatuses"]) ?? {},
    };
  });

  const weightHistory: WeightLogItem[] = weightSnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      date: String(data.date ?? ""),
      weightKg: Number(data.weightKg ?? 0),
    };
  });

  const onboardingProfile = hydrateOnboardingProfile(
    profileDoc.exists ? (profileDoc.data() as Record<string, unknown>) : undefined,
  );

  const snapshot: DietAppSnapshot = {
    foodList: foodSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: String(data.name ?? ""),
        calories: Number(data.calories ?? 0),
        mealSection: (data.mealSection as DietFoodItem["mealSection"]) ?? "간식",
        loggedAt: String(data.loggedAt ?? ""),
        portionMultiplier:
          typeof data.portionMultiplier === "number" ? data.portionMultiplier : undefined,
        consumedGrams:
          typeof data.consumedGrams === "number" ? data.consumedGrams : undefined,
        source: (data.source as DietFoodItem["source"]) ?? undefined,
        note: typeof data.note === "string" ? data.note : undefined,
      };
    }),
    doRules,
    avoidRules,
    exerciseLogs: exerciseSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: String(data.name ?? ""),
        minutes: Number(data.minutes ?? 0),
        burnedCalories: Number(data.burnedCalories ?? 0),
        loggedAt: String(data.loggedAt ?? ""),
      };
    }),
    bodyWeightKg:
      weightHistory[0]?.weightKg ?? onboardingProfile?.currentWeightKg ?? 55,
    weightHistory,
    ruleHistory,
    onboardingProfile,
  };

  return NextResponse.json({
    enabled: true,
    authenticated: true,
    hasServerData: hasAnySnapshotData(snapshot),
    snapshot,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }

  if (!hasFirebaseAdminEnv()) {
    return NextResponse.json({ ok: false, enabled: false }, { status: 200 });
  }

  const accountKey = getAccountKey(session.user.email);

  if (!accountKey) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const snapshot = normalizeSnapshot(await request.json());
  const db = getFirebaseAdminDb();
  const userRef = db.collection("users").doc(accountKey);
  const updatedAt = new Date().toISOString();

  const profilePayload = buildProfileDocument({
    accountKey,
    displayName: session.user.name ?? null,
    snapshot,
  });

  if (profilePayload) {
    await userRef.collection("profile").doc("main").set(profilePayload, { merge: true });
  } else {
    await userRef.collection("profile").doc("main").delete().catch(() => {});
  }

  await replaceCollection(
    userRef.collection("foodLogs"),
    snapshot.foodList.map((item) => ({
      id: item.id,
      data: {
        name: item.name,
        calories: item.calories,
        mealSection: item.mealSection,
        loggedAt: item.loggedAt,
        portionMultiplier: item.portionMultiplier ?? 1,
        consumedGrams: item.consumedGrams ?? null,
        source: item.source ?? null,
        note: item.note ?? null,
        updatedAt,
      },
    })),
  );

  await replaceCollection(
    userRef.collection("exerciseLogs"),
    snapshot.exerciseLogs.map((item) => ({
      id: item.id,
      data: {
        name: item.name,
        minutes: item.minutes,
        burnedCalories: item.burnedCalories,
        loggedAt: item.loggedAt ?? updatedAt.slice(0, 10),
        updatedAt,
      },
    })),
  );

  await replaceCollection(
    userRef.collection("ruleTemplates"),
    [
      ...snapshot.doRules.map((item, index) => ({
        id: item.id,
        data: {
          title: item.title,
          type: "do",
          isActive: true,
          sortOrder: index,
          updatedAt,
        },
      })),
      ...snapshot.avoidRules.map((item, index) => ({
        id: item.id,
        data: {
          title: item.title,
          type: "avoid",
          isActive: true,
          sortOrder: index,
          updatedAt,
        },
      })),
    ],
  );

  await replaceCollection(
    userRef.collection("ruleLogs"),
    snapshot.ruleHistory.map((entry) => ({
      id: entry.date,
      data: {
        date: entry.date,
        doRuleStatuses: entry.doRuleStatuses,
        avoidRuleStatuses: entry.avoidRuleStatuses,
        updatedAt,
      },
    })),
  );

  await replaceCollection(
    userRef.collection("weightLogs"),
    snapshot.weightHistory.map((item) => ({
      id: item.id,
      data: {
        date: item.date,
        weightKg: item.weightKg,
        updatedAt,
      },
    })),
  );

  const widgetSummary = buildWidgetSummary(snapshot);
  await userRef.collection("widgetSummary").doc(widgetSummary.date).set(widgetSummary, {
    merge: true,
  });

  const weekly = buildWeeklyFeedbackFromSnapshot(snapshot);
  await userRef.collection("weeklyFeedback").doc(weekly.weekKey).set(
    {
      weekKey: weekly.weekKey,
      summary: weekly.feedback.summary,
      goodJob: weekly.feedback.goodJob,
      watchOut: weekly.feedback.watchOut,
      nextAction: weekly.feedback.nextAction,
      source: "snapshot-fallback",
      generatedAt: updatedAt,
      summaryData: weekly.summary,
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
}
