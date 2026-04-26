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
