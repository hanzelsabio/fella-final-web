/**
 * mockData.js
 * Drop this in frontend/src/services/
 * Import and call enableMocks() in main.jsx when VITE_USE_MOCKS=true
 *
 * Covers every API endpoint used by the admin dashboard.
 */

// ── Shared image placeholder ──────────────────────────────────────────────────
const img = (w = 400, h = 400, text = "") =>
  `https://placehold.co/${w}x${h}/1a1a1a/ffffff?text=${encodeURIComponent(text || `${w}x${h}`)}`;

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "T-Shirts",
    slug: "t-shirts",
    image: img(400, 400, "T-Shirts"),
    status: "active",
    active_product_count: 4,
    created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: 2,
    name: "Hoodies",
    slug: "hoodies",
    image: img(400, 400, "Hoodies"),
    status: "active",
    active_product_count: 2,
    created_at: "2024-01-11T08:00:00Z",
  },
  {
    id: 3,
    name: "Polo Shirts",
    slug: "polo-shirts",
    image: img(400, 400, "Polo"),
    status: "active",
    active_product_count: 3,
    created_at: "2024-01-12T08:00:00Z",
  },
  {
    id: 4,
    name: "Jackets",
    slug: "jackets",
    image: img(400, 400, "Jackets"),
    status: "archived",
    active_product_count: 0,
    created_at: "2024-01-13T08:00:00Z",
  },
];

export const MOCK_COLORS = [
  {
    id: 1,
    name: "Black",
    slug: "black",
    hex_code: "#000000",
    status: "active",
  },
  {
    id: 2,
    name: "White",
    slug: "white",
    hex_code: "#FFFFFF",
    status: "active",
  },
  { id: 3, name: "Red", slug: "red", hex_code: "#EF4444", status: "active" },
  { id: 4, name: "Navy", slug: "navy", hex_code: "#1E3A5F", status: "active" },
  {
    id: 5,
    name: "Forest",
    slug: "forest",
    hex_code: "#166534",
    status: "archived",
  },
];

export const MOCK_SERVICES = [
  {
    id: 1,
    name: "Screen Printing",
    slug: "screen-printing",
    description: "High quality screen printing",
    image: img(400, 400, "Screen Print"),
    status: "active",
    created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: 2,
    name: "Embroidery",
    slug: "embroidery",
    description: "Custom embroidery service",
    image: img(400, 400, "Embroidery"),
    status: "active",
    created_at: "2024-01-11T08:00:00Z",
  },
  {
    id: 3,
    name: "DTF Printing",
    slug: "dtf-printing",
    description: "Direct to film printing",
    image: img(400, 400, "DTF"),
    status: "active",
    created_at: "2024-01-12T08:00:00Z",
  },
];

export const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "Classic Black Tee",
    slug: "classic-black-tee",
    category: 1,
    categoryName: "T-Shirts",
    price: 350,
    status: "active",
    image: img(400, 400, "Black Tee"),
    created_at: "2024-02-01T08:00:00Z",
    productImages: [{ url: img(400, 400, "Black Tee") }],
    services: [1],
    colors: [1, 2],
  },
  {
    id: 2,
    title: "White Polo Classic",
    slug: "white-polo-classic",
    category: 3,
    categoryName: "Polo Shirts",
    price: 450,
    status: "active",
    image: img(400, 400, "White Polo"),
    created_at: "2024-02-02T08:00:00Z",
    productImages: [{ url: img(400, 400, "White Polo") }],
    services: [2],
    colors: [2, 4],
  },
  {
    id: 3,
    title: "Navy Hoodie",
    slug: "navy-hoodie",
    category: 2,
    categoryName: "Hoodies",
    price: 750,
    status: "active",
    image: img(400, 400, "Navy Hoodie"),
    created_at: "2024-02-03T08:00:00Z",
    productImages: [{ url: img(400, 400, "Navy Hoodie") }],
    services: [1, 3],
    colors: [4],
  },
  {
    id: 4,
    title: "Red Graphic Tee",
    slug: "red-graphic-tee",
    category: 1,
    categoryName: "T-Shirts",
    price: 380,
    status: "active",
    image: img(400, 400, "Red Tee"),
    created_at: "2024-02-04T08:00:00Z",
    productImages: [{ url: img(400, 400, "Red Tee") }],
    services: [1],
    colors: [3],
  },
  {
    id: 5,
    title: "Forest Zip Hoodie",
    slug: "forest-zip-hoodie",
    category: 2,
    categoryName: "Hoodies",
    price: 890,
    status: "archived",
    image: img(400, 400, "Forest Zip"),
    created_at: "2024-02-05T08:00:00Z",
    productImages: [{ url: img(400, 400, "Forest Zip") }],
    services: [2],
    colors: [5],
  },
];

