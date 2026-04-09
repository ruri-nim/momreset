import OpenAI from "openai";
import { NextResponse } from "next/server";
import { normalizeFoodNames } from "@/lib/food-utils";

export async function POST(request: Request) {
  try {
    const { imageUrl } = (await request.json()) as { imageUrl?: string };

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          foods: [],
          note: "OPENAI_API_KEY가 없어 이미지 분석을 건너뛰었어요.",
        },
        { status: 200 },
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "이미지 속 음식 이름만 간단한 JSON 배열로 반환해줘. 설명 없이 한국어 음식명만 담아줘.",
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const text = response.output_text || "[]";
    let foods: string[] = [];

    try {
      const parsed = JSON.parse(text);
      foods = Array.isArray(parsed) ? parsed : [];
    } catch {
      foods = text.split(",");
    }

    return NextResponse.json({
      foods: normalizeFoodNames(foods),
      note: "분석 결과는 초안이며, 저장 전 사용자가 수정할 수 있어야 해요.",
    });
  } catch {
    return NextResponse.json(
      {
        foods: [],
        error: "이미지 분석 중 오류가 발생했어요.",
      },
      { status: 500 },
    );
  }
}
