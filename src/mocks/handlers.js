
import { http, HttpResponse } from "msw";

const BOOKING_URL = "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking";

export const handlers = [
  http.post(BOOKING_URL, async ({ request }) => {
    const body = await request.json();

    const when = body.when;
    const people = Number(body.people);
    const lanes = Number(body.lanes);

    // Enkel prislogik enligt uppgiften:
    // 120 kr per person + 100 kr per bana
    const price = people * 120 + lanes * 100;

    // Fejk-bokningsnummer för test
    const bookingId = "MSW-TEST-BOOKING-123";

    // Här returnerar vi ett svar som liknar "riktig" backend.
    return HttpResponse.json(
      {
        bookingId,
        price,
        when,
        people,
        lanes,
      },
      { status: 201 }
    );
  }),
];