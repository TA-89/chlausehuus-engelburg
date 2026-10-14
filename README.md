# Chlausehuus Engelburg – prüfbare Demo

Stand: 14. Oktober 2026. Diese Version ist eine interaktive Demo, kein produktives Anmeldesystem.

## Lokal öffnen

Node.js ab Version 22. Keine Paketinstallation erforderlich.

```sh
npm run dev
```

Danach http://127.0.0.1:4173 öffnen. Die Verwaltung ist unter /admin.html erreichbar. Nicht durch Doppelklick auf index.html starten: JavaScript-Module benötigen einen HTTP-Server.

```sh
npm test
npm run check
```

## In dieser Version bedienbar

- Responsive Einladung mit eigenständig aus dem Nutzerbild abgeleitetem Bild ohne Personen.
- Fünf Formularschritte: Kontakt, beliebig mehrere Familien/Kinder, mögliche Tage mit genau einem Wunschtag und Zeitfenstern, Kindertexte/Dateiauswahl, Prüfung.
- Eine Anfrage pro gemeinsamem Besuch. Duplikathinweis anhand gleicher Adresse, keine blinde Sperre.
- Anfrage in Browser-Sitzung speichern, lokal direkt nach Absenden wieder bearbeiten. Keine kontobasierte Anmeldung.
- Fristenprüfung nach Schweizer Zeit: Unterlagen Ende 26. November; Erinnerung nur am 23.; Anmeldung bis 28. November um 10 Uhr. Nach Unterlagenfrist neue Anfragen nur vollständig. Nach Anmeldeschluss bleibt die Seite sichtbar.
- Verwaltung mit Suche, Statusfiltern, zwei Tagen Antwortfrist, fehlenden Unterlagen und separatem Mailfehlerstatus.
- Termin fixieren ohne Tourenzuordnung; bestätigter Tag und Beginn bleiben geschützt. Bestätigung und Mailzustand sind separate Felder. Simulierter Fehler mit Wiederholung.
- Dauer, Tour und Reihenfolge manuell ändern. Fünf Touren je Tag. Konflikte inklusive angenommener zehn Minuten Wegpuffer, falscher Reihenfolge und mehr als fünf zeitgleichen Besuchen erkennen.
- Touren fixieren/wieder öffnen. Druckansicht mit Familien, Kindern, Texten, Reihenfolge und Platz für die zwei gewählten Männer beim Gant.
- Karte über Leaflet/OpenStreetMap nach explizitem Laden. Erfundenen Beispieldaten sind illustrative Positionen zugeordnet; neue Anfragen ohne Geokodierung bleiben ausdrücklich als «Position fehlt» in der vollständigen Liste. Keine automatische Routenoptimierung.
- Besuchszeiten je Tag anpassen, ohne bestätigte Termine zu ändern.

## Bewusst simuliert – nicht für echte Daten verwenden

Die Verwaltung ist öffentlich und hat **keinen Zugriffsschutz**. Daten liegen ausschliesslich in sessionStorage des jeweiligen Browser-Tabs. Sie sind nicht zwischen Geräten synchronisiert und keine dauerhafte Speicherung. Das Schliessen einer Sitzung kann sie entfernen. Keine Datenbank, Server-API, echte Uploads, persönliche Mail-Links, Mailzustellungen oder automatischen Hintergrundjobs sind angeschlossen.

Dateiauswahl prüft Typ/Grösse und merkt nur Dateinamen, Typ und Grösse; Dateiinhalte werden nicht hochgeladen, gespeichert oder gedruckt. Ein ausgewählter Dateiname zählt nur in dieser ausdrücklich markierten Demo als vorhandene Unterlage. Im Livebetrieb darf erst ein erfolgreich gespeichertes, geprüftes Dokument zählen.

