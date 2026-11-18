# SkyRoute

Web Technologies final project, Astana IT University, SE-2502.
Team members: Almukhan Abdrakhman and Tasbolat Kagan.

SkyRoute is a six-page, browser-based flight-booking demonstration for nine domestic destinations from Astana. Flights, fares, bookings, enquiries and subscriptions are simulated. The arrival weather panel retrieves current modelled conditions from Open-Meteo.

## Run

Use the hosted site at https://abdddr.github.io/skyroute/ or start a local server from the extracted SkyRoute folder with `python3 -m http.server 8000` and open http://localhost:8000/. Use the same browser and origin for account and profile storage. Bootstrap, jQuery and the city illustrations ship with the project. Live weather requires network access. The account demo uses Web Crypto over HTTPS or localhost.

## Pages

| Page | Purpose |
| --- | --- |
| index.html | Route, dates, trip type, passengers, cabin and fare-cap search. |
| destinations.html | Nine illustrated destinations with combined city, region and fare filters. |
| booking.html | Compare three departures, request destination weather, calculate an itemised demo trip and receive a booking reference. |
| about.html | Team, project background, searchable FAQ, rating and local enquiry validation. |
| account.html | Create a demo account and log in with the same email and password. |
| profile.html | Review the signed-in traveller's details and saved demo bookings, then log out. |

## Work division

The original project assigns Home and Destinations to Tasbolat Kagan, and Booking and About to Almukhan Abdrakhman. Shared project assets include the stylesheet and city artwork. The final release extends those pages with a shared account/profile flow, JavaScript form checks and destination weather.

## Data and dependencies

The client stores demo account details, a randomly salted PBKDF2-SHA256 password verifier, signed-in email, theme, sound preference and signed-in booking summaries in localStorage. Use fictional details. A local account simulation is suitable for coursework only. Search criteria travel in the booking URL. Guest bookings, enquiries and subscription demos are transient. Only the selected city's coordinates and requested weather variables go to the weather service.

- Repository: https://github.com/abdddr/skyroute
- Weather data and documentation: https://open-meteo.com/en/docs
- Bootstrap 5.3.3 and jQuery 4.0.0 are bundled under their MIT licenses in vendor/.
