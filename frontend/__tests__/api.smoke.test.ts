import { describe, it, expect } from "vitest";

describe("API Routes smoke tests", () => {
  it("chat route file exists", async () => {
    const mod = await import("../app/api/chat/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("itinerary route file exists", async () => {
    const mod = await import("../app/api/itinerary/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("search route file exists", async () => {
    const mod = await import("../app/api/search/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("safety-weather route file exists", async () => {
    const mod = await import("../app/api/safety-weather/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("checkout route file exists", async () => {
    const mod = await import("../app/api/checkout/route");
    expect(typeof mod.POST).toBe("function");
  });

  it("webhook route file exists", async () => {
    const mod = await import("../app/api/webhook/route");
    expect(typeof mod.POST).toBe("function");
  });
});
