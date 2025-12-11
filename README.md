## Inspelnings-länk:
https://youtu.be/MZnCi7ZH6pA


# Individuell examination: Strajk bowling

## Bakgrund

Strajk bowling är en nyöppnad bowlinghall i centrala Bromölla. Ägaren K. Ägla gillar tekniska lösningar och har tillsammans med brorsonen Keso Ägla byggt denna webbapp.
Herr Ägla är väldigt nöjd med appen men vill försäkra sig om att den är fortsatt stabil när ny funktionalitet läggs till framöver. Ditt uppdrag är att skriva unit tester med React testing library som sen kan köras för att testa av all funktionalitet när man gör en push till Github.

Du hittar de user stories som har implementerats nedan och som de ska skrivas tester för. Koden hittar du i mappen `Strajk bowling`.

## User stories

### Som användare vill jag kunna boka datum och tid samt ange antal spelare så att jag kan reservera 1 eller flera baner i bowlinghallen.

**Acceptanskriterier:**

- Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem.
- Användaren ska kunna ange antal spelare (minst 1 spelare).
- Användaren ska kunna reservera ett eller flera banor beroende på antal spelare.
- VG - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas
- VG - Om det inte finns tillräckligt med lediga banor för det angivna antalet spelare, ska användaren få ett felmeddelande.

### Som användare vill jag kunna välja skostorlek för varje spelare så varje spelare får skor som passar.

**Acceptanskriterier:**

- Användaren ska kunna ange skostorlek för varje spelare.
- Användaren ska kunna ändra skostorlek för varje spelare.
- Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen.
- VG - Om användaren försöker slutföra bokningen utan att ange skostorlek för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande och be om att skostorleken anges.
- VG - Om antalet personer och skor inte matchas ska ett felmeddelande visas
- Systemet ska visa en översikt där användaren kan kontrollera de valda skostorlekarna för varje spelare innan bokningen slutförs.

### Som användare vill jag kunna ta bort ett fält för skostorlek om jag råkade klicka i ett för mycket så jag inte boka skor i onödan.

**Acceptanskriterier:**

- Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.
- När användaren tar bort skostorleken för en spelare ska systemet uppdatera bokningen så att inga skor längre är bokade för den spelaren.
- Om användaren tar bort skostorleken ska systemet inte inkludera den spelaren i skorantalet och priset för skor i den totala bokningssumman.

### Som användare vill jag kunna skicka iväg min reservation och få tillbaka ett ett bokningsnummer och totalsumma så jag vet hur mycket jag ska betala. (120 kr / person + 100 kr / bana).

**Acceptanskriterier:**

- Användaren ska kunna slutföra bokningen genom att klicka på en "slutför bokning"-knapp.
- Systemet ska generera ett bokningsnummer och visa detta till användaren efter att bokningen är slutförd.
- Systemet ska beräkna och visa den totala summan för bokningen baserat på antalet spelare (120 kr per person) samt antalet reserverade banor (100 kr per bana).
- Den totala summan ska visas tydligt på bekräftelsesidan och inkludera en uppdelning mellan spelare och banor.

### Som användare vill jag kunna navigera mellan boknings-och bekräftelsevyn.

**Acceptanskriterier:**

- Användaren ska kunna navigera från bokningsvyn till bekräftelsevyn när bokningen är klar.
- Om användaren navigerar till bekräftelsevyn och ingen bokning är gjord eller finns i `session storage` ska texten "Ingen bokning gjord visas".
- Om användaren navigerar till bekräftelsevyn och det finns en bokning sparad i `session storage` ska denna visas.

## Betygskriterier

**Får godkänt ska du:**

- Gjort tester i React testing library för alla user stories och acceptanskriter som går grönt när man kör dessa.
- Mockat POST-anrop med Mock service worker.
- Testerna triggas via en Github actions på main-branchen. Det bör alltså finnas en grön bock i ditt Github repo när du lämnar in examinationen.
- Skrivit en kommentar till varje test om vilka acceptanskriterier du har uppfyllt. Du ska ha med alla acceptanskriterier som är för godkänt men du kan kombinera ibland flera acceptanskriterier i ett test.
- Ingen modifikation i koden får göras dock får man lägga till `data-testid` men då ska man också kommentera koden och motivera sitt val varför detta behövs.

**Får Väl Godkänt ska du:**

- Har skrivit tester för alla acceptanskriterier som är VG. Observera att det finns flera unika felmeddelanden och varje felmeddelande ska vara i sitt eget test. Här gäller det också att tänka igenom hur man skriver sina test. Om vi tar, att man ska ha fyllt i allt fält (datum, tid, antalet spelare och banor) så gäller det att testet kollar att felmeddelandet visas för flera kombinationer av vad man glömt att fylla i.
- Du ska ha över 90% coverage i dina tester.

## Inlämning

Lämna in länk till Githubrepo med projektet samt en länk till en inspelning (max 10 min) där du går igenom dina tester med fokus på hur du uppfyller alla acceptanskriterier och hur dessa reflekteras i dina tester på Azomo senast **fredagen 12/12 kl 23:59**.
