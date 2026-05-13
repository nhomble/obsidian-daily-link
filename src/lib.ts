const UNTITLED_PATTERN = /^Untitled( \d+)?$/;

export function isUntitledBasename(basename: string): boolean {
	return UNTITLED_PATTERN.test(basename);
}

export function basenameFromPath(path: string): string {
	const file = path.split("/").pop() ?? "";
	const dot = file.lastIndexOf(".");
	return dot > 0 ? file.slice(0, dot) : file;
}

export function isSameLocalDay(a: number, b: number): boolean {
	const da = new Date(a);
	const db = new Date(b);
	return (
		da.getFullYear() === db.getFullYear() &&
		da.getMonth() === db.getMonth() &&
		da.getDate() === db.getDate()
	);
}

export function isExcluded(path: string, excludedFolders: string[]): boolean {
	return excludedFolders.some((folder) => {
		const normalized = folder.replace(/\/+$/, "");
		if (!normalized) return false;
		return path === normalized || path.startsWith(normalized + "/");
	});
}

export function upsertLink(
	fm: Record<string, unknown>,
	key: string,
	linkText: string,
): void {
	const existing = fm[key];
	if (Array.isArray(existing)) {
		if (!existing.includes(linkText)) existing.push(linkText);
	} else if (existing == null) {
		fm[key] = [linkText];
	} else if (existing !== linkText) {
		fm[key] = [existing, linkText];
	}
}