Die Unterlagenbearbeitung in der Demo ist direkt nach dem Absenden möglich; ein späterer Wiederaufruf über einen sicheren Link ist erst Bestandteil des Backends. Ein Admin kann Kindertexte jederzeit korrigieren.

## GitHub Pages

Den Inhalt dieses Ordners als Wurzel eines eigenen Repositorys verwenden. Das private Originalbild im übergeordneten Ordner darf nicht in das Repository gelangen. Der Workflow unter .github/workflows/pages.yml prüft die Fachlogik und veröffentlicht ausschliesslich die explizit aufgelisteten öffentlichen HTML-, CSS-, JS- und Asset-Dateien. Dokumentation, Tests und Screenshots werden nicht Teil der Pages-Seite.

Repository: https://github.com/TA-89/chlausehuus-engelburg

GitHub Pages: https://ta-89.github.io/chlausehuus-engelburg/

Am 14. Oktober 2026 wurde das Repository auf ausdrücklichen Nutzerwunsch öffentlich erstellt, hochgeladen und GitHub Pages mit GitHub Actions aktiviert. Jeder Push auf main führt die Tests aus und veröffentlicht die Demo. Keine eigene Domain wurde registriert. Die öffentliche Verwaltung enthält weiterhin nur Beispieldaten und ist kein geschütztes Produktivsystem.

## Produktionsanschluss

Der geplante API-Vertrag liegt in backend-contract.json. domain.js enthält die separat getesteten Regeln; der Server muss diese erneut erzwingen. Der Browser ist keine Sicherheitsgrenze. store.js ist ausschliesslich Demo-Speicher und muss vor echter Nutzung durch eine Serveranbindung ersetzt werden.

Erforderlich vor dem Start:

1. Datenbank, private Dateiablage und serverseitige API; Backend darf nie öffentlich alle Familien ausgeben. Kein Secret in GitHub Pages.
2. Echte Admin-Authentifizierung mit nur berechtigten Personen, serverseitige Rollenprüfung für jedes Lesen/Ändern, nachvollziehbare Änderungsprotokolle und Backups.
3. Kryptografisch zufällige Bearbeitungstokens pro Anfrage, nur Hash in Datenbank, kontrollierte Lebensdauer und Widerruf. Token in Fragment empfangen, per POST gegen kurze sichere Sitzung tauschen; nicht in Logs, Referrern oder Analytics. Sperre zum Fristende auf dem Server. Admin-Ausnahme explizit prüfen.
4. Private Kinderdateien mit Kind-Zuordnung, serverseitige MIME-/Grössenprüfung, Malwareprüfung, kurzlebige signierte Downloads. Erfolgreicher Upload vor Vollständigkeitsprüfung. Druckpaket muss Dokumentinhalte tatsächlich einschliessen.
5. Verifizierte Absenderadresse und Mailanbieter. Terminfixierung + Outbox-Eintrag atomar speichern; eindeutige Idempotenzschlüssel, Wiederholungen mit Backoff, Zustell-/Fehlerstatus über verifizierte Webhooks. Bei Mailfehler bleibt der Termin fixiert. Kein «versendet» ohne Providerbeleg.
6. Täglicher Job in Europe/Zurich, der NUR am 23. November fehlende Unterlagen erinnert; eindeutiger Versanddatensatz pro Anfrage/Saison verhindert doppelte Erinnerungen. Zwei-Tage-Frist als 48 Stunden umgesetzt.
7. Servertransaktionen/Versionsprüfung gegen parallele Bearbeitung. Bestätigte Zeiten unveränderlich, Änderungen der Tour separat. Kapazitätsprüfung innerhalb derselben Transaktion. Terminänderung nach Bestätigung nur über einen ausdrücklich zu ergänzenden, protokollierten Ausnahmeprozess mit erneuter Familienrückmeldung.
8. Geokodierung und Prüfung der Besuchsadressen auf Engelburg. Aktuell ist Engelburg im Formular fest vorgegeben, die Strassen werden noch nicht gegen ein Register geprüft. Keine automatische Optimierung zusagen.
9. Telefonnummer der Mutter, verantwortliche Kontaktperson, Versandadresse, Datenschutz-/Aufbewahrungsangaben und Domain-Schreibweise ergänzen. Anmeldeöffnung im November exakt festlegen; in der Demo ist das Formular bereits zum Ausprobieren offen.
10. Integrationstests mit echten Testpostfächern und privaten Testdateien, Zugriffstests zwischen Familien, Wiederherstellungstest und Druckprüfung kompletter Touren.

