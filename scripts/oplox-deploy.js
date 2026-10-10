#!/usr/bin/env node
/**
 * Oplox Zero-Boilerplate Deployer
 * Usage:
 *   node path/to/oplox-deploy.js [options]
 * Can be executed from inside any app directory.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const cwd = process.cwd();
const OPLOX_API = process.env.OPLOX_URL || 'http://localhost:5170';

console.log(`\n🚀 [Oplox Deployer] Inspecting project at: ${cwd}`);

function getGitRemote() {
  try {
    const out = execSync('git remote get-url origin', { cwd, encoding: 'utf-8' }).trim();
    return out.replace(/\.git$/, '');
  } catch (e) {
    return 'https://github.com/T-Limbu';
  }
}

function detectProjectMetadata() {
  const dirName = path.basename(cwd);
  const gitUrl = getGitRemote();
  const repoName = path.basename(gitUrl);
  const id = dirName.replace(/^ai-app-|^ai-platform-/, '');

  let name = id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  let tagline = `Autonomous squad application: ${name}.`;
  let category = 'Engineering';
  let startCommand = 'npm run dev';
  let port = 3000;
  let techStack = [];
  let icon = '⚡';
  let iconBg = 'bg-primary/20 text-primary border border-primary/30';

  // Check package.json
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.name) name = pkg.name.replace(/^ai-app-|^ai-platform-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (pkg.description) tagline = pkg.description;

      // Detect tech stack
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps['vue']) techStack.push('Vue 3');
      if (deps['react']) techStack.push('React');
      if (deps['next']) techStack.push('Next.js');
      if (deps['vite']) techStack.push('Vite');
      if (deps['tailwindcss']) techStack.push('Tailwind');
      if (deps['daisyui']) techStack.push('daisyUI');
      if (deps['typescript']) techStack.push('TypeScript');
      if (deps['express']) techStack.push('Express');
      if (deps['@tensorflow/tfjs']) techStack.push('TensorFlow.js');

      // Detect start command
      if (pkg.scripts?.dev) startCommand = 'npm run dev';
      else if (pkg.scripts?.start) startCommand = 'npm start';
    } catch (e) {}
  }

  // Check Python project
  if (fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'main.py'))) {
    techStack.push('Python');
    startCommand = 'python main.py';
    if (fs.existsSync(path.join(cwd, 'main.py'))) {
      const mainContent = fs.readFileSync(path.join(cwd, 'main.py'), 'utf-8');
      if (mainContent.includes('FastAPI')) {
        techStack.push('FastAPI');
        startCommand = 'python -m uvicorn main:app --host 127.0.0.1 --port 8000';
        port = 8000;
      } else if (mainContent.includes('Flask')) {
        techStack.push('Flask');
        port = 5000;
      }
    }
  }

  // Read .env if present for port
  const envPath = path.join(cwd, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
    if (portMatch) {
      port = parseInt(portMatch[1], 10);
    }
  }

  // Check optional oplox.config.json overrides
  const cfgPath = path.join(cwd, 'oplox.config.json');
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (cfg.name) name = cfg.name;
      if (cfg.tagline) tagline = cfg.tagline;
      if (cfg.category) category = cfg.category;
      if (cfg.icon) icon = cfg.icon;
      if (cfg.iconBg) iconBg = cfg.iconBg;
      if (cfg.startCommand) startCommand = cfg.startCommand;
      if (cfg.port) port = cfg.port;
      if (cfg.techStack) techStack = cfg.techStack;
    } catch (e) {}
  }

  const manifest = {
    id,
    name,
    tagline,
    category,
    icon,
    iconBg,
    path: cwd,
    startCommand,
    port,
    url: `http://localhost:${port}`,
    qaUrl: `https://${repoName}-qa.onrender.com`,
    prodUrl: `https://${repoName}.onrender.com`,
    cloudUrl: `https://${repoName}.onrender.com`,
    envMode: 'local',
    githubUrl: gitUrl,
    techStack: techStack.length ? techStack : ['TypeScript', 'Fullstack'],
  };

  return manifest;
}

async function registerToOplox(manifest) {
  console.log(`📦 Manifest Inferred:`);
  console.log(`   • ID:          ${manifest.id}`);
  console.log(`   • Name:        ${manifest.name}`);
  console.log(`   • Start Cmd:   ${manifest.startCommand}`);
  console.log(`   • Port:        ${manifest.port}`);
  console.log(`   • Stack:       ${manifest.techStack.join(', ')}`);
  console.log(`   • GitHub:      ${manifest.githubUrl}\n`);

  try {
    const res = await fetch(`${OPLOX_API}/api/apps/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manifest),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ Registration failed (${res.status}): ${err}`);
      process.exit(1);
    }

    const result = await res.json();
    console.log(`✅ Success! ${manifest.name} is now deployed & registered into Oplox.`);
    console.log(`   Target Oplox: ${OPLOX_API}`);
    console.log(`   Node Status:  ${result.message || 'Active'}\n`);
  } catch (err) {
    console.error(`❌ Could not connect to Oplox daemon at ${OPLOX_API}.`);
    console.error(`   Ensure Oplox is running ('npm run dev' or 'node server/index.js') before registering.\n`);
    process.exit(1);
  }
}

const manifest = detectProjectMetadata();
registerToOplox(manifest);