export const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Juan dela Cruz",
    slug: "juan-dela-cruz",
    email: "juan@email.com",
    contact_no: "09171234567",
    status: "active",
    created_at: "2024-03-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Maria Santos",
    slug: "maria-santos",
    email: "maria@email.com",
    contact_no: "09181234567",
    status: "active",
    created_at: "2024-03-02T08:00:00Z",
  },
  {
    id: 3,
    name: "Pedro Reyes",
    slug: "pedro-reyes",
    email: "pedro@email.com",
    contact_no: "09191234567",
    status: "active",
    created_at: "2024-03-03T08:00:00Z",
  },
  {
    id: 4,
    name: "Ana Gonzales",
    slug: "ana-gonzales",
    email: "ana@email.com",
    contact_no: "09201234567",
    status: "archived",
    created_at: "2024-03-04T08:00:00Z",
  },
];

export const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: "ABC Textiles",
    slug: "abc-textiles",
    contact_no: "09171111111",
    status: "active",
    created_at: "2024-03-01T08:00:00Z",
  },
  {
    id: 2,
    name: "XYZ Fabrics",
    slug: "xyz-fabrics",
    contact_no: "09172222222",
    status: "active",
    created_at: "2024-03-02T08:00:00Z",
  },
  {
    id: 3,
    name: "Metro Supplies",
    slug: "metro-supplies",
    contact_no: "09173333333",
    status: "archived",
    created_at: "2024-03-03T08:00:00Z",
  },
];

export const MOCK_INVENTORY = [
  {
    id: 1,
    name: "Black Ink",
    slug: "black-ink",
    quantity: 50,
    image: img(200, 200, "Ink"),
    status: "active",
    created_at: "2024-03-01T08:00:00Z",
  },
  {
    id: 2,
    name: "White Ink",
    slug: "white-ink",
    quantity: 30,
    image: img(200, 200, "Ink"),
    status: "active",
    created_at: "2024-03-02T08:00:00Z",
  },
  {
    id: 3,
    name: "Screen Mesh 110",
    slug: "screen-mesh-110",
    quantity: 20,
    image: img(200, 200, "Mesh"),
    status: "active",
    created_at: "2024-03-03T08:00:00Z",
  },
  {
    id: 4,
    name: "Squeegee Set",
    slug: "squeegee-set",
    quantity: 5,
    image: img(200, 200, "Tools"),
    status: "active",
    created_at: "2024-03-04T08:00:00Z",
  },
  {
    id: 5,
    name: "Old Emulsion",
    slug: "old-emulsion",
    quantity: 0,
    image: img(200, 200, "Chem"),
    status: "archived",
    created_at: "2024-03-05T08:00:00Z",
  },
];

export const MOCK_INVOICES = [
  {
    id: 1,
    invoice_number: "INV-0001",
    name: "Juan dela Cruz",
    email: "juan@email.com",
    contact: "09171234567",
    due_date: "2024-04-01",
    status: "paid",
    total: 1400,
    created_at: "2024-03-15T08:00:00Z",
    line_items: [{ description: "Black Tee x4", quantity: 4, price: 350 }],
  },
  {
    id: 2,
    invoice_number: "INV-0002",
    name: "Maria Santos",
    email: "maria@email.com",
    contact: "09181234567",
    due_date: "2024-04-10",
    status: "unpaid",
    total: 2250,
    created_at: "2024-03-16T08:00:00Z",
    line_items: [{ description: "Navy Hoodie x3", quantity: 3, price: 750 }],
  },
  {
    id: 3,
    invoice_number: "INV-0003",
    name: "Pedro Reyes",
    email: "pedro@email.com",
    contact: "09191234567",
    due_date: "2024-04-15",
    status: "unpaid",
    total: 900,
    created_at: "2024-03-17T08:00:00Z",
    line_items: [{ description: "White Polo x2", quantity: 2, price: 450 }],
  },
];

