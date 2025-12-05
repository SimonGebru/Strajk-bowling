// Här testar jag user storyn:
// "Som användare vill jag kunna boka datum och tid samt ange antal spelare
//  så att jag kan reservera 1 eller flera baner i bowlinghallen."
//
// Fokus i den här filen:
// - Att alla inputs som behövs för bokning faktiskt finns (datum, tid, antal spelare, antal banor).
// - Att rätt felmeddelande visas om man försöker boka utan att fylla i något.
// - Att rätt felmeddelande visas om man försöker boka för många spelare per bana (VG-del).

import { test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Booking from "./Booking";

// Gemensam helper för att rendera Booking med Router.
// Booking använder navigation, så jag wrappar den i MemoryRouter
// så att komponenten funkar även i testmiljön.
function renderBooking() {
  return render(
    <MemoryRouter>
      <Booking />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------
// TEST 1: Kollar att alla inputs för bokningen finns på sidan
//
// AC-koppling:
// - "Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem."
// - "Användaren ska kunna ange antal spelare (minst 1 spelare)."
// - "Användaren ska kunna reservera ett eller flera banor beroende på antal spelare."
//
// Tanke:
// Här bryr jag mig inte om värdena, utan bara om att själva fälten
// (datum, tid, antal spelare, antal banor) finns i DOM:en.
test("renderar inputfält/sektioner för datum, tid, antal spelare och antal banor", () => {
  renderBooking();

  // Plockar ut label-texterna som används i BookingInfo.jsx
  const dateLabel = screen.getByText(/Date/i);
  const timeLabel = screen.getByText(/Time/i);
  const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
  const lanesLabel = screen.getByText(/Number of lanes/i);

  // I den här koden är inte label kopplad till input med htmlFor/id,
  // så jag går från label → parent (section.input) → letar upp input där inne.
  const dateInput = dateLabel.parentElement.querySelector("input");
  const timeInput = timeLabel.parentElement.querySelector("input");
  const peopleInput = peopleLabel.parentElement.querySelector("input");
  const lanesInput = lanesLabel.parentElement.querySelector("input");

  // Förväntan: alla fyra inputs ska finnas.
  expect(dateInput).toBeInTheDocument();
  expect(timeInput).toBeInTheDocument();
  expect(peopleInput).toBeInTheDocument();
  expect(lanesInput).toBeInTheDocument();
});

// ---------------------------------------------------------------------
// TEST 2: Försöker boka utan att fylla i något → ska få generellt felmeddelande
//
// AC-koppling (VG-del):
// - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas"
//
// Tanke:
// Jag klickar direkt på "strIIIIIike!" utan att fylla i ett enda fält.
// Då ska det generella felmeddelandet från Booking.jsx visas.
test("visar felmeddelande om användaren försöker boka utan att fylla i alla fält", async () => {
  renderBooking();
  const user = userEvent.setup();

  // Hämta knappen "strIIIIIike!" (kommer från Booking.jsx)
  const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });

  // Jag fyller inte i något alls, bara klickar direkt.
  await user.click(bookButton);

  // Förväntat felmeddelande enligt Booking.jsx
  const errorMessage = await screen.findByText(
    /Alla fälten måste vara ifyllda/i
  );

  expect(errorMessage).toBeInTheDocument();
});

// ---------------------------------------------------------------------
// TEST 3: För många spelare per bana → specifikt felmeddelande
//
// AC-koppling (VG:
// - Om det inte finns tillräckligt med lediga banor för det angivna
//    antalet spelare, ska användaren få ett felmeddelande."
//
// Tanke:
// Här vill jag komma åt just regeln "max 4 spelare per bana".
// För att komma dit måste alla andra valideringar passera först:
//   - Alla fält ifyllda (datum, tid, spelare, banor)
//   - Antalet skor måste matcha antal spelare
//   - Alla skor måste ha storlek
// Så i testet fyller jag i allt korrekt, utom att jag medvetet väljer
// för få banor i förhållande till antalet spelare (5 spelare, 1 bana).
test("visar felmeddelande om man försöker boka fler än 4 spelare per bana", async () => {
  renderBooking();
  const user = userEvent.setup();

  // Hämta label-elementen för bokningsfälten (samma approach som i första testet)
  const dateLabel = screen.getByText(/Date/i);
  const timeLabel = screen.getByText(/Time/i);
  const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
  const lanesLabel = screen.getByText(/Number of lanes/i);

  // Inputs inuti respektive sektion
  const dateInput = dateLabel.parentElement.querySelector("input");
  const timeInput = timeLabel.parentElement.querySelector("input");
  const peopleInput = peopleLabel.parentElement.querySelector("input");
  const lanesInput = lanesLabel.parentElement.querySelector("input");

  // Fyller i giltiga värden i alla fält
  await user.type(dateInput, "2025-12-20");
  await user.type(timeInput, "18:00");
  await user.type(peopleInput, "5"); // 5 spelare
  await user.type(lanesInput, "1");  // 1 bana → 5/1 = 5 > 4, ska trigga max-4-regeln

  // För att inte fastna i skovalideringen behöver jag lägga till skor
  // och fylla i skostorlekar för alla spelare.

  // Hitta Shoes-sektionen via rubriken
  const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
  const shoesSection = shoesHeading.closest("section");

  // "+"-knappen för att lägga till en sko finns inne i Shoes-sektionen
  const addShoeButton = within(shoesSection).getByRole("button", { name: "+" });

  // Lägg till 5 skor (en per spelare)
  for (let i = 0; i < 5; i++) {
    await user.click(addShoeButton);
  }

  // Hämta alla sko-inputs i Shoes-sektionen och fyll i en storlek på varje
  const shoeInputs = shoesSection.querySelectorAll("input");

  for (const shoeInput of shoeInputs) {
    await user.type(shoeInput, "42");
  }

  // Nu är alla "andra" krav uppfyllda:
  // - Fält för datum, tid, spelare, banor är ifyllda
  // - Antal skor = antal spelare
  // - Alla skor har storlek
  // Då ska vi landa på regeln "max 4 spelare per bana" när vi försöker boka.
  const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
  await user.click(bookButton);

  // Här förväntar jag mig det mer specifika VG-felmeddelandet:
  const errorMessage = await screen.findByText(
    /Det får max vara 4 spelare per bana/i
  );

  expect(errorMessage).toBeInTheDocument();
});