const { spawn } = require("child_process");
const path = require("path");

console.log("\x1b[36m====================================================\x1b[0m");
console.log("\x1b[32m  Starting Pole Watch CSP System (Full Stack)       \x1b[0m");
console.log("\x1b[36m====================================================\x1b[0m");
console.log("  Backend:  http://localhost:4000");
console.log("  Frontend: http://localhost:5173");
console.log("\x1b[90m  Press Ctrl+C to stop both servers.\x1b[0m\n");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const backend = spawn(npmCmd, ["start"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
  shell: true,
});

function cleanup() {
  console.log("\nShutting down servers...");
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
