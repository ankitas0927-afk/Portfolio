import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPortfolio, fetchProject } from "@/services/portfolio";

describe("portfolio service", () => {
  afterEach(() => {
    delete process.env.VERCEL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("skips localhost api calls on Vercel and returns a safe fallback", async () => {
    process.env.VERCEL = "1";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5000/api/v1";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPortfolio()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when the API request fails", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/api/v1";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn()
      })
    );

    await expect(fetchProject("demo-project")).resolves.toBeNull();
  });
});
