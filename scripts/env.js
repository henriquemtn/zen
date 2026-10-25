// Turns the repo-root .env into app/env.js so the static app can read it as window.ZEN_ENV.
// Run after editing .env: `node scripts/env.js` (build.py runs it for you).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'app', 'env.js');

function parse(text) {
    const env = {};
    text.split(/\r?\n/).forEach(function (line) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    });
    return env;
}

const sample = parse('# comment\nA=1\r\nB = "two words"\nC=\'x\'\nbad line');
console.assert(sample.A === '1' && sample.B === 'two words' && sample.C === 'x' && Object.keys(sample).length === 3, 'env parser self-check failed');

if (!fs.existsSync(envPath)) {
    console.log('[env] No .env found, skipping app/env.js');
    process.exit(0);
}
const env = parse(fs.readFileSync(envPath, 'utf8'));
fs.writeFileSync(outPath, '// Generated from .env by scripts/env.js. Do not commit.\nwindow.ZEN_ENV = ' + JSON.stringify(env) + ';\n');
console.log('[env] Wrote app/env.js with: ' + Object.keys(env).join(', '));
