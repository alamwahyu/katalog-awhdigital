const fs = require("fs");
const path = require("path");

const loadLocalEnv = () => {
  const envPath = path.join(__dirname, ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
};

loadLocalEnv();

const app = require("./app");

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`AWH Digital running at http://localhost:${PORT}`);
});
