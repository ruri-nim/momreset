import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  generateRuleBasedWeeklyFeedback,
  type WeeklyAiFeedback,
  type WeeklyInsightSummary,
} from "@/lib/weekly-feedback";

function parseFeedbackPayload(text: string) {
  try {
    const parsed = JSON.parse(text) as WeeklyAiFeedback;
    return {
      summary: parsed.summary,
      goodJob: Array.isArray(parsed.goodJob) ? parsed.goodJob.slice(0, 2) : [],
      watchOut: Array.isArray(parsed.watchOut) ? parsed.watchOut.slice(0, 2) : [],
      nextAction: Array.isArray(parsed.nextAction) ? parsed.nextAction.slice(0, 2) : [],
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { summary } = (await request.json()) as { summary?: WeeklyInsightSummary };

    if (!summary) {
      return NextResponse.json({ error: "summary is required" }, { status: 400 });
    }

    const fallback = generateRuleBasedWeeklyFeedback(summary);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ feedback: fallback, source: "fallback" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "너는 한국어 다이어트 코치다. 사용자를 비난하지 말고 짧고 친근하게 말한다. 주어진 데이터만 근거로 말한다. 반드시 JSON만 반환한다.",
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction: {
              coachTone: summary.coachTone ?? "다정하게",
              format: {
                summary: "한 문장 요약",
                goodJob: ["잘한 점 1", "잘한 점 2"],
                watchOut: ["주의할 점 1", "주의할 점 2"],
                nextAction: ["다음 액션 1", "다음 액션 2"],
              },
              limits: {
                maxItemsPerSection: 2,
                maxSentenceLength: 55,
              },
            },
            summary,
          }),
        },
      ],
    });

    const parsed = parseFeedbackPayload(response.output_text || "");

    if (!parsed) {
      return NextResponse.json({ feedback: fallback, source: "fallback" });
    }

    return NextResponse.json({ feedback: parsed, source: "ai" });
  } catch {
    return NextResponse.json(
      {
        feedback: {
          summary: "이번 주 흐름을 읽는 중이에요. 잠시 후 다시 보면 더 또렷해질 수 있어요.",
          goodJob: [],
          watchOut: [],
          nextAction: ["이번 주 기록을 하루 한 번만 더 남겨보세요."],
        },
        source: "fallback",
      },
      { status: 200 },
    );
  }
}
