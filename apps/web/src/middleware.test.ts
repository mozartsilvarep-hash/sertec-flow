import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

describe("SerTec public homepage", () => {
  it("serves the homepage without redirecting to login", () => {
    const response = middleware(
      new NextRequest("https://flow.sertecsolution.com.br/", {
        headers: { host: "flow.sertecsolution.com.br" },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
  it.each(["mcp.kan.bn", "mcp-staging.kan.bn"])(
    "preserves MCP routing for %s",
    (host) => {
      const response = middleware(
        new NextRequest("http://localhost:3000/", { headers: { host } }),
      );
      const target = response.headers.get("x-middleware-rewrite");
      expect(target).not.toBeNull();
      expect(new URL(target ?? "http://invalid.local").pathname).toBe(
        "/api/mcp",
      );
    },
  );
  it.each([
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-authorization-server",
  ])("preserves MCP discovery restrictions for %s", (pathname) => {
    const response = middleware(
      new NextRequest(`http://localhost:3000${pathname}`, {
        headers: { host: "mcp.kan.bn" },
      }),
    );
    expect(response.status).toBe(404);
  });
  it("preserves discovery on the application domain", () => {
    const response = middleware(
      new NextRequest(
        "https://flow.sertecsolution.com.br/.well-known/oauth-protected-resource",
        { headers: { host: "flow.sertecsolution.com.br" } },
      ),
    );
    expect(response.status).toBe(200);
  });
});
