
// User story: "Som användare vill jag kunna navigera mellan
// boknings- och bekräftelsevyn."
//
// Den här filen testar acceptanskriterierna:
//
// 1) Om ingen bokning finns i sessionStorage ska texten
//    "Ingen bokning gjord" visas.
// 2) Om det finns en bokning sparad i sessionStorage ska
//    den visas med:
//    - datum/tid (When)
//    - antal spelare (Who)
//    - antal banor (Lanes)
//    - bokningsnummer (Booking number)
//    - totalpris (Total: X sek)


import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Confirmation from "./Confirmation";

// Helper: rendera Confirmation i en Router eftersom komponenten
// använder useLocation + sessionStorage.
// [P14]
function renderConfirmation() {
  return render(
    <MemoryRouter initialEntries={["/confirmation"]}>
      <Routes>
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </MemoryRouter>
  );
}

// Nollställ sessionStorage inför varje test
// [P15]
beforeEach(() => {
  sessionStorage.clear();
});

describe("Confirmation – sessionStorage-beteende", () => {
  // AC-koppling:
  // - "Om användaren navigerar till bekräftelsevyn och ingen bokning är gjord
  //    eller finns i session storage ska texten 'Ingen bokning gjord visas'."
  // [P16] 
  test("visar text om att ingen bokning är gjord när det inte finns någon bokning sparad", () => {
    renderConfirmation();

    const message = screen.getByText(/Inga bokning gjord!/i);
    expect(message).toBeInTheDocument();
  });

  // AC-koppling:
  // - "Om användaren navigerar till bekräftelsevyn och det finns en bokning
  //    sparad i session storage ska denna visas."
  // - "Systemet ska generera ett bokningsnummer och visa detta till användaren
  //    efter att bokningen är slutförd."
  // - "Systemet ska beräkna och visa den totala summan för bokningen..."
  // - "Den totala summan ska visas tydligt på bekräftelsesidan..."
  // [P17]
  test("visar sparad bokning från sessionStorage (datum, antal spelare, banor, bokningsnummer och totalpris)", () => {
    const mockConfirmation = {
      when: "2025-12-20T18:00",
      people: 3,
      lanes: 2,
      bookingId: "ABC123",
      price: 560, 
    };

    sessionStorage.setItem(
      "confirmation",
      JSON.stringify(mockConfirmation)
    );

    renderConfirmation();

    const expectedWhenValue = mockConfirmation.when.replace("T", " ");
    expect(
      screen.getByDisplayValue(expectedWhenValue)
    ).toBeInTheDocument();

    // Who (antal spelare)
    expect(
      screen.getByDisplayValue(String(mockConfirmation.people))
    ).toBeInTheDocument();

    // Lanes (antal banor)
    expect(
      screen.getByDisplayValue(String(mockConfirmation.lanes))
    ).toBeInTheDocument();

    // Booking number (bokningsnummer)
    expect(
      screen.getByDisplayValue(mockConfirmation.bookingId)
    ).toBeInTheDocument();

    // Total-pris: "<p>Total:</p><p>{confirmation.price} sek</p>"
    const totalTextRegex = new RegExp(`${mockConfirmation.price}\\s*sek`, "i");
    expect(screen.getByText(totalTextRegex)).toBeInTheDocument();
  });
});