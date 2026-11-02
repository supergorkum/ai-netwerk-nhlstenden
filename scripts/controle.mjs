// DE CONTROLE VOOR ELKE PUBLICATIE (1 november 2026).
//
// Sinds het AI-Netwerk in Claude Code wordt onderhouden, gaat een wijziging
// rechtstreeks in de bestanden en publiceert een push naar GitHub de site
// (Netlify bouwt branch main). Dit script is de poort ervoor: het draait
// vanzelf bij elke git push (scripts/git-hooks/pre-push) en is met de hand
// te draaien met npm run controle. Opzet naar het voorbeeld van Sepupu.
//
// Wat het nakijkt, in deze volgorde:
// 1. APP_VERSIE in src/data.js en de changelog in src/pages/Beheer.jsx
//    horen bij elkaar: de bovenste entry is de enige met versie: APP_VERSIE,
//    de entry eronder heeft een letterlijk, lager nummer. De onderhoudsregel
//    staat in data.js en wordt op de startpagina en in de footer getoond;
// 2. bij een push: raakt de push src/, public/, netlify/ of index.html, dan
//    hoort APP_VERSIE mee te veranderen, want elke zichtbare wijziging krijgt
//    een versie;
// 3. de bouwmap buiten Google Drive wordt bijgewerkt (scripts/bouwmap.mjs);
// 4. eslint: niet meer fouten en waarschuwingen dan het ijkpunt (de oude
//    code heeft er veel; nieuwe mogen er niet bij);
// 5. vite build slaagt;
// 6. scripts/check-versie.sh als hulpmiddel voor het oog: treffers worden
//    getoond maar houden niets tegen (documentversies als "Versie 0.4d" en
//    "AI-beleid v2.0" zijn terecht);
// 7. geen waarde uit .sleutels/*.env (het beheerwachtwoord, oude codes) in
//    een bestand dat git meeneemt of in de gebouwde site. Alleen aantallen
//    worden getoond, nooit de waarde of de regel.
//
// Valt een van 1 tot en met 5 of 7 om, dan gaat de push niet door. Netlify bouwt
// daarna zelf nog een keer; mislukt dat, dan blijft de vorige versie live.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { REPO, BOUW, synchroniseer, afhankelijkheden } from "./bouwmap.mjs";

// Het ijkpunt van 1 november 2026 (eslint 9 net toegevoegd): 149 fouten en 9
// waarschuwingen in oude code, vooral ongebruikte variabelen (no-unused-vars).
// Meer mag niet; worden het er minder, verlaag de getallen dan in dezelfde commit.
const LINT_MAX_FOUTEN = 149;
const LINT_MAX_WAARSCHUWINGEN = 9;

const PUSH = process.argv.includes("--push");
const SNEL = process.argv.includes("--snel");
const fouten = [];
const meld = (t) => console.log("  " + t);

