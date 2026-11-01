// DE LOKALE PROEF (1 november 2026).
//
// Start de site op http://127.0.0.1:5173 vanuit de bouwmap buiten Google
// Drive, en houdt die bouwmap bij terwijl je in de projectmap werkt: elke
// opgeslagen wijziging staat binnen een seconde in de proef.
//
// LET OP: de Netlify Functions (centrale opslag, koers-feedback, rapport,
// nieuws) draaien in de proef niet. Er is ook geen proxy naar de live site,
// want die staat achter een wachtwoord. De pagina's tonen daarom de
// startgegevens uit src/initialData.js; wat je in Beheer opslaat, komt
// nergens terecht. Voor het uiterlijk en de teksten is de proef betrouwbaar,
// voor opslag en rapporten niet.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { REPO, BOUW, synchroniseer, afhankelijkheden } from "./bouwmap.mjs";

const POORT = process.env.PORT || "5173";

try {
  synchroniseer();
  afhankelijkheden();
} catch (e) {
  console.error("GESTOPT: " + e.message);
  process.exit(1);
}

const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", POORT, "--strictPort"], {
  cwd: BOUW,
  stdio: "inherit",
});
vite.on("exit", (code) => process.exit(code ?? 0));

// Bijhouden. Een korte pauze vangt een reeks opslagacties in een keer op.
let klok = null;
const OVERSLAAN = /(^|\/)(\.git|node_modules|dist|\.netlify)(\/|$)/;
try {
  fs.watch(REPO, { recursive: true }, (_soort, naam) => {
    if (naam && OVERSLAAN.test(String(naam).split(path.sep).join("/"))) return;
    clearTimeout(klok);
    klok = setTimeout(() => {
      try {
        const r = synchroniseer({ stil: true });
        if (r.gekopieerd || r.verwijderd) console.log("[ai-netwerk] proef bijgewerkt: " + r.gekopieerd + " bestand(en)");
        if (afhankelijkheden()) console.log("[ai-netwerk] afhankelijkheden opnieuw geinstalleerd; herstart de proef als iets niet laadt");
      } catch (e) {
        console.error("[ai-netwerk] bijwerken mislukt: " + e.message);
      }
    }, 300);
  });
} catch (e) {
  console.error("[ai-netwerk] meekijken met de projectmap lukt niet (" + e.message + "); draai na een wijziging npm run bouwmap.");
}

for (const sein of ["SIGINT", "SIGTERM"]) process.on(sein, () => vite.kill(sein));
