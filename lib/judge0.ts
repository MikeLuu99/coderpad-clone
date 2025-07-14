export interface ExecutionResult {
  id: string;
  code: string;
  output: string;
  error?: string;
  status: "running" | "completed" | "failed";
  timestamp: number;
  userId?: string;
  language: string;
}

interface Judge0SubmissionResponse {
  token: string;
}

interface Judge0ResultResponse {
  stdout?: string;
  stderr?: string;
  status_id: number;
  language_id: number;
  compile_output?: string;
}

export class Judge0Service {
  private readonly baseUrl = "https://judge0-ce.p.rapidapi.com";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getLanguageId(language: string): number {
    const languageMap: Record<string, number> = {
      javascript: 63,
      js: 63,
      python: 71,
      py: 71,
      typescript: 74,
      ts: 74,
      go: 95,
      cpp: 54,
      rust: 73,
      java: 62,
      c: 50,
    };

    return languageMap[language.toLowerCase()] || 63; // Default to JavaScript
  }

  private getLanguageName(languageId: number): string {
    const languageMap: Record<number, string> = {
      63: "javascript",
      71: "python",
      95: "go",
      54: "cpp",
      73: "rust",
      62: "java",
      50: "c",
    };

    return languageMap[languageId] || "javascript";
  }

  async executeCode(
    code: string,
    language: string = "javascript",
  ): Promise<ExecutionResult> {
    const executionId = crypto.randomUUID();
    const timestamp = Date.now();
    const languageId = this.getLanguageId(language);

    try {
      // Step 1: Submit code for execution
      const submissionResponse = await this.submitCode(code, languageId);
      const token = submissionResponse.token;

      // Step 2: Poll for results
      const result = await this.pollForResult(token);

      return {
        id: executionId,
        code,
        output: result.stdout || "",
        error: result.stderr || result.compile_output || undefined,
        status: this.getStatus(result.status_id),
        timestamp,
        language: this.getLanguageName(result.language_id),
      };
    } catch (error) {
      return {
        id: executionId,
        code,
        output: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        status: "failed",
        timestamp,
        language,
      };
    }
  }

  private async submitCode(
    code: string,
    languageId: number,
  ): Promise<Judge0SubmissionResponse> {
    const url = `${this.baseUrl}/submissions/?base64_encoded=false&wait=false`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: "",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}, Body: ${errorBody}`,
      );
    }

    return response.json();
  }

  private async pollForResult(token: string): Promise<Judge0ResultResponse> {
    const url = `${this.baseUrl}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,language_id,compile_output`;

    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait time
    const delay = 1000; // 1 second between polls

    while (attempts < maxAttempts) {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error during GET! Status: ${response.status}, Body: ${errorBody}`,
        );
      }

      const result: Judge0ResultResponse = await response.json();

      // Status ID 1 = In Queue, Status ID 2 = Processing
      if (result.status_id !== 1 && result.status_id !== 2) {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }

    throw new Error("Execution timeout - code took too long to execute");
  }

  private getStatus(statusId: number): "running" | "completed" | "failed" {
    // Judge0 status codes:
    // 1: In Queue, 2: Processing, 3: Accepted, 4: Wrong Answer
    // 5: Time Limit Exceeded, 6: Compilation Error, 7-14: Various errors
    switch (statusId) {
      case 1:
      case 2:
        return "running";
      case 3:
        return "completed";
      default:
        return "failed";
    }
  }
}

// Singleton instance
let judge0Service: Judge0Service | null = null;

export function getJudge0Service(): Judge0Service {
  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY environment variable is not set");
  }

  if (!judge0Service) {
    judge0Service = new Judge0Service(apiKey);
  }
  return judge0Service;
}
