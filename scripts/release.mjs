import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const bump = process.argv[2];
if (!bump) {
	console.error(
		"Usage: npm run release -- <patch|minor|major|x.y.z>",
	);
	process.exit(1);
}

execSync(`npm version ${bump}`, { stdio: "inherit" });

const { version } = JSON.parse(readFileSync("manifest.json", "utf8"));

execSync("git push --follow-tags", { stdio: "inherit" });
execSync("npm run build", { stdio: "inherit" });
execSync(
	`gh release create ${version} main.js manifest.json --title ${version} --notes "Release ${version}"`,
	{ stdio: "inherit" },
);
