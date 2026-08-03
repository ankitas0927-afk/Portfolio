import { describe, expect, it } from "vitest";
import { safeFilename, sanitizeRecord, sanitizeText } from "../src/utils/sanitize.js";

describe("sanitize utilities", () => {
  it("removes markup from text inputs", () => {
    expect(sanitizeText("  <p>Hello</p><script>alert(1)</script> world  ")).toBe("Hello world");
  });

  it("sanitizes strings inside records and arrays", () => {
    expect(
      sanitizeRecord({
        title: "<b>Portfolio</b>",
        tags: ["<i>Design</i>", "Development"],
        nested: { keep: "<span>raw</span>" }
      }),
    ).toEqual({
      title: "Portfolio",
      tags: ["Design", "Development"],
      nested: { keep: "<span>raw</span>" }
    });
  });

  it("creates safe filenames", () => {
    expect(safeFilename("My Resume (Final).pdf")).toBe("My-Resume-Final.pdf");
  });
});