export const MOCK_INQUIRIES = [
  {
    id: 1,
    inquiry_number: "IN100001",
    name: "Jose Rizal",
    email: "jose@email.com",
    contact: "09171111111",
    product_type: "T-Shirt",
    service_type: "Screen Printing",
    priority: "high",
    status: "pending",
    created_at: "2024-03-20T08:00:00Z",
  },
  {
    id: 2,
    inquiry_number: "IN100002",
    name: "Andres Bonifacio",
    email: "andres@email.com",
    contact: "09172222222",
    product_type: "Hoodie",
    service_type: "Embroidery",
    priority: "normal",
    status: "responded",
    created_at: "2024-03-19T08:00:00Z",
  },
  {
    id: 3,
    inquiry_number: "IN100003",
    name: "Emilio Aguinaldo",
    email: "emilio@email.com",
    contact: "09173333333",
    product_type: "Polo",
    service_type: "DTF Printing",
    priority: "normal",
    status: "pending",
    created_at: "2024-03-18T08:00:00Z",
  },
];

export const MOCK_SYSTEM_USERS = [
  {
    id: 1,
    user_id: "USR-001",
    first_name: "Super",
    last_name: "Admin",
    username: "superadmin",
    email: "admin@fella.com",
    role: "admin",
    status: "active",
    last_login: "2024-03-22T02:00:00Z",
    created_at: "2024-01-01T08:00:00Z",
  },
  {
    id: 2,
    user_id: "USR-002",
    first_name: "John",
    last_name: "Staff",
    username: "johnstaff",
    email: "john@fella.com",
    role: "staff",
    status: "active",
    last_login: "2024-03-21T08:00:00Z",
    created_at: "2024-01-15T08:00:00Z",
  },
  {
    id: 3,
    user_id: "USR-003",
    first_name: "Maria",
    last_name: "Manager",
    username: "mariam",
    email: "maria@fella.com",
    role: "manager",
    status: "active",
    last_login: "2024-03-20T08:00:00Z",
    created_at: "2024-02-01T08:00:00Z",
  },
];

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    announcement_id: "ANN-001",
    text: "We are now accepting bulk orders for summer season!",
    status: "active",
    created_at: "2024-03-01T08:00:00Z",
  },
  {
    id: 2,
    announcement_id: "ANN-002",
    text: "New DTF printing service now available!",
    status: "active",
    created_at: "2024-03-10T08:00:00Z",
  },
  {
    id: 3,
    announcement_id: "ANN-003",
    text: "Holiday sale — 20% off all orders this December.",
    status: "archived",
    created_at: "2024-02-01T08:00:00Z",
  },
];

export const MOCK_FAQS = [
  {
    id: 1,
    faq_id: "FAQ-001",
    question: "What is your minimum order quantity?",
    answer: "Our minimum order is 12 pieces per design.",
    status: "active",
    sort_order: 1,
  },
  {
    id: 2,
    faq_id: "FAQ-002",
    question: "How long does production take?",
    answer: "Standard production takes 7-10 business days.",
    status: "active",
    sort_order: 2,
  },
  {
    id: 3,
    faq_id: "FAQ-003",
    question: "Do you offer rush orders?",
    answer: "Yes, rush orders are available for an additional 30% fee.",
    status: "active",
    sort_order: 3,
  },
  {
    id: 4,
    faq_id: "FAQ-004",
    question: "What file formats do you accept?",
    answer: "We accept AI, PDF, PNG (300dpi+), and PSD files.",
    status: "active",
    sort_order: 4,
  },
];

