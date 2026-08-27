import {cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync} from "node:fs";
import {execFileSync} from "node:child_process";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist");
const excludedDirectories = new Set([
	".git",
	".github",
	"node_modules",
	"node",
	"scss",
	"test",
	"homebrew",
	"prerelease",
	"spellcheck",
	"dist",
]);

execFileSync("bash", [".github/set-deployed-flag.sh", process.env.CF_PAGES_COMMIT_SHA || "mestrepanda"], {stdio: "inherit"});
execFileSync("bash", [".github/set-img-root.sh", "sitnoveter"], {stdio: "inherit"});

execFileSync("npm", ["run", "build:sw:prod"], {stdio: "inherit"});
execFileSync(
	"npm",
	["run", "build:seo", "--", process.env.CF_PAGES_COMMIT_SHA || "mestrepanda"],
	{
		stdio: "inherit",
		env: {
			...process.env,
			VET_SEO_IS_DEV_MODE: "true",
			VET_BASE_SITE_URL: "https://5e.mestrepanda.com/",
			VET_SEO_IS_SKIP_UA_ETC: "true",
		},
	},
);

rmSync(output, {recursive: true, force: true});
mkdirSync(output, {recursive: true});

for (const name of readdirSync(root)) {
	if (excludedDirectories.has(name)) continue;
	if (name.endsWith(".md") || name.endsWith(".zip")) continue;

	const source = path.join(root, name);
	if (!existsSync(source)) continue;
	const destination = path.join(output, name);
	cpSync(source, destination, {recursive: statSync(source).isDirectory()});
}

console.log("Cloudflare bundle pronto em ./dist");
