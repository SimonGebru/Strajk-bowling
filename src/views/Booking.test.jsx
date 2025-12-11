
// User stories som testas här:
//
// 1) "Som användare vill jag kunna boka datum och tid samt ange antal
//     spelare så att jag kan reservera 1 eller flera baner i bowlinghallen."
// 2) "Som användare vill jag kunna välja skostorlek för varje spelare..."
// 3) "Som användare vill jag kunna ta bort ett fält för skostorlek..."
// 4) "Som användare vill jag kunna skicka iväg min reservation och få
//     tillbaka ett bokningsnummer och totalsumma..."
//
// Den här filen täcker acceptanskriterierna för:
// - formulärfält (datum, tid, spelare, banor)
// - generella felmeddelandet "Alla fälten måste vara ifyllda"
// - max 4 spelare per bana (VG)
// - logik kring skor (lägga till/ändra, mismatch, saknad storlek, ta bort)
// - POST-anropet mot /booking (payload + skor)


import { test, expect, describe } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Booking from "./Booking";

// Helper för att rendera Booking med Router
function renderBooking() {
  return render(
    <MemoryRouter>
      <Booking />
    </MemoryRouter>
  );
}


// FORMULÄR: datum, tid, spelare, banor

describe("Booking – formulär för datum/tid/spelare/banor", () => {
  // AC:
  // - Användaren ska kunna välja datum och tid.
  // - Användaren ska kunna ange antal spelare (minst 1).
  // - Användaren ska kunna reservera ett eller flera banor.
  test("renderar inputfält/sektioner för datum, tid, antal spelare och antal banor", () => {
    renderBooking();

    const dateLabel = screen.getByText(/Date/i);
    const timeLabel = screen.getByText(/Time/i);
    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const lanesLabel = screen.getByText(/Number of lanes/i);

    const dateInput = dateLabel.parentElement.querySelector("input");
    const timeInput = timeLabel.parentElement.querySelector("input");
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    const lanesInput = lanesLabel.parentElement.querySelector("input");

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
    expect(peopleInput).toBeInTheDocument();
    expect(lanesInput).toBeInTheDocument();
  });

  // AC:
  // - "Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas."
  test("visar felmeddelande om användaren försöker boka utan att fylla i alla fält", async () => {
    renderBooking();
    const user = userEvent.setup();

    const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
    await user.click(bookButton);

    const errorMessage = await screen.findByText(
      /Alla fälten måste vara ifyllda/i
    );

    expect(errorMessage).toBeInTheDocument();
  });

  // AC:
  // - "Om det inte finns tillräckligt med lediga banor för det angivna
  //    antalet spelare, ska användaren få ett felmeddelande."
  // (I appen: max 4 spelare per bana.)
  test("visar felmeddelande om man försöker boka fler än 4 spelare per bana", async () => {
    renderBooking();
    const user = userEvent.setup();

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
    await user.type(peopleInput, "5"); // 5 spelare
    await user.type(lanesInput, "1");  // 1 bana → 5/1 > 4

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    // 5 skor (en per spelare) med storlek
    for (let i = 0; i < 5; i++) {
      await user.click(addShoeButton);
    }

    const shoeInputs = shoesSection.querySelectorAll("input");
    for (const shoeInput of shoeInputs) {
      await user.type(shoeInput, "42");
    }

    const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
    await user.click(bookButton);

    const errorMessage = await screen.findByText(
      /Det får max vara 4 spelare per bana/i
    );

    expect(errorMessage).toBeInTheDocument();
  });

  // AC:
  // - "Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas."
  // Denna loop testar flera kombinationer av saknade fält, alla ska ge samma felmeddelande.
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

        const dateLabel = screen.getByText(/Date/i);
        const timeLabel = screen.getByText(/Time/i);
        const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
        const lanesLabel = screen.getByText(/Number of lanes/i);

        const dateInput = dateLabel.parentElement.querySelector("input");
        const timeInput = timeLabel.parentElement.querySelector("input");
        const peopleInput = peopleLabel.parentElement.querySelector("input");
        const lanesInput = lanesLabel.parentElement.querySelector("input");

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


// SKOR: välja, ändra, validera och ta bort skostorlekar

describe("Booking – skor (skostorlek per spelare)", () => {
  // AC:
  // - "Användaren ska kunna ange skostorlek för varje spelare."
  // - "Användaren ska kunna ändra skostorlek för varje spelare."
  // - "Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen."
  test("låter mig lägga till skor och ange/ändra skostorlek för varje spelare", async () => {
    renderBooking();
    const user = userEvent.setup();

    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    await user.type(peopleInput, "3");

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    let shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(3);

    await user.type(shoeInputs[0], "40");
    await user.type(shoeInputs[1], "41");
    await user.type(shoeInputs[2], "42");

    expect(shoeInputs[0]).toHaveValue("40");
    expect(shoeInputs[1]).toHaveValue("41");
    expect(shoeInputs[2]).toHaveValue("42");

    await user.clear(shoeInputs[2]);
    await user.type(shoeInputs[2], "43");

    expect(shoeInputs[2]).toHaveValue("43");
  });

  // AC:
  // - "Om antalet personer och skor inte matchas ska ett felmeddelande visas."
  test("visar felmeddelande om antalet spelare och antal skor inte matchar", async () => {
    renderBooking();
    const user = userEvent.setup();

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
    await user.type(peopleInput, "3"); 
    await user.type(lanesInput, "1");

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    // Bara 2 skor
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(2);

    await user.type(shoeInputs[0], "42");
    await user.type(shoeInputs[1], "43");

    const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
    await user.click(bookButton);

    const errorMessage = await screen.findByText(
      /Antalet skor måste stämma överens med antal spelare/i
    );

    expect(errorMessage).toBeInTheDocument();
  });

  // AC:
  // - "Om användaren försöker slutföra bokningen utan att ange skostorlek
  //    för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande..."
  test("visar felmeddelande om någon sko saknar skostorlek", async () => {
    renderBooking();
    const user = userEvent.setup();

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

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(2);

    await user.type(shoeInputs[0], "42");
    

    const bookButton = screen.getByRole("button", { name: /strIIIIIike!/i });
    await user.click(bookButton);

    const errorMessage = await screen.findByText(
      /Alla skor måste vara ifyllda/i
    );

    expect(errorMessage).toBeInTheDocument();
  });

  // AC:
  // - "Användaren ska kunna ta bort ett tidigare valt fält för skostorlek
  //    genom att klicka på en '-'-knapp vid varje spelare."
  test("tar bort ett skofält när jag klickar på minus-knappen", async () => {
    renderBooking();
    const user = userEvent.setup();

    const peopleLabel = screen.getByText(/Number of awesome bowlers/i);
    const peopleInput = peopleLabel.parentElement.querySelector("input");
    await user.type(peopleInput, "3");

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const formsBefore = shoesSection.querySelectorAll(".shoes__form");
    expect(formsBefore.length).toBe(3);

    const removeButtons = within(shoesSection).getAllByRole("button", {
      name: "-",
    });
    expect(removeButtons.length).toBe(3);

    await user.click(removeButtons[1]);

    const formsAfter = shoesSection.querySelectorAll(".shoes__form");
    expect(formsAfter.length).toBe(formsBefore.length - 1);
  });
});


// POST-anrop + MSW (bokningsnummer + pris)

describe("Booking – POST-anrop & MSW (bokningsnummer + pris)", () => {
  // AC:
  // - "Användaren ska kunna slutföra bokningen genom att klicka på en
  //    'slutför bokning'-knapp."
  // - "Systemet ska beräkna den totala summan för bokningen baserat på
  //    antalet spelare samt antalet reserverade banor."
  
  test("skickar POST med rätt payload när bokningen är giltig", async () => {
    const fetchSpy = vi.spyOn(window, "fetch");

    renderBooking();
    const user = userEvent.setup();

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
    await user.type(peopleInput, "2");
    await user.type(lanesInput, "1");

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = shoesSection.querySelectorAll("input");
    await user.type(shoeInputs[0], "38");
    await user.type(shoeInputs[1], "39");

    const bookButton = screen.getByRole("button", {
      name: /strIIIIIike!/i,
    });
    await user.click(bookButton);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const lastCall = fetchSpy.mock.calls.at(-1);
    const [url, options] = lastCall;

    expect(url).toMatch(/booking/i);
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body);

    expect(body.when).toBe("2025-12-20T18:00");
    expect(body.people).toBe("2");
    expect(body.lanes).toBe("1");
    expect(body.shoes).toHaveLength(2);

    fetchSpy.mockRestore();
  });

  // AC (user story "ta bort skostorlek"):
  // - "Om användaren tar bort skostorleken ska systemet inte inkludera
  //    den spelaren i skorantalet och priset för skor i den totala bokningssumman."
  // Här verifierar jag att den borttagna skon inte finns kvar i POST-payloaden.
  test("skickar inte med borttagen sko i payloaden (antal skor uppdateras efter minus)", async () => {
    const fetchSpy = vi.spyOn(window, "fetch");

    renderBooking();
    const user = userEvent.setup();

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
    await user.type(peopleInput, "3"); // börjar med 3 spelare
    await user.type(lanesInput, "1");

    const shoesHeading = screen.getByRole("heading", { name: /Shoes/i });
    const shoesSection = shoesHeading.closest("section");
    const addShoeButton = within(shoesSection).getByRole("button", {
      name: "+",
    });

    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    let shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(3);

    await user.type(shoeInputs[0], "38");
    await user.type(shoeInputs[1], "39"); // denna tas bort
    await user.type(shoeInputs[2], "40");

    const removeButtons = within(shoesSection).getAllByRole("button", {
      name: "-",
    });
    await user.click(removeButtons[1]); // tar bort 39

    shoeInputs = shoesSection.querySelectorAll("input");
    expect(shoeInputs.length).toBe(2);

    // gör bokningen giltig: 2 spelare, 2 skor
    await user.clear(peopleInput);
    await user.type(peopleInput, "2");

    const bookButton = screen.getByRole("button", {
      name: /strIIIIIike!/i,
    });
    await user.click(bookButton);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const lastCall = fetchSpy.mock.calls.at(-1);
    const [, options] = lastCall;
    const body = JSON.parse(options.body);

    expect(Array.isArray(body.shoes)).toBe(true);
    expect(body.shoes.length).toBe(2);

    const sizes = body.shoes.map((shoe) =>
      typeof shoe === "string" || typeof shoe === "number"
        ? String(shoe)
        : String(shoe.size)
    );
    expect(sizes).not.toContain("39");

    fetchSpy.mockRestore();
  });
});