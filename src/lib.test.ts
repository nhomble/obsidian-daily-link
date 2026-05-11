import { describe, expect, it } from "vitest";
import {
	basenameFromPath,
	isExcluded,
	isSameLocalDay,
	isUntitledBasename,
	upsertLink,
} from "./lib";

describe("isExcluded", () => {
	it("returns false when no folders configured", () => {
		expect(isExcluded("notes/foo.md", [])).toBe(false);
	});

	it("matches a file directly inside an excluded folder", () => {
		expect(isExcluded("templates/daily.md", ["templates"])).toBe(true);
	});

	it("matches a file in a nested subfolder", () => {
		expect(isExcluded("archive/2025/q1/old.md", ["archive"])).toBe(true);
	});

	it("does not match a folder that is only a prefix of the path segment", () => {
		expect(isExcluded("templates-archive/foo.md", ["templates"])).toBe(
			false,
		);
	});

	it("tolerates trailing slashes in configured folders", () => {
		expect(isExcluded("templates/foo.md", ["templates/"])).toBe(true);
	});

	it("ignores empty entries", () => {
		expect(isExcluded("notes/foo.md", [""])).toBe(false);
	});
});

describe("upsertLink", () => {
	const link = "[[my-note]]";
	const key = "notes";

	it("creates the array when the key is missing", () => {
		const fm: Record<string, unknown> = {};
		upsertLink(fm, key, link);
		expect(fm[key]).toEqual([link]);
	});

	it("appends to an existing array", () => {
		const fm: Record<string, unknown> = { notes: ["[[other]]"] };
		upsertLink(fm, key, link);
		expect(fm[key]).toEqual(["[[other]]", link]);
	});

	it("does not duplicate an existing link", () => {
		const fm: Record<string, unknown> = { notes: [link] };
		upsertLink(fm, key, link);
		expect(fm[key]).toEqual([link]);
	});

	it("converts a scalar value to a two-element array", () => {
		const fm: Record<string, unknown> = { notes: "[[other]]" };
		upsertLink(fm, key, link);
		expect(fm[key]).toEqual(["[[other]]", link]);
	});

	it("leaves a scalar alone if it already equals the link", () => {
		const fm: Record<string, unknown> = { notes: link };
		upsertLink(fm, key, link);
		expect(fm[key]).toBe(link);
	});
});

describe("isUntitledBasename", () => {
	it("matches bare Untitled", () => {
		expect(isUntitledBasename("Untitled")).toBe(true);
	});

	it("matches Untitled with numeric suffix", () => {
		expect(isUntitledBasename("Untitled 1")).toBe(true);
		expect(isUntitledBasename("Untitled 42")).toBe(true);
	});

	it("does not match names that merely start with Untitled", () => {
		expect(isUntitledBasename("Untitled note")).toBe(false);
		expect(isUntitledBasename("UntitledX")).toBe(false);
	});

	it("does not match real titles", () => {
		expect(isUntitledBasename("Meeting notes")).toBe(false);
		expect(isUntitledBasename("")).toBe(false);
	});

	it("is case sensitive", () => {
		expect(isUntitledBasename("untitled")).toBe(false);
	});
});

describe("basenameFromPath", () => {
	it("strips folders and extension", () => {
		expect(basenameFromPath("folder/sub/Untitled.md")).toBe("Untitled");
	});

	it("handles root files", () => {
		expect(basenameFromPath("Untitled 1.md")).toBe("Untitled 1");
	});

	it("returns the name when no extension is present", () => {
		expect(basenameFromPath("folder/Untitled")).toBe("Untitled");
	});

	it("keeps dotfiles intact", () => {
		expect(basenameFromPath(".hidden")).toBe(".hidden");
	});
});

describe("isSameLocalDay", () => {
	it("returns true for identical timestamps", () => {
		const t = new Date(2026, 4, 11, 9, 0, 0).getTime();
		expect(isSameLocalDay(t, t)).toBe(true);
	});

	it("returns true within the same local day", () => {
		const morning = new Date(2026, 4, 11, 0, 5, 0).getTime();
		const evening = new Date(2026, 4, 11, 23, 55, 0).getTime();
		expect(isSameLocalDay(morning, evening)).toBe(true);
	});

	it("returns false across midnight", () => {
		const lastNight = new Date(2026, 4, 10, 23, 59, 0).getTime();
		const today = new Date(2026, 4, 11, 0, 1, 0).getTime();
		expect(isSameLocalDay(lastNight, today)).toBe(false);
	});

	it("returns false across months", () => {
		const apr = new Date(2026, 3, 30, 12, 0, 0).getTime();
		const may = new Date(2026, 4, 1, 12, 0, 0).getTime();
		expect(isSameLocalDay(apr, may)).toBe(false);
	});

	it("returns false across years", () => {
		const dec = new Date(2025, 11, 31, 23, 0, 0).getTime();
		const jan = new Date(2026, 0, 1, 1, 0, 0).getTime();
		expect(isSameLocalDay(dec, jan)).toBe(false);
	});
});
