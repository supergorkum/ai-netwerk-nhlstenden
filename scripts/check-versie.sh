#!/usr/bin/env bash
# check-versie.sh
#
# Doel: voorkomen dat er ooit weer een losse "Versie 2.1" of "v2.7" in de
# broncode terechtkomt die niet uit het centrale APP_VERSIE in data.js komt.
# Dat is precies de klasse fout die de footer-badge in v2.7 had, en die de
# hero-badge op de Startpagina nog had staan (versie 2.1, in juni 2026 al
# achterhaald).
#
# Gebruik, na npm run build, vanuit de projectroot:
#   bash scripts/check-versie.sh
#
# Geeft exitcode 0 als er niets verdachts is gevonden, exitcode 1 als er
# regels zijn om te controleren. Dit is een hulpmiddel voor het oog, geen
# harde blokkade: sommige treffers zijn terecht en horen zo te blijven,
# die staan onder "Bekende, bewuste uitzonderingen" hieronder.
#
# Bekende, bewuste uitzonderingen (deze mogen een letterlijk versienummer
# bevatten en worden door dit script daarom niet meegenomen):
#   - Beheer.jsx in zijn geheel: de changelog is met opzet de plek voor
#     versiehistorie, met letterlijke oude versienummers en beschrijvingen
#     die er soms naar teruggrijpen. Alleen de entry met
#     "versie: APP_VERSIE" hoort de huidige versie te tonen; dat controleer
#     je bij een wijziging in dat bestand met het blote oog.
#   - Documentversies die geen appversie zijn, zoals "AI-Koers v0.1" of
#     "AI-beleid v2.0" in Rapport.jsx en data.js. Dat zijn versies van een
#     beleidsdocument, niet van de webapp, en veranderen niet mee met
#     APP_VERSIE.

set -uo pipefail

ROOT="${1:-.}"
SRC="$ROOT/src"

if [ ! -d "$SRC" ]; then
  echo "FOUT: $SRC niet gevonden. Draai dit script vanuit de projectroot, of geef het pad als argument."
  exit 2
fi

# Zoekt naar "versie 2.1", "Versie 2.7" e.d. (tekst zoals die aan de
# gebruiker getoond kan worden) en naar losse "v2.7"-achtige tokens.
#
# Sluit uit:
#   - regels die APP_VERSIE al gebruiken (goed);
#   - Beheer.jsx: de changelog bestaat per ontwerp uit letterlijke oude
#     versienummers en verwijst er in de omschrijvingen ook naar terug.
#     Dat hele bestand is de aangewezen plek voor versiehistorie, dus we
#     scannen het niet mee, anders geeft dit script bij elke toekomstige
#     changelog-regel loos alarm;
#   - documentversies die geen appversie zijn: "AI-Koers v0.1",
#     "AI-beleid v2.0". Die veranderen niet mee met APP_VERSIE en horen
#     letterlijk te blijven staan.
TREFFERS=$(grep -rnE "[Vv]ersie[^A-Za-z0-9]{0,3}[0-9]+\.[0-9]+|\bv[0-9]+\.[0-9]+\b" \
    "$SRC" --include="*.jsx" --include="*.js" 2>/dev/null \
  | grep -v "/Beheer\.jsx:" \
  | grep -v "APP_VERSIE" \
  | grep -viE "AI-Koers v|AI-beleid v" \
  || true)

if [ -z "$TREFFERS" ]; then
  echo "check-versie: geen losse versienummers gevonden buiten APP_VERSIE en de bevroren changelog. Goed zo."
  exit 0
fi

echo "check-versie: onderstaande regels bevatten een versie-achtig getal. Controleer of dit klopt:"
echo "  (bekende, onschuldige categorie: documentversies zoals \"AI-Koers v0.1\", dat is geen appversie)"
echo ""
echo "$TREFFERS"
exit 1
