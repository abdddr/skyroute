# SkyRoute - Flight Booking Website

**Web Technologies - Front-End Development** | Astana IT University | Team project

SkyRoute is a responsive flight-booking website for nonstop domestic routes from Astana to nine cities in Kazakhstan. Visitors can search flights, browse and filter destinations, pick a flight, see a live price total and confirm a booking.

> SkyRoute is a course demo. Flights and prices are examples, and no data is stored or sent anywhere.

**Live website:** https://abdddr.github.io/skyroute/
**Repository:** https://github.com/abdddr/skyroute

## Team

| Member | Group | Pages (HTML) | Scripts (JS) |
|---|---|---|---|
| Kagan Tasbolat | ['SE-2502'] | `index.html`, `destinations.html` | `js/index.js`, `js/destinations.js` |
| Abdrakhman Almukhan | ['SE-2502'] | `booking.html`, `about.html` | `js/booking.js`, `js/about.js` |

Each member owns two HTML pages. Shared files: `css/styles.css`, `images/`, this README.

## Pages and features

| Page | What it does |
|---|---|
| `index.html` | Hero, flight search form (dates, passengers, class, max price, trip type), two-column and three-column grid sections, popular destinations card group, **live date and time**, **background colour button**, **subscription pop-up**, link to help |
| `destinations.html` | Sidebar filters (region and price) that really filter the cards, a 9-image carousel, and 9 destination cards |
| `booking.html` | Reads the search from the address bar, lists three nonstop flights, lets you choose one, shows a live total and confirms the booking |
| `about.html` | About text, team cards, **JavaScript FAQ accordion**, **sign-up form with validation** (`#signup`), and a contact form (`#contact`) |

How the pages work together: the search form on the home page and every "View Flights" button send the chosen city to `booking.html` (for example `booking.html?destination=Aktau`), and the booking page builds the matching flights.

## Project structure

```
skyroute/
  index.html
  destinations.html
  booking.html
  about.html
  css/
    styles.css        custom CSS (contrast colours, image sizes, hero, hover, ticket cards)
  js/
    site.js           shared: night theme, sound effects, keyboard navigation (all pages)
    index.js          search form dates, subscription pop-up, background colour, date and time, greeting, travel tips
    destinations.js   region and price filters
    booking.js        flights, selection, live total, confirmation
    about.js          sign-up validation, FAQ accordion, contact form
  images/             9 city illustrations (SVG)
  README.md
```

## JavaScript features (Assignment 4)

| Task | Where | Owner | How it works |
|---|---|---|---|
| 1. Form validation | `about.html` `#signup`, `js/about.js` | Abdrakhman | Required name and email, email format, password 8+ characters with a letter and a number, confirmation must match; messages appear under each field |
| 2. Accordion | `about.html` FAQ, `js/about.js` | Abdrakhman | Answers are collapsed by default; a click animates `max-height` open or closed |
| 3. Pop-up form | `index.html` Subscribe button, `js/index.js` | Kagan | Hidden overlay opens on click; closes with the X, a click outside, or Esc |
| 4. Background colour | `index.html`, `js/index.js` | Kagan | Button cycles `body` through six light colours |
| 5. Date and time | `index.html`, `js/index.js` | Kagan | `Date` object formatted like "October 19, 2026, 1:01 PM", refreshed every second |

## JavaScript features (Assignment 5)

| Feature | Where | How it works |
|---|---|---|
| Day / Night theme | `js/site.js`, `css/styles.css` | Navbar button sets `data-bs-theme` on `<html>`; choice saved in `localStorage` |
| Sound effects | `js/site.js` | Web Audio API oscillator sounds (click, success, error, star); one sound at a time; Sound on/off button |
| Keyboard navigation | `js/site.js` | `keydown` + `switch`: arrows, Home and End move focus through the navbar |
| Greeting by time of day | `js/index.js` | `switch` on `new Date().getHours()` |
| Travel tips | `js/index.js` | Array of objects, random tip on button click, tooltips added with `forEach` |
| Star rating | `about.html`, `js/about.js` | `querySelectorAll` stars, colour and `aria-pressed`, message by `switch`, pop animation |
| Async contact form | `js/about.js` | `fetch` POST to a test API with a callback; success or error shown without reload |
| Sort flights | `js/booking.js` | `Array.sort` with a `switch` (time or price); cards fade in one by one |
| Clear form button | `js/booking.js` | `querySelectorAll('input').forEach` empties the passenger fields |
| Animations | `css/styles.css` | `pop`, `fade-in-up`, `bounce-in`, `shake`; disabled for reduced motion |

## Technologies

- HTML5 with semantic elements (`nav`, `main`, `section`, `article`, `aside`, `footer`, `fieldset`/`legend`)
- CSS3: custom properties, media queries, `object-fit`
- Flexbox through Bootstrap utilities (`d-flex`, `flex-column`, `flex-md-row`, `justify-content-*`, `gap-*`)
- Bootstrap 5.3.3 from the jsDelivr CDN with integrity hashes (grid, navbar, forms, cards, carousel, buttons)
- Plain JavaScript (no libraries)

## Responsive design

The layout is mobile-first and uses Bootstrap breakpoints.

| Breakpoint | Starts at | What changes |
|---|---|---|
| `sm` | 576px | Destination cards go from 1 to 2 per row; feature boxes go to 2 per row |
| `md` | 768px | Form fields sit side by side; destination cards 3 per row; flight cards become horizontal with a dashed ticket stub; carousel is taller |
| `lg` | 992px | Navbar expands (hamburger below this); filter sidebar sits beside the content; `col-lg-6` and `col-lg-4` sections; carousel is tallest |

Images use `object-fit: cover` with fixed heights, so they are never stretched. Wide content never causes sideways scrolling.

## Accessibility

- Skip-to-content link, one `h1` per page, headings in order
- Every form control has a linked `<label>`; every image has `alt` text
- Icon-only controls (hamburger, carousel arrows and dots) have `aria-label` or hidden text
- `aria-current="page"` on the active menu link; `aria-live` regions for filter counts, booking summary and messages
- Form errors are shown in text and focus moves to the first problem
- Colours checked against WCAG AA (4.5:1): body text 15.4:1, secondary text 8.2:1, blue buttons and links 6.4:1, white on the hero 6.4:1 or better
- Hover animation is switched off for users who prefer reduced motion

## How to run

1. Download or clone the repository.
2. Open `index.html` in a browser. No build step or server is needed.
3. An internet connection is needed for Bootstrap (CDN).

## Deployment (GitHub Pages)

1. Push the project to the repository with `index.html` in the root folder (keep the `css/`, `js/` and `images/` folders).
2. Open **Settings -> Pages**.
3. Set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
4. After about a minute the site is live at the URL at the top of this file.

## Known limitations

- Demo project: flight data is generated in `js/booking.js`. Only the contact form sends data (to a public test API that stores nothing); the other forms stay in the browser.
- Fares, flight times and airports are examples.

## Credits

Built with [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/). City illustrations are original SVG drawings made for this project.
