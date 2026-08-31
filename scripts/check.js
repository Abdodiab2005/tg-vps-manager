const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");

function collectFiles(directory, extension) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectFiles(fullPath, extension)
      : entry.name.endsWith(extension)
        ? [fullPath]
        : [];
  });
}

const jsFiles = ["src", "scripts", "test"].flatMap((directory) =>
  collectFiles(path.join(root, directory), ".js")
);

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

const jsonFiles = [
  path.join(root, "package.json"),
  path.join(root, "package-lock.json"),
  ...collectFiles(path.join(root, "locales"), ".json"),
  ...collectFiles(path.join(root, "data"), ".json"),
].filter((file) => fs.existsSync(file));

for (const file of jsonFiles) {
  JSON.parse(fs.readFileSync(file, "utf8"));
}

console.log(`Checked ${jsFiles.length} JavaScript and ${jsonFiles.length} JSON files.`);