## Gestaltung und Quellen

Ergänzung vom 14. Oktober 2026: Ein einzelner Bildabschnitt zeigt genau einen Samichlaus und einen Schmutzli. Die Nutzerfotos 40232.jpg und 40230.jpg dienen als Referenz; das Gruppenfoto wird nicht veröffentlicht. Rote Mitra mit Goldrand, roter Mantel, Buch und Laterne prägen den Abschnitt. Die Originalfotos bleiben unverändert. Auch künftig auf der gesamten Seite höchstens ein abgebildeter Samichlaus und ein abgebildeter Schmutzli, keine Wiederholungen als dekorative Figuren.

Datei: assets/samichlaus-schmutzli.png, eingebautes Imagegen-Werkzeug, bearbeitet aus 40230.jpg. Prompt:

> Edit this reference photograph into a polished natural editorial photograph for the Chlausehuus Engelburg website. Show EXACTLY ONE Samichlaus and EXACTLY ONE Schmutzli, two people total, no other people, no duplicated figures or reflections. Preserve the recognisable clothing and local tradition from the photo: Samichlaus on left with tall red bishop mitre with gold piping, red cape with gold trim, long white beard, white robe, white gloves, curved bishop staff and red book. Schmutzli on right with black hooded robe, dark curly beard and the glowing warm brass lantern between them, carrying his natural twig bundle. Retain authentic Swiss shingled house facade and softly glowing window, but quietly simplify the background. Reduce motion blur, natural realistic textures, gentle dusk light with the red cape and warm amber lantern as main accents. Portrait 3:4 composition with both characters fully included, dignified and welcoming, not spooky, not commercial American Santa. No typography, no logo, no extra characters, no extra lanterns or mitres. Faithful photographic adaptation, not cartoon or costume redesign.

Gestaltungsrichtung: ruhiger editorialer Advent, warmes Elfenbein, dunkles Tannengrün, zurückhaltendes Bordeaux, grosse Serifenschrift, klare Formulare. Keine zusätzlichen Skills installiert. Die vorhandenen Sites- und Imagegen-Anleitungen wurden verwendet; als Designreferenzen wurden Anthropic frontend-design, OpenAI frontend-app-builder und Vercel Web Interface Guidelines geprüft:

- https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/frontend-app-builder/SKILL.md
- https://github.com/vercel-labs/web-interface-guidelines

