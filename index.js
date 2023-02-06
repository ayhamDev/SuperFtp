const electronInstaller = require("electron-winstaller");
async function main() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: "./dist/superftp-win32-x64",
      outputDirectory: "./dist/win-setup",
      setupIcon: "./src/images/icon.ico",
      setupExe: "SuperFtp-setup",
      exe: "superftp.exe",
    });
    console.log("It worked!");
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
}

main();