export const MOCK_REVIEWS = [
  {
    id: 1,
    review_id: "REV-001",
    name: "Kevin P.",
    text: "Affordable yet premium quality materials. Really impressed with the results!",
    rating: 5,
    status: "active",
    created_at: "2024-03-01T08:00:00Z",
  },
  {
    id: 2,
    review_id: "REV-002",
    name: "Maria S.",
    text: "Great customer service and the shirts came out perfect. Will order again!",
    rating: 4,
    status: "active",
    created_at: "2024-03-05T08:00:00Z",
  },
  {
    id: 3,
    review_id: "REV-003",
    name: "John D.",
    text: "Amazing quality prints! Super fast turnaround time. Highly recommended!",
    rating: 5,
    status: "active",
    created_at: "2024-03-10T08:00:00Z",
  },
];

export const MOCK_HERO_SLIDES = [
  {
    id: 1,
    slide_id: "SLD-001",
    image: img(1200, 600, "Hero Slide 1"),
    heading: "Print Your Vision, Wear Your Style",
    subheading: "High-quality printing for apparel and brands",
    cta_text: "Shop Now",
    cta_link: "/products",
    sort_order: 1,
    status: "active",
  },
  {
    id: 2,
    slide_id: "SLD-002",
    image: img(1200, 600, "Hero Slide 2"),
    heading: "Custom Printing for Every Occasion",
    subheading: "From bulk orders to individual pieces",
    cta_text: "Get a Quote",
    cta_link: "/contact",
    sort_order: 2,
    status: "active",
  },
];

export const MOCK_WORKS = [
  {
    id: 1,
    work_id: "WRK-001",
    image: img(600, 600, "Work 1"),
    sort_order: 1,
    status: "active",
  },
  {
    id: 2,
    work_id: "WRK-002",
    image: img(600, 600, "Work 2"),
    sort_order: 2,
    status: "active",
  },
  {
    id: 3,
    work_id: "WRK-003",
    image: img(600, 600, "Work 3"),
    sort_order: 3,
    status: "active",
  },
  {
    id: 4,
    work_id: "WRK-004",
    image: img(600, 600, "Work 4"),
    sort_order: 4,
    status: "active",
  },
];

export const MOCK_DASHBOARD = {
  activeProducts: 4,
  activeServices: 3,
  activeCategories: 3,
  systemUsers: 3,
  listedItems: 4,
  listedSuppliers: 2,
  listedCustomers: 3,
  totalInquiries: 3,
  highPriorityInquiries: [MOCK_INQUIRIES[0]],
  unpaidInvoices: [MOCK_INVOICES[1], MOCK_INVOICES[2]],
  recentInquiries: MOCK_INQUIRIES.slice(0, 3),
  recentInvoices: MOCK_INVOICES.slice(0, 3),
};

export const MOCK_AUTH = {
  success: true,
  token: "mock-jwt-token-for-preview",
  user: {
    id: 1,
    user_id: "USR-001",
    first_name: "Super",
    last_name: "Admin",
    username: "superadmin",
    email: "admin@fella.com",
    role: "admin",
    image: null,
  },
};

// ── Mock API interceptor ──────────────────────────────────────────────────────
const ok = (data) => Promise.resolve({ data: { success: true, data } });
const okList = (data) => Promise.resolve({ data: { success: true, data } });
const ok201 = (data) => Promise.resolve({ data: { success: true, ...data } });