Das Wappen bleibt bewusst **noch offen**: Die offizielle Gemeindeseite verlinkt die Dorfkorporation Engelburg (https://www.gaiserwald.ch/verwaltdorfkorpengel → https://www.wasser-engelburg.ch). Dort ist ein DKE-Logo, kein verifiziertes Dorfwappen abgebildet. Das Wappen von Gaiserwald ist kein Ersatz. Das schwarz-goldene Zeichen aus der Nutzerdatei wurde ohne gesicherte Herkunft nicht als Dorfwappen ausgegeben. Zur Vervollständigung wird eine belegte Vorlage benötigt.

hero.png wurde mit dem eingebauten Imagegen-Werkzeug aus Chlausehuus.png abgeleitet. Original unverändert. Verwendeter Prompt:

> Edit target: supplied Chlausehuus invitation. Create a beautiful editorial photographic website hero derived from its rustic wood double door and evergreen wreath. Remove ALL people completely, all lettering, drawn figures, coat of arms, Santa hats and signs. Reconstruct clean natural wooden door. Compose wide 3:2 atmospheric close-up of the historic Swiss wooden door, evergreen wreath with long muted burgundy ribbon, subtle winter evergreen branches, warm lantern light at bottom right. Quiet authentic Swiss Advent mood, natural materials and tactile grain, softly lit in dusk, earthy warm brown, evergreen and burgundy, sophisticated photographic realism, not a cartoon, no snowstorm. No people, no faces, no text, no emblems. This will be shown next to large editorial typography on an ivory website.

Schrift: DM Sans via Google Fonts mit System-Fallback. Karte: Leaflet 1.9.4 via unpkg und OpenStreetMap-Kacheln nur auf Knopfdruck. Vor Produktivstart Schriften lokal bereitstellen und externe Dienste in den Datenschutzhinweisen abbilden.

## Durchgeführte Prüfung

Automatisierte Fachlogiktests und JS-Syntaxprüfung erfolgreich. Im Codex-Browser: vollständige Anfrage mit erfundenen Angaben, Wiederfinden in Verwaltung, Fixieren mit simuliertem Mailfehler, geschützter Beginn, Mailwiederholung, Tourwechsel bei unveränderter Zeit, Tourfixierung und Kartenladen geprüft. Desktopansicht und 390-Pixel-Mobilansicht visuell geprüft; keine horizontale Überbreite auf der Startseite. Browserkonsole nach Formularweg ohne Warnungen/Fehler. Screenshots unter artifacts/ (nicht im Deployment).

Druck-CSS und Tourenblatt sind implementiert; reale Papier-/PDF-Ausgabe und Dateianhänge sind noch nicht abschliessend geprüft. Kein produktiver Anmeldebetrieb und kein tatsächlicher Mailversand sind angeschlossen. Die Veröffentlichung auf GitHub Pages ist ausschliesslich eine öffentliche Demo.

## Aktualisierung 14. Oktober
30 fiktive Demo-Anfragen; bestehende Sitzungen werden ergänzt, Änderungen bleiben erhalten. Besuchsadresse und Spezialwünsche in Schritt 1, Gschenkli in Schritt 2. Kontakt Brigitte Arnold im Impressum und Demo-Mailfuss. Zugehörigkeit zum Verkehrsverein mit geliefertem Logo.
Eigenes Chlausehuus-Zeichen (kein offizielles Gemeindewappen): assets/chlausehuus-zeichen.png, mit eingebautem Imagegen erzeugt. Finaler Prompt: Drei Sterne auf schwarz-goldenem Schild, unterer Stern zweifarbig ohne Kreis, kein Horn, freistehende Burgzacken, leicht schräge rot-weisse Mitra, links Bischofsstab; weisser Bart unmittelbar unter der Mitra in derselben Schräglage, Sterne sichtbar, transparenter Hintergrund.


## Kalender und reduzierte Startseite
Startseite zeigt nur Logo, Spruch, Türbild und Anmeldung. Formular und Impressum werden erst auf Klick sichtbar; kein öffentlicher Verwaltungslink. Die Demo-Verwaltung bleibt ausdrücklich ungeschützt. Ein geheimer Link ersetzt keinen serverseitig geschützten Login vor Echtbetrieb.
Kalender: fünf Gruppen, 15-Minuten-Raster, unverbindliche Wunschvorschläge, Drag-and-drop und Tastaturformular, erlaubte Tage/Zeitfenster, geschützte bestätigte Zeiten, rote Kollisionen inklusive 10 Minuten Puffer. 3–4 Besuche pro Gruppe sind ein Richtwert, kein hartes Limit. Telefon-/Mail-Anfragen können mit mehreren Familien und Kindern manuell erfasst werden, E-Mail ist bei Telefonanfragen optional. Mail-Verfassen öffnet nur einen Entwurf im eigenen Mailprogramm.