const lees = (rel) => fs.readFileSync(path.join(REPO, rel), "utf8");
const versieUit = (tekst) => (tekst.match(/export const APP_VERSIE = '([^']+)'/) || [])[1];
const alsGetal = (v) => String(v).replace(/^v/, "").split(".").map(Number);
function lager(a, b) {
  const [x, y] = [alsGetal(a), alsGetal(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
  }
  return false;
}

function inhoud() {
  console.log("1. Versie, changelog en onderhoudsregel");
  const data = lees("src/data.js");
  const versie = versieUit(data);
  const datum = (data.match(/export const APP_VERSIE_DATUM = '([^']+)'/) || [])[1];
  if (!versie) return fouten.push("APP_VERSIE niet gevonden in src/data.js");
  if (!datum) fouten.push("APP_VERSIE_DATUM niet gevonden in src/data.js");

  const beheer = lees("src/pages/Beheer.jsx");
  const entries = [...beheer.matchAll(/versie: (APP_VERSIE|'(v[0-9.]+)')/g)].map((m) => m[2] || "APP_VERSIE");
  if (entries[0] !== "APP_VERSIE") fouten.push("de bovenste changelog-entry in Beheer.jsx heeft niet versie: APP_VERSIE");
  if (entries.filter((e) => e === "APP_VERSIE").length > 1) fouten.push("meer dan een changelog-entry heeft versie: APP_VERSIE; zet de vorige op een letterlijk nummer");
  if (entries.includes(versie)) fouten.push("de changelog heeft al een letterlijke entry " + versie + "; hoog APP_VERSIE op");
  const vorige = entries[1];
  if (vorige && !lager(vorige, versie)) fouten.push("APP_VERSIE " + versie + " is niet hoger dan de vorige changelog-entry " + vorige);

  const regel = (data.match(/export const ONDERHOUD_REGEL = '([^']+)'/) || [])[1];
  if (!regel) fouten.push("ONDERHOUD_REGEL ontbreekt in src/data.js");
  else {
    if (!/ONDERHOUD_REGEL/.test(lees("src/pages/Start.jsx"))) fouten.push("de startpagina toont ONDERHOUD_REGEL niet meer");
    if (!/\{ONDERHOUD_REGEL\}/.test(lees("src/components/Footer.jsx"))) fouten.push("de footer toont ONDERHOUD_REGEL niet meer");
  }

  meld("live na publicatie: " + versie + " (" + datum + "), vorige entry " + (vorige || "onbekend"));
}

function pushInhoud() {
  console.log("2. Wat deze push meeneemt");
  let basis;
  try {
    basis = execFileSync("git", ["rev-parse", "--verify", "-q", "origin/main"], { cwd: REPO }).toString().trim();
  } catch {
    meld("origin/main onbekend, stap overgeslagen");
    return;
  }
  const namen = execFileSync("git", ["diff", "--name-only", basis + "..HEAD"], { cwd: REPO }).toString().split("\n").filter(Boolean);
  if (!namen.length) return meld("niets nieuws ten opzichte van origin/main");
  meld(namen.length + " bestand(en) gewijzigd");
  const zichtbaar = namen.filter((n) => n.startsWith("src/") || n.startsWith("netlify/") || n.startsWith("public/") || n === "index.html");
  if (!zichtbaar.length) return meld("alleen bestanden buiten de site; geen nieuwe versie nodig");
  const oud = versieUit(execFileSync("git", ["show", basis + ":src/data.js"], { cwd: REPO }).toString());
  const nieuw = versieUit(execFileSync("git", ["show", "HEAD:src/data.js"], { cwd: REPO }).toString());
  if (oud === nieuw) {
    fouten.push("deze push wijzigt de site (" + zichtbaar.slice(0, 3).join(", ") + (zichtbaar.length > 3 ? ", ..." : "") + ") maar APP_VERSIE blijft " + nieuw + ". Geef de wijziging een versie en een changelog-entry.");
  } else meld("APP_VERSIE " + oud + " -> " + nieuw);
  if (!namen.includes("src/pages/Beheer.jsx")) fouten.push("deze push wijzigt de site maar de changelog in Beheer.jsx niet.");
}

function lint() {
  console.log("4. eslint");
  if (!fs.existsSync(path.join(BOUW, "node_modules/eslint/bin/eslint.js"))) {
    fouten.push("eslint ontbreekt in de bouwmap; draai npm run bouwmap");
    return;
  }
  const r = spawnSync(process.execPath, ["node_modules/eslint/bin/eslint.js", "src", "netlify", "-f", "json"], { cwd: BOUW, maxBuffer: 256 * 1024 * 1024 });
  let rapport;
  try {
    rapport = JSON.parse(r.stdout.toString());
  } catch {
    fouten.push("eslint gaf geen leesbaar antwoord: " + (r.stderr.toString().slice(0, 300) || "onbekend"));
    return;
  }
  let fout = 0;
  let waarsch = 0;
  const regels = {};
  for (const f of rapport) {
    fout += f.errorCount;
    waarsch += f.warningCount;
    for (const m of f.messages) if (m.severity === 2) regels[m.ruleId] = (regels[m.ruleId] || 0) + 1;
  }
  meld(fout + " fouten (ijkpunt " + LINT_MAX_FOUTEN + "), " + waarsch + " waarschuwingen (ijkpunt " + LINT_MAX_WAARSCHUWINGEN + ")");
  if (fout > LINT_MAX_FOUTEN) fouten.push("eslint geeft " + fout + " fouten, meer dan het ijkpunt " + LINT_MAX_FOUTEN + ". Er is iets bijgekomen: " + JSON.stringify(regels));
  if (waarsch > LINT_MAX_WAARSCHUWINGEN) fouten.push("eslint geeft " + waarsch + " waarschuwingen, meer dan het ijkpunt " + LINT_MAX_WAARSCHUWINGEN + ". Er is iets bijgekomen.");
  if (fout < LINT_MAX_FOUTEN || waarsch < LINT_MAX_WAARSCHUWINGEN) meld("minder dan het ijkpunt: verlaag de ijkpunten in scripts/controle.mjs naar " + fout + " en " + waarsch);
}

function bouw() {
  console.log("5. vite build");
  const r = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--logLevel", "error"], { cwd: BOUW, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    const uit = (r.stdout.toString() + r.stderr.toString()).trim().split("\n").slice(-15).join("\n      ");
    fouten.push("vite build is mislukt:\n      " + uit);
  } else meld("gelukt");
}

