import { describe, expect, it } from "vitest";
import {
	basenameFromPath,
	isExcluded,
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
