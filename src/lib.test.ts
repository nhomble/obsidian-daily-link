import { describe, expect, it } from "vitest";
import { isExcluded, upsertLink } from "./lib";

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
