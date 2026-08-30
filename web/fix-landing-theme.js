const fs = require('fs');
const path = require('path');

const dir = 'c:/Projects/ner-Logistics-/web/src/pages/Landing/components';

const replacements = [
    ['bg-[#060A14]', 'bg-landing-bg'],
    ['bg-[#080D18]', 'bg-landing-bg-alt'],
    ['bg-[#080E1A]', 'bg-landing-bg-alt'],
    ['bg-[#0A101D]', 'bg-landing-bg'],
    ['bg-[#0D1626]', 'bg-landing-surface'],
    ['bg-[#070C16]', 'bg-landing-surface-deep'],
    ['bg-[#09101E]', 'bg-landing-surface-deep'],
    ['bg-[#050811]', 'bg-landing-surface-deep'],
    ['bg-[#060A12]', 'bg-landing-surface-deep'],
    ['bg-[#091526]', 'bg-landing-surface-deep'],
    ['bg-[#0A1220]', 'bg-landing-surface-deep'],
    ['bg-[#0F0A12]', 'bg-landing-surface-deep'],
    ['border-white/10', 'border-landing-border'],
    ['border-white/5', 'border-landing-border-subtle'],
    ['border-white/15', 'border-landing-border'],
    ['text-white', 'text-landing-heading'],
];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'LandingNavbar.tsx');

files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([from, to]) => {
        content = content.split(from).join(to);
    });
    fs.writeFileSync(filePath, content);
    console.log('Updated:', f);
});

console.log('Done! Updated', files.length, 'files');