function losseVersies() {
  console.log("6. Losse versienummers (check-versie.sh, alleen ter informatie)");
  const r = spawnSync("bash", ["scripts/check-versie.sh"], { cwd: REPO });
  const regels = r.stdout.toString().split("\n").filter((l) => l.startsWith("./src/") || l.startsWith(REPO));
  if (r.status === 0) return meld("geen treffers");
  meld(regels.length + " regel(s) met een versie-achtig getal; bekijk of het documentversies zijn:");
  for (const l of regels) meld("  " + l.replace(/^\.\//, "").slice(0, 140));
}

// Waarden uit .sleutels/*.env (KEY=waarde). Korter dan 6 tekens telt niet mee:
// dat geeft alleen loos alarm.
function sleutelwaarden() {
  const map = path.join(REPO, ".sleutels");
  if (!fs.existsSync(map)) return [];
  const uit = [];
  for (const naam of fs.readdirSync(map)) {
    if (!naam.endsWith(".env")) continue;
    for (const regel of fs.readFileSync(path.join(map, naam), "utf8").split("\n")) {
      const m = regel.match(/^([A-Z0-9_]+)=(.+)$/);
      if (m && m[2].trim().length >= 6) uit.push({ naam: m[1], waarde: Buffer.from(m[2].trim()) });
    }
  }
  return uit;
}

function zoekSleutels(stap, basis, bestanden, waar) {
  console.log(stap);
  const waarden = sleutelwaarden();
  if (!waarden.length) return meld("geen .sleutels/*.env gevonden; niets te zoeken");
  let treffers = 0;
  for (const rel of bestanden) {
    let buf;
    try {
      buf = fs.readFileSync(path.join(basis, rel));
    } catch {
      continue;
    }
    for (const w of waarden) {
      if (buf.includes(w.waarde)) {
        treffers++;
        fouten.push("de waarde van " + w.naam + " uit .sleutels/ staat in " + waar + ": " + rel);
      }
    }
  }
  meld(treffers + " treffer(s) in " + bestanden.length + " bestanden (" + waarden.length + " waarden gezocht)");
}

function gitBestanden() {
  return execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: REPO, maxBuffer: 64 * 1024 * 1024 })
    .toString("utf8").split("\0").filter(Boolean);
}

function distBestanden(map, rel = "", uit = []) {
  if (!fs.existsSync(map)) return uit;
  for (const d of fs.readdirSync(map, { withFileTypes: true })) {
    const r = rel ? rel + "/" + d.name : d.name;
    if (d.isDirectory()) distBestanden(path.join(map, d.name), r, uit);
    else if (/\.(html|js|css|json|txt|svg|map)$/i.test(d.name)) uit.push(r);
  }
  return uit;
}

console.log("Controle AI-Netwerk" + (PUSH ? " (voor de push)" : ""));
try {
  inhoud();
  if (PUSH) pushInhoud();
  if (!SNEL) {
    console.log("3. Bouwmap bijwerken");
    synchroniseer();
    afhankelijkheden();
    lint();
    bouw();
  }
  losseVersies();
  zoekSleutels("7. Sleutels in git", REPO, gitBestanden(), "een bestand dat git meeneemt");
  if (!SNEL) zoekSleutels("8. Sleutels in de gebouwde site", path.join(BOUW, "dist"), distBestanden(path.join(BOUW, "dist")), "de gebouwde site");
} catch (e) {
  fouten.push(e.ainetwerk ? e.message : "onverwachte fout: " + (e.stack || e.message || e));
}

if (fouten.length) {
  console.log("");
  console.log("NIET IN ORDE:");
  for (const f of fouten) console.log("  - " + f);
  if (PUSH) console.log("\nDe push is tegengehouden. Er is niets gepubliceerd.");
  process.exit(1);
}
console.log("\nAlles in orde." + (PUSH ? " De push gaat door; Netlify publiceert zodra de bouw daar klaar is." : ""));
