import { NextResponse } from "next/server";
import type { z } from "zod";

const NO_STORE = { "cache-control": "no-store" };

/**
 * Shared POST handler: parse JSON → validate with Zod (400 on failure) → run.
 * If `run` throws despite failing closed internally, `fallback` (an UNKNOWN result) is returned.
 */
export async function handleJsonPost<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
  run: (input: z.output<Schema>) => Promise<unknown>,
  fallback: (input: z.output<Schema>) => unknown,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: NO_STORE });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    return NextResponse.json(await run(parsed.data), { headers: NO_STORE });
  } catch (error) {
    console.error("[api] unexpected failure:", error instanceof Error ? error.message : error);
    return NextResponse.json(fallback(parsed.data), { headers: NO_STORE });
  }
}
