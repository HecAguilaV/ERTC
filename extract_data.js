const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('Marketplace_Expertise_Capacidades_y_Necesidades_RobertoSalas.html', 'utf8');

// Use regex to extract the arrays
const needsMatch = content.match(/const needs = (\[\s*\{[\s\S]*?\n\]);/);
const memberOffersMatch = content.match(/const memberOffers = (\[\s*\{[\s\S]*?\n\]);/);

if (!needsMatch || !memberOffersMatch) {
    console.log("Could not find arrays");
    process.exit(1);
}

// Evaluate the string to get JS objects
let needs, memberOffers;
eval(`needs = ${needsMatch[1]}`);
eval(`memberOffers = ${memberOffersMatch[1]}`);

// Process profiles
fs.mkdirSync('src/data/profiles', { recursive: true });
fs.mkdirSync('src/data/needs', { recursive: true });

function slugify(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Update profiles to include the id
memberOffers.forEach(m => {
    const id = slugify(m.name);
    // Add id to the object, and default status_action based on spec
    const obj = { id, ...m, status_action: true }; 
    fs.writeFileSync(`src/data/profiles/${id}.json`, JSON.stringify(obj, null, 2));
});

needs.forEach(n => {
    const slug = `${n.id}-${slugify(n.name)}`;
    fs.writeFileSync(`src/data/needs/${slug}.json`, JSON.stringify(obj=n, null, 2));
});

console.log("Data extracted successfully");
