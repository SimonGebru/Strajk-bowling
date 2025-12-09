// Här testar jag user storyn:
// "Som användare vill jag kunna boka datum och tid samt ange antal spelare
//  så att jag kan reservera 1 eller flera baner i bowlinghallen."
//
// Fokus i den här filen:
// - Att alla inputs som behövs för bokning faktiskt finns (datum, tid, antal spelare, antal banor).
// - Att rätt felmeddelande visas om man försöker boka utan att fylla i något.
// - Att rätt felmeddelande visas om man försöker boka för många spelare per bana (VG-del).
// - Att skologiken funkar: lägga till/ändra skostorlek, mismatch spelare/skor, saknad skostorlek.

import { test, expect, describe } from "vitest";
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


// Bokningsformulär (datum, tid, antal spelare, antal banor)
// Här ligger allt som handlar om själva bokningen:
//
// - Att alla inputs finns på sidan.
// - Att jag får "Alla fälten måste vara ifyllda" i olika scenarion.
// - Att jag får VG-felmeddelandet när det är för många spelare per bana.


describe("Booking – formulär för datum/tid/spelare/banor", () => {
  
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

  
  // TEST 2: Försöker boka utan att fylla i något → ska få generellt felmeddelande
  //
  // AC-koppling:
  // - "Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas"
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

  
  // TEST 3: För många spelare per bana → specifikt felmeddelande
  //
  // AC-koppling:
  // - "Om det inte finns tillräckligt med lediga banor för det angivna
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
    await user.type(lanesInput, "1"); // 1 bana → 5/1 = 5 > 4, ska trigga max-4-regeln

    // För att inte fastna i skovalideringen behöver jag lägga till skor
    // och fylla i skostorlekar för alla spelare.

    // Hitta Shoes-sektionen via rubriken
    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");

    // "+"-knappen för att lägga till en sko finns inne i Shoes-sektionen
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

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

  // -------------------------------------------------------------------
  // "alla fälten måste vara ifyllda"
  //
  // AC-koppling :
  // - "Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas"
  //
  // Tanke:
  // Här testar jag flera olika kombinationer där något fält saknas, t.ex.
  // - saknar datum
  // - saknar tid
  // - saknar antal spelare
  // - saknar antal banor
  // Alla dessa ska fortfarande ge samma generella felmeddelande
  // "Alla fälten måste vara ifyllda".
  const incompleteBookingCases = [
    {
      label: "saknar datum",
      when: "",
      time: "18:00",
      people: "4",
      lanes: "1",
    },
    {
      label: "saknar tid",
      when: "2025-12-20",
      time: "",
      people: "4",
      lanes: "1",
    },
    {
      label: "saknar antal spelare",
      when: "2025-12-20",
      time: "18:00",
      people: "",
      lanes: "1",
    },
    {
      label: "saknar antal banor",
      when: "2025-12-20",
      time: "18:00",
      people: "4",
      lanes: "",
    },
  ];

  incompleteBookingCases.forEach(({ label, when, time, people, lanes }) => {
    test(
      `visar generellt felmeddelande när bokningen ${label}`,
      async () => {
        renderBooking();
        const user = userEvent.setup();

        // Plockar ut label-texterna precis som i tidigare tester
        const dateLabel = screen.getByText(/Date/i);
        const timeLabel = screen.getByText(/Time/i);
        const peopleLabel =
          screen.getByText(/Number of awesome bowlers/i);
        const lanesLabel = screen.getByText(/Number of lanes/i);

        const dateInput = dateLabel.parentElement.querySelector("input");
        const timeInput = timeLabel.parentElement.querySelector("input");
        const peopleInput = peopleLabel.parentElement.querySelector("input");
        const lanesInput = lanesLabel.parentElement.querySelector("input");

        // Fyller bara i de fält som har värde i scenariot,
        // resten lämnar jag tomma med flit.
        if (when) {
          await user.type(dateInput, when);
        }
        if (time) {
          await user.type(timeInput, time);
        }
        if (people) {
          await user.type(peopleInput, people);
        }
        if (lanes) {
          await user.type(lanesInput, lanes);
        }

        // Skor rör jag inte alls här – jag vill att valideringen ska fastna
        // direkt på "alla fälten måste vara ifyllda"-regeln.
        const bookButton = screen.getByRole("button", {
          name: /strIIIIIike!/i,
        });

        await user.click(bookButton);

        const errorMessage = await screen.findByText(
          /Alla fälten måste vara ifyllda/i
        );

        expect(errorMessage).toBeInTheDocument();
      }
    );
  });
});