export const enableMocks = (api) => {
  // Store original request
  const _request = api.request.bind(api);

  api.interceptors.request.use((config) => {
    config._mocked = true;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const { url = "", method = "get" } = error.config || {};
      const m = method.toLowerCase();

      // ── Auth ──────────────────────────────────────────────────────────────
      if (
        url.includes("/auth/admin/login") ||
        url.includes("/auth/staff/login")
      )
        return Promise.resolve({ data: MOCK_AUTH });
      if (url.includes("/auth/profile")) return ok(MOCK_SYSTEM_USERS[0]);

      // ── Dashboard ────────────────────────────────────────────────────────
      if (url.includes("/dashboard")) return ok(MOCK_DASHBOARD);

      // ── Products ──────────────────────────────────────────────────────────
      if (url.match(/\/products\/\d+/)) return ok(MOCK_PRODUCTS[0]);
      if (url.includes("/products")) return okList(MOCK_PRODUCTS);

      // ── Drafts ────────────────────────────────────────────────────────────
      if (url.includes("/drafts")) return okList([]);

      // ── Categories ────────────────────────────────────────────────────────
      if (url.match(/\/categories\/\d+/)) return ok(MOCK_CATEGORIES[0]);
      if (url.includes("/categories")) return okList(MOCK_CATEGORIES);

      // ── Colors ────────────────────────────────────────────────────────────
      if (url.match(/\/colors\/\d+/)) return ok(MOCK_COLORS[0]);
      if (url.includes("/colors")) return okList(MOCK_COLORS);

      // ── Services ──────────────────────────────────────────────────────────
      if (url.match(/\/services\/\d+/)) return ok(MOCK_SERVICES[0]);
      if (url.includes("/services")) return okList(MOCK_SERVICES);

      // ── Customers ─────────────────────────────────────────────────────────
      if (url.match(/\/customers\/\d+/)) return ok(MOCK_CUSTOMERS[0]);
      if (url.includes("/customers")) return okList(MOCK_CUSTOMERS);

      // ── Suppliers ─────────────────────────────────────────────────────────
      if (url.match(/\/suppliers\/\d+/)) return ok(MOCK_SUPPLIERS[0]);
      if (url.includes("/suppliers")) return okList(MOCK_SUPPLIERS);

      // ── Inventory ─────────────────────────────────────────────────────────
      if (url.match(/\/inventory\/\d+/)) return ok(MOCK_INVENTORY[0]);
      if (url.includes("/inventory")) return okList(MOCK_INVENTORY);

      // ── Invoices ──────────────────────────────────────────────────────────
      if (url.match(/\/invoices\/\d+/)) return ok(MOCK_INVOICES[0]);
      if (url.includes("/invoices")) return okList(MOCK_INVOICES);

      // ── Inquiries ─────────────────────────────────────────────────────────
      if (url.match(/\/inquiries\/\d+/)) return ok(MOCK_INQUIRIES[0]);
      if (url.includes("/inquiries")) return okList(MOCK_INQUIRIES);

      // ── System Users ──────────────────────────────────────────────────────
      if (url.match(/\/system-users\/\d+/)) return ok(MOCK_SYSTEM_USERS[0]);
      if (url.includes("/system-users")) return okList(MOCK_SYSTEM_USERS);

      // ── Announcements ─────────────────────────────────────────────────────
      if (url.includes("/announcements")) return okList(MOCK_ANNOUNCEMENTS);

      // ── FAQs ──────────────────────────────────────────────────────────────
      if (url.includes("/faqs")) return okList(MOCK_FAQS);

      // ── Reviews ───────────────────────────────────────────────────────────
      if (url.includes("/reviews/settings"))
        return ok({
          heading: "Trusted by Clients",
          subheading: "Real stories from people who've worked with us.",
        });
      if (url.includes("/reviews")) return okList(MOCK_REVIEWS);

      // ── Hero ──────────────────────────────────────────────────────────────
      if (url.includes("/hero")) return okList(MOCK_HERO_SLIDES);

      // ── Works ─────────────────────────────────────────────────────────────
      if (url.includes("/works")) return okList(MOCK_WORKS);

      // ── About ─────────────────────────────────────────────────────────────
      if (url.includes("/about"))
        return ok({
          heading: "Quality Prints. Crafted With Purpose.",
          subheading: "We specialize in custom clothing printing.",
          body: "Fella Screen Prints is a service that provides high-quality custom printing.",
          image: null,
        });

      // ── Contact ───────────────────────────────────────────────────────────
      if (url.includes("/contact"))
        return ok({
          mobile: "+639876543210",
          email: "hello@fellascreenprints.com",
          location_text: "Makati City, Philippines",
          map_embed_url: "",
          social_links: [],
        });

      // ── Upload (no-op in mock mode) ───────────────────────────────────────
      if (url.includes("/upload"))
        return ok201({ url: img(400, 400, "Uploaded") });

      // Fallback — return empty success
      return ok(null);
    },
  );

  console.log("🎭 Mock API enabled — no backend required");
};
