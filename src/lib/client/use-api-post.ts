"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";

export type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; kind: "invalid" | "generic"; message: string }
  /** `sample` = simulated data shown without an API call. `id` changes with every new result. */
  | { status: "success"; data: T; sample: boolean; id: number };

const CLIENT_TIMEOUT_MS = 15_000;
export const ERROR_GENERIC = "Something went wrong. Try again later.";

/**
 * POSTs JSON to one of our own /api/* routes (never to Webacy directly) and re-validates the
 * response. A newer request aborts the previous one; a malformed payload is an error, never SAFE.
 */
export function useApiPost<Schema extends z.ZodType>(endpoint: string, schema: Schema) {
  type Data = z.output<Schema>;
  const [state, setState] = useState<ApiState<Data>>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);
  const lastBodyRef = useRef<unknown>(undefined);
  const idRef = useRef(0);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(
    async (body: unknown) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      lastBodyRef.current = body;
      const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
      const isCurrent = () => controller === controllerRef.current;

      setState({ status: "loading" });
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const json: unknown = await res.json().catch(() => null);
        if (!isCurrent()) return;

        if (res.status === 400) {
          const message =
            json && typeof json === "object" && "message" in json && typeof json.message === "string"
              ? json.message
              : "Invalid format. Check your input.";
          setState({ status: "error", kind: "invalid", message });
          return;
        }
        if (!res.ok) {
          setState({ status: "error", kind: "generic", message: ERROR_GENERIC });
          return;
        }

        const parsed = schema.safeParse(json);
        setState(
          parsed.success
            ? { status: "success", data: parsed.data, sample: false, id: ++idRef.current }
            : { status: "error", kind: "generic", message: ERROR_GENERIC },
        );
      } catch {
        if (isCurrent()) setState({ status: "error", kind: "generic", message: ERROR_GENERIC });
      } finally {
        clearTimeout(timeout);
      }
    },
    [endpoint, schema],
  );

  /** Re-send the last request (the "Try again" button on a failed request). */
  const retry = useCallback(() => {
    if (lastBodyRef.current !== undefined) void run(lastBodyRef.current);
  }, [run]);

  /**
   * Show simulated data without calling the API — sample buttons and the demo. With `delayMs`
   * the loading state is shown first. Cancels any in-flight request, and is cancelled by a newer one.
   */
  const simulate = useCallback((data: Data, delayMs = 0) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const finish = () => setState({ status: "success", data, sample: true, id: ++idRef.current });
    if (delayMs <= 0) {
      finish();
      return;
    }
    setState({ status: "loading" });
    const timer = setTimeout(finish, delayMs);
    controller.signal.addEventListener("abort", () => clearTimeout(timer));
  }, []);

  return { state, run, retry, simulate };
}