// Skor (user story "välja skostorlek för varje spelare")
//
// Här fokuserar jag på logiken runt Shoes-sektionen:
//
// - Att jag kan lägga till fält för skor och skriva in storlek.
// - Att jag kan uppdatera/ändra en skostorlek.
// - Att jag får felmeddelande om antal skor inte matchar antal spelare. (VG)
// - Att jag får felmeddelande om jag lämnar en sko utan storlek. (VG)


describe("Booking – skor (skostorlek per spelare)", () => {
  
  // TEST 4: Lägga till skor + ange och ändra skostorlek
  //
  // AC-koppling :
  // - "Användaren ska kunna ange skostorlek för varje spelare."
  // - "Användaren ska kunna ändra skostorlek för varje spelare."
  // - "Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen."
  //
  // Tanke:
  // Jag gör en "mini-simulering" där jag:
  //  - sätter antal spelare
  //  - klickar på plus-knappen för skor flera gånger
  //  - fyller i skostorlekar
  //  - ändrar en av dem
  // Fokus här är att fälten finns och går att skriva/uppdatera, inte själva bokningen.
  test("låter mig lägga till skor och ange/ändra skostorlek för varje spelare", async () => {
    renderBooking();
    const user = userEvent.setup();

    // Sätter antal spelare till 3 (så vi vet hur många skor vi vill ha)
    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    await user.type(peopleInput, "3");

    // Hitta Shoes-sektionen och plus-knappen
    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    // Klickar 3 gånger så att jag får 3 sko-inputs
    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    // Hämta alla sko-inputs
    let shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(3);

    // Skriver in storlek på varje sko
    await user.type(shoeInputs[0], "40");
    await user.type(shoeInputs[1], "41");
    await user.type(shoeInputs[2], "42");

    // Kollar att värdena är inskrivna
    expect(shoeInputs[0]).toHaveValue("40");
    expect(shoeInputs[1]).toHaveValue("41");
    expect(shoeInputs[2]).toHaveValue("42");

    // Ändrar storleken på den sista skon till något annat
    // (clear + ny siffra för att simulera en riktig ändring)
    await user.clear(shoeInputs[2]);
    await user.type(shoeInputs[2], "43");

    expect(shoeInputs[2]).toHaveValue("43");
  });

  
  // TEST 5: Felmeddelande när antal skor inte matchar antal spelare
  //
  // AC-koppling :
  // - "VG - Om antalet personer och skor inte matchas ska ett felmeddelande visas"
  //
  // Tanke:
  // Här vill jag trigga just den regeln, så jag:
  //  - fyller i alla obligatoriska bokningsfält (datum, tid, spelare, banor)
  //  - skapar FÖR FÅ skor jämfört med antal spelare
  //  - fyller i storlek på de skor som finns
  //  - försöker boka
  // Då ska jag få felmeddelandet om mismatch mellan antal skor och antal spelare.
  test("visar felmeddelande om antalet spelare och antal skor inte matchar", async () => {
    renderBooking();
    const user = userEvent.setup();

    // Fyller i bokningsfälten med giltiga värden
    const dateLabel = screen.getByText(/Date/i);
    const timeLabel = screen.getByText(/Time/i);
    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const lanesLabel = screen.getByText(/Number of lanes/i);

    const dateInput = dateLabel.parentElement.querySelector("input");
    const timeInput = timeLabel.parentElement.querySelector("input");
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    const lanesInput = lanesLabel.parentElement.querySelector("input");

    await user.type(dateInput, "2025-12-20");
    await user.type(timeInput, "18:00");
    await user.type(peopleInput, "3"); // 3 spelare
    await user.type(lanesInput, "1");

    // Shoes-sektionen
    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    // Skapar BARA 2 skor trots att vi har 3 spelare
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(2);

    // Fyller i storlek på båda skor
    await user.type(shoeInputs[0], "42");
    await user.type(shoeInputs[1], "43");

    // Försöker boka
    const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
    await user.click(bookButton);

    // Här förväntar jag mig felmeddelandet för mismatch skor/spelare.
    const errorMessage = await screen.findByText(
      /Antalet skor måste stämma överens med antal spelare/i
    );

    expect(errorMessage).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // TEST 6: Felmeddelande när någon sko saknar storlek
  //
  // AC-koppling :
  // - "VG - Om användaren försöker slutföra bokningen utan att ange skostorlek
  //    för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande
  //    och be om att skostorleken anges."
  //
  // Tanke:
  // Jag sätter upp ett scenario där:
  //  - antal spelare = 2
  //  - jag lägger till 2 skor (så att antal skor MATCHAR antalet spelare)
  //  - jag fyller i storlek på första skon men lämnar den andra tom
  //  - alla andra bokningsfält är giltiga
  //  - jag försöker boka
  // Då ska det INTE vara "antal skor stämmer inte"-felet, utan det mer
  // specifika felet att en sko saknar storlek.
  test("visar felmeddelande om någon sko saknar skostorlek", async () => {
    renderBooking();
    const user = userEvent.setup();

    // Fyller i bokningsfälten med giltiga värden
    const dateLabel = screen.getByText(/Date/i);
    const timeLabel = screen.getByText(/Time/i);
    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const lanesLabel = screen.getByText(/Number of lanes/i);

    const dateInput = dateLabel.parentElement.querySelector("input");
    const timeInput = timeLabel.parentElement.querySelector("input");
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    const lanesInput = lanesLabel.parentElement.querySelector("input");

    await user.type(dateInput, "2025-12-20");
    await user.type(timeInput, "18:00");
    await user.type(peopleInput, "2"); // 2 spelare
    await user.type(lanesInput, "1");

    // Shoes-sektionen
    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    // Lägger till 2 skor (en per spelare)
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(2);

    // Fyller i storlek på första skon men lämnar andra tom
    await user.type(shoeInputs[0], "42");
    // shoeInputs[1] lämnas medvetet tom

    // Försöker boka
    const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
    await user.click(bookButton);

    // Här vill jag få det mer specifika "saknar skostorlek"-felet.
    const errorMessage = await screen.findByText(
      /Alla skor måste vara ifyllda/i
    );

    expect(errorMessage).toBeInTheDocument();
  });
});

  
  // TEST 7: Tar bort ett skofält med minus-knappen
  //
  // Tanke:
  // Här testar jag själva interaktionen för att ta bort skor:
  // - Jag sätter antal spelare (t.ex. 3)
  // - Jag lägger till 3 skofält via plus-knappen
  // - Jag klickar på minus på en av raderna
  // → Då förväntar jag mig att antalet skofält minskar med 1.
  //
  // Jag fokuserar på DOM-strukturen:
  // - .shoes__form är varje rad med sko-input + minus-knapp
  // - Jag räknar dem före och efter klicket.
  test("tar bort ett skofält när jag klickar på minus-knappen", async () => {
    renderBooking();
    const user = userEvent.setup();

    // Sätter antal spelare till 3 (så att det är rimligt att ha 3 skor)
    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    await user.type(peopleInput, "3");

    // Hitta Shoes-sektionen + plus-knappen
    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    // Lägger till 3 skofält
    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    // Kollar hur många skofält (rader) jag har innan jag tar bort någon
    const formsBefore = shoesSection.querySelectorAll(".shoes__form");
    expect(formsBefore.length).toBe(3);

    // Hämtar alla minus-knappar (en per rad)
    const removeButtons = within(shoesSection).getAllByRole("button", {
      name: "-",
    });
    expect(removeButtons.length).toBe(3);

    // Klickar på minus på den "mitten"-raden (index 1)
    await user.click(removeButtons[1]);

    // Räknar skofälten igen efter att jag klickat minus
    const formsAfter = shoesSection.querySelectorAll(".shoes__form");

    // Förväntan: ett skofält mindre än innan
    expect(formsAfter.length).toBe(formsBefore.length - 1);
  });