import { describe, expect, it } from "vitest";
import { addDays, createDefaultEcosystem, isFeatureReleased, nextReleaseDate, normalizeEcosystem } from "./ecosystem";

describe("persistent feature release dates", () => {
  it("advances the shared 10-day release cadence from its stored initial date", () => {
    const initial = "2026-01-01";
    expect(addDays(initial, 10)).toBe("2026-01-11");
    expect(nextReleaseDate(initial, 10, "2026-01-10")).toBe("2026-01-11");
    expect(nextReleaseDate(initial, 10, "2026-01-11")).toBe("2026-01-21");
  });

  it("appends each catalogue item once while normalizing saved browser data", () => {
    const defaults = createDefaultEcosystem("2026-01-01");
    const duplicate = defaults.features[0];
    const normalized = normalizeEcosystem({ features: [duplicate, duplicate] });
    expect(normalized.features.filter((feature) => feature.id === duplicate.id)).toHaveLength(1);
    expect(normalized.features.length).toBe(defaults.features.length);
  });

  it("does not release future batches early or while paused", () => {
    const future = { ...createDefaultEcosystem("2026-01-01").features[0], releaseDate: "2026-01-11" };
    expect(isFeatureReleased(future, "2026-01-10", false, "2026-01-01")).toBe(false);
    expect(isFeatureReleased(future, "2026-01-11", true, "2026-01-01")).toBe(false);
    expect(isFeatureReleased(future, "2026-01-11", false, "2026-01-01")).toBe(true);
  });
});