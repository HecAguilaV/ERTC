const fs = require('fs');
let c = fs.readFileSync('Marketplace_Expertise_Capacidades_y_Necesidades_RobertoSalas.html', 'utf8');

const regex = /const needs = \[[\s\S]*?\];\s*const memberOffers = \[[\s\S]*?\];/;

const newCode = `let needs = [];
let memberOffers = [];

async function loadData() {
  try {
    const indexRes = await fetch('./src/data/index.json');
    if (!indexRes.ok) throw new Error('Error loading index');
    const index = await indexRes.json();

    const needsPromises = index.needs.map(n => fetch(\`./src/data/needs/\${n}.json\`).then(r => r.json()));
    const profilesPromises = index.profiles.map(p => fetch(\`./src/data/profiles/\${p}.json\`).then(r => r.json()));

    needs = await Promise.all(needsPromises);
    memberOffers = await Promise.all(profilesPromises);

    buildNeedsView();
    buildMembersView();
    buildCoverage();
  } catch (err) {
    console.error('Error fetching data:', err);
    document.getElementById('needsCloud').innerHTML = '<div style="color:red; text-align:center; width:100%">Error cargando datos.<br><br>Si ves esto localmente necesitas un servidor de desarrollo porque los navegadores bloquean "file://" (CORS). Usa "npx serve".</div>';
  }
}`;

c = c.replace(regex, newCode);

c = c.replace('buildNeedsView();\r\nbuildMembersView();\r\nbuildCoverage();', 'loadData();');
c = c.replace('buildNeedsView();\nbuildMembersView();\nbuildCoverage();', 'loadData();');

fs.writeFileSync('Marketplace_Expertise_Capacidades_y_Necesidades_RobertoSalas.html', c);
console.log('Replaced successfully');
