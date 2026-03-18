/* =============================================
   Rei's Car Wash — Shared Data & Config
   Edit this file or use the admin panel.
   ============================================= */

const CONFIG = {
  businessName: "שטיפת רכב של ריי",
  ownerEmail: "reis.carwash@gmail.com",

  // Bitt / DCash settings
  bittWalletId: "1868-555-0000",
  bittAccountName: "שטיפת רכב של ריי",

  currency: "$",
  currencyCode: "XCD",

  bookingWindowDays: 30,

  confirmationMessage:
    "תודה שהזמנת אצל שטיפת רכב של ריי! " +
    "אנא השלם את התשלום דרך Bitt / DCash כדי לאשר את התור שלך. " +
    "נתראה בקרוב!"
};

/* ── Default services ──────────────────────────
   Managed via admin panel. Saved to localStorage.
   ─────────────────────────────────────────── */
const DEFAULT_SERVICES = [
  {
    id: "outside",
    name: "שטיפה חיצונית",
    description: "שטיפה חיצונית מלאה, שטיפה וייבוש",
    duration: 30,
    prices: { "5-seater": 15, "7-seater": 20 }
  },
  {
    id: "inside",
    name: "ניקוי פנימי",
    description: "שאיבת אבק פנימית ומגבון מלא",
    duration: 45,
    prices: { "5-seater": 20, "7-seater": 25 }
  },
  {
    id: "both",
    name: "ניקוי מלא",
    description: "חבילה מלאה - פנים וחוץ",
    duration: 60,
    prices: { "5-seater": 30, "7-seater": 40 }
  }
];

/* ── Default car types ────────────────────────
   Managed via admin panel. Saved to localStorage.
   ─────────────────────────────────────────── */
const DEFAULT_CAR_TYPES = [
  { id: "5-seater", name: "5 מושבים", description: "סדאן, האצ'בק, קופה" },
  { id: "7-seater", name: "7 מושבים", description: "ג'יפ, ואן, מיניוואן" }
];

/* ── Default weekly schedule ──────────────── */
const DEFAULT_SCHEDULE = {
  monday:    { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  tuesday:   { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  wednesday: { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  thursday:  { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  friday:    { open: true,  start: "08:00", end: "17:00", slotStep: 60 },
  saturday:  { open: true,  start: "09:00", end: "14:00", slotStep: 60 },
  sunday:    { open: false, start: "09:00", end: "13:00", slotStep: 60 }
};

/* ── Storage ─────────────────────────────────── */
const Storage = {
  getSchedule() {
    const s = localStorage.getItem("rcw_schedule");
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
  },
  saveSchedule(v) { localStorage.setItem("rcw_schedule", JSON.stringify(v)); },

  getBookings() {
    const s = localStorage.getItem("rcw_bookings");
    return s ? JSON.parse(s) : [];
  },
  saveBookings(v) { localStorage.setItem("rcw_bookings", JSON.stringify(v)); },
  addBooking(booking) {
    const list = this.getBookings();
    booking.id = Date.now().toString();
    booking.createdAt = new Date().toISOString();
    booking.status = "pending";
    list.push(booking);
    this.saveBookings(list);
    return booking;
  },
  updateBookingStatus(id, status) {
    const list = this.getBookings();
    const i = list.findIndex(b => b.id === id);
    if (i !== -1) { list[i].status = status; this.saveBookings(list); }
  },
  deleteBooking(id) {
    this.saveBookings(this.getBookings().filter(b => b.id !== id));
  },

  getServices() {
    const s = localStorage.getItem("rcw_services");
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_SERVICES));
  },
  saveServices(v) { localStorage.setItem("rcw_services", JSON.stringify(v)); },

  getCarTypes() {
    const s = localStorage.getItem("rcw_car_types");
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_CAR_TYPES));
  },
  saveCarTypes(v) { localStorage.setItem("rcw_car_types", JSON.stringify(v)); },

  getSettings() {
    const s = localStorage.getItem("rcw_settings");
    return s ? JSON.parse(s) : null;
  },
  saveSettings(v) { localStorage.setItem("rcw_settings", JSON.stringify(v)); }
};

// Live arrays — always loaded from storage
let SERVICES  = Storage.getServices();
let CAR_TYPES = Storage.getCarTypes();

// Apply saved settings to CONFIG on every page load
(function applySettings() {
  const s = Storage.getSettings();
  if (s) Object.assign(CONFIG, s);
})();

/* ── Utils ───────────────────────────────────── */
const Utils = {
  formatTime(t) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "אחה\"צ" : "לפנה\"צ";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  },

  formatDate(d) {
    return new Date(d + "T12:00:00").toLocaleDateString("he-IL", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  },

  getDayName(dateStr) {
    return new Date(dateStr + "T12:00:00")
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  },

  generateSlots(daySchedule, bookedSlots, serviceDuration) {
    const slots = [];
    if (!daySchedule.open) return slots;
    const [sh, sm] = daySchedule.start.split(":").map(Number);
    const [eh, em] = daySchedule.end.split(":").map(Number);
    const startM = sh * 60 + sm;
    const endM   = eh * 60 + em;
    const step   = daySchedule.slotStep || 60;
    for (let m = startM; m + serviceDuration <= endM; m += step) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;
      const isBooked = bookedSlots.some(b => {
        const bEnd = b.startMins + b.duration;
        const sEnd = m + serviceDuration;
        return m < bEnd && sEnd > b.startMins;
      });
      slots.push({ time: timeStr, booked: isBooked });
    }
    return slots;
  },

  mailtoLink(booking) {
    const service = SERVICES.find(s => s.id === booking.serviceId);
    const car     = CAR_TYPES.find(c => c.id === booking.carTypeId);
    const price   = service.prices[booking.carTypeId];
    const subject = encodeURIComponent(`אישור הזמנה - ${CONFIG.businessName}`);
    const body = encodeURIComponent(
      `שלום ${booking.customerName},\n\n` +
      `ההזמנה שלך אצל ${CONFIG.businessName} אושרה!\n\n` +
      `תאריך:  ${Utils.formatDate(booking.date)}\n` +
      `שעה:    ${Utils.formatTime(booking.time)}\n` +
      `רכב:    ${car.name} (${car.description})\n` +
      `שירות:  ${service.name}\n` +
      `סכום:   ${CONFIG.currency}${price} ${CONFIG.currencyCode}\n\n` +
      `תשלום באמצעות Bitt / DCash:\n` +
      `1. פתח את אפליקציית DCash\n` +
      `2. לחץ על "שלח כסף"\n` +
      `3. חפש: ${CONFIG.bittWalletId}\n` +
      `4. הכנס סכום: ${CONFIG.currency}${price}\n` +
      `5. הוסף הערה: הזמנה מספר ${booking.id}\n` +
      `6. אשר את התשלום\n\n` +
      `${CONFIG.confirmationMessage}\n\n` +
      `- צוות ${CONFIG.businessName}`
    );
    return `mailto:${booking.customerEmail}?subject=${subject}&body=${body}`;
  }
};
