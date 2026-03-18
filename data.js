/* =============================================
   Rei's Car Wash — Shared Data & Config
   Edit this file to customise your business.
   ============================================= */

const CONFIG = {
  businessName: "Rei's Car Wash",
  ownerEmail: "reis.carwash@gmail.com",      // ← change to your email
  paypalUsername: "ReisCarWash",             // ← your PayPal.me username
  currency: "$",
  currencyCode: "USD",

  // How far ahead customers can book (days)
  bookingWindowDays: 30,

  // Confirmation message shown after booking
  confirmationMessage:
    "Thank you for booking with Rei's Car Wash! " +
    "Please complete your payment via the PayPal link below to confirm your appointment. " +
    "We'll see you soon!"
};

/* ── Services ──────────────────────────────────
   Add, remove, or rename services here.
   duration: minutes the slot will be blocked.
   ─────────────────────────────────────────── */
const SERVICES = [
  {
    id: "outside",
    name: "Outside Wash",
    icon: "🚿",
    description: "Full exterior wash, rinse & dry",
    duration: 30,    // minutes
    prices: {
      "5-seater": 15,
      "7-seater": 20
    }
  },
  {
    id: "inside",
    name: "Inside Clean",
    icon: "🪣",
    description: "Full interior vacuum & wipe-down",
    duration: 45,    // minutes
    prices: {
      "5-seater": 20,
      "7-seater": 25
    }
  },
  {
    id: "both",
    name: "Full Detail",
    icon: "✨",
    description: "Complete inside + outside package",
    duration: 60,    // minutes
    prices: {
      "5-seater": 30,
      "7-seater": 40
    }
  }
];

/* ── Car Types ─────────────────────────────────
   Add more car types as needed.
   ─────────────────────────────────────────── */
const CAR_TYPES = [
  { id: "5-seater", name: "5-Seater", icon: "🚗", description: "Sedan, Hatchback, Coupe" },
  { id: "7-seater", name: "7-Seater", icon: "🚐", description: "SUV, Van, Minivan" }
];

/* ── Default Weekly Schedule ───────────────────
   open: false = closed that day
   start / end: 24-hour "HH:MM" format
   slotStep: minutes between each available slot
   ─────────────────────────────────────────── */
const DEFAULT_SCHEDULE = {
  monday:    { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  tuesday:   { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  wednesday: { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  thursday:  { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  friday:    { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  saturday:  { open: true,  start: "09:00", end: "14:00", slotStep: 60 },
  sunday:    { open: false, start: "09:00", end: "13:00", slotStep: 60 }
};

/* ── Storage helpers ───────────────────────────
   Uses the browser's localStorage so no
   database or server is required.
   ─────────────────────────────────────────── */
const Storage = {
  getSchedule() {
    const saved = localStorage.getItem("rcw_schedule");
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
  },
  saveSchedule(schedule) {
    localStorage.setItem("rcw_schedule", JSON.stringify(schedule));
  },
  getBookings() {
    const saved = localStorage.getItem("rcw_bookings");
    return saved ? JSON.parse(saved) : [];
  },
  saveBookings(bookings) {
    localStorage.setItem("rcw_bookings", JSON.stringify(bookings));
  },
  addBooking(booking) {
    const bookings = this.getBookings();
    booking.id = Date.now().toString();
    booking.createdAt = new Date().toISOString();
    booking.status = "pending";
    bookings.push(booking);
    this.saveBookings(bookings);
    return booking;
  },
  updateBookingStatus(id, status) {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx].status = status;
      this.saveBookings(bookings);
    }
  },
  deleteBooking(id) {
    const bookings = this.getBookings().filter(b => b.id !== id);
    this.saveBookings(bookings);
  }
};

/* ── Utility helpers ─────────────────────────── */
const Utils = {
  // "08:00" → "8:00 AM"
  formatTime(t) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  },

  // "2025-03-18" → "Tuesday, March 18 2025"
  formatDate(d) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  },

  // Return weekday name for a date string "YYYY-MM-DD"
  getDayName(dateStr) {
    return new Date(dateStr + "T12:00:00")
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  },

  // Generate time slots for a day given schedule settings and booked slots
  generateSlots(daySchedule, bookedSlots, serviceDuration) {
    const slots = [];
    if (!daySchedule.open) return slots;

    const [startH, startM] = daySchedule.start.split(":").map(Number);
    const [endH, endM]   = daySchedule.end.split(":").map(Number);
    const startMins = startH * 60 + startM;
    const endMins   = endH   * 60 + endM;
    const step      = daySchedule.slotStep || 60;

    for (let mins = startMins; mins + serviceDuration <= endMins; mins += step) {
      const hh = String(Math.floor(mins / 60)).padStart(2, "0");
      const mm = String(mins % 60).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;

      // A slot is "booked" if it overlaps with any existing booking
      const isBooked = bookedSlots.some(b => {
        const bStart = b.startMins;
        const bEnd   = b.startMins + b.duration;
        const sEnd   = mins + serviceDuration;
        return mins < bEnd && sEnd > bStart;
      });

      slots.push({ time: timeStr, booked: isBooked });
    }
    return slots;
  },

  // Generate a PayPal.me payment link
  paypalLink(amount, description) {
    const desc = encodeURIComponent(description);
    return `https://www.paypal.com/paypalme/${CONFIG.paypalUsername}/${amount}`;
  },

  // Generate a mailto confirmation link
  mailtoLink(booking) {
    const service = SERVICES.find(s => s.id === booking.serviceId);
    const car     = CAR_TYPES.find(c => c.id === booking.carTypeId);
    const price   = service.prices[booking.carTypeId];

    const subject = encodeURIComponent(`Booking Confirmation – ${CONFIG.businessName}`);
    const body = encodeURIComponent(
      `Hi ${booking.customerName},\n\n` +
      `Your booking at ${CONFIG.businessName} is confirmed!\n\n` +
      `📅 Date:    ${Utils.formatDate(booking.date)}\n` +
      `⏰ Time:    ${Utils.formatTime(booking.time)}\n` +
      `🚗 Car:     ${car.name} (${car.description})\n` +
      `🧼 Service: ${service.name}\n` +
      `💰 Amount:  ${CONFIG.currency}${price}\n\n` +
      `Please pay via PayPal:\n` +
      `${Utils.paypalLink(price, service.name + " – " + CONFIG.businessName)}\n\n` +
      `${CONFIG.confirmationMessage}\n\n` +
      `– The ${CONFIG.businessName} team`
    );
    return `mailto:${booking.customerEmail}?subject=${subject}&body=${body}`;
  }
};
