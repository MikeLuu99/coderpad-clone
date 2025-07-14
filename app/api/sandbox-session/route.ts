import { NextRequest, NextResponse } from "next/server";
import { getJudge0Service } from "@/lib/judge0";

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();
    
    if (!code) {
      return new Response("Code is required", { status: 400 });
    }

    const judge0Service = getJudge0Service();
    const result = await judge0Service.executeCode(code, language || "javascript");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Judge0 execution error:", error);
    return new Response(
      error instanceof Error ? error.message : "Failed to execute code", 
      { status: 500 }
    );
  }
}
