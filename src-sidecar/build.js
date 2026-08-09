const { build } = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');

async function run() {
  console.log('[1/2] Building Sidecar with esbuild...');
  await build({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/sidecar.js',
    external: ['sqlite3', 'better-sqlite3', 'electron', 'sharp'] // Bỏ qua native modules
  });

  console.log('[2/2] Packaging with pkg...');
  // Tauri expects the binary to be named: <name>-<target_triple>.exe
  // Target triple for Windows 64-bit is x86_64-pc-windows-msvc
  execSync('npx pkg dist/sidecar.js --targets node18-win-x64 --output dist/sidecar-x86_64-pc-windows-msvc.exe', { stdio: 'inherit' });
  
  console.log('✅ Sidecar Build Complete!');
}

run();
