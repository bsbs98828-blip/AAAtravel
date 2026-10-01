AAA TRAVEL BOOKING WEBSITE
==========================

IMPORTANT EMAIL SETUP
---------------------
The booking form uses FormSubmit so it works on normal/static hosting without PHP.
Bookings are sent to: aaa_travel@outlook.com

FIRST TIME ONLY:
1. Upload all files to your website hosting.
2. Submit a test booking.
3. FormSubmit will send an activation/confirmation email to aaa_travel@outlook.com.
4. Open that email and confirm the form.
5. Submit another test booking. It should arrive at the AAA Travel Outlook inbox.

The form also sends an automatic acknowledgement to the customer's email address.

FILES
-----
index.html     Main website. CSS is embedded directly into this file.
script.js      Booking calculator and form behaviour.
style.css      Copy of the embedded CSS, kept separately for future editing.
send-booking.php  Old server-side option; not required for the current FormSubmit setup.
assets/        AAA Travel logo.

IMPORTANT PRICING NOTE
----------------------
The current fare calculator contains TEST pricing values. Change them in script.js
before using the website to quote real customers.

Current test settings:
Base fare: £5
Per mile: £2.20
Minimum fare: £10
Return discount: 10%
Airport supplement: £5
Event supplement: £3
5+ passengers: +20%

The current distance calculation is only a testing estimate based on entered postcodes.
Do NOT use it as a final real-world fare calculator until it is replaced with a proper
postcode/geocoding + road-routing service or AAA's manually approved fare system.
