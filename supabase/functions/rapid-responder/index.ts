import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  console.log(
    JSON.stringify({
      event: "rapid_responder_deprecated_hit",
      method: req.method,
      origin: req.headers.get("origin") ?? null,
      userAgent: req.headers.get("user-agent")?.slice(0, 120) ?? null,
    }),
  );

  return new Response(
    JSON.stringify({
      error: "rapid-responder foi descontinuada. Use o endpoint principal de leads do site.",
    }),
    { status: 410, headers: responseHeaders },
  );
});
