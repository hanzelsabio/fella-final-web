import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { setupSecurity } from "./middleware/security.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

import productRoutes from "./routes/products.js";
import draftRoutes from "./routes/drafts.js";
import serviceRoutes from "./routes/services.js";
import categoryRoutes from "./routes/categories.js";
import colorRoutes from "./routes/colors.js";
import uploadRoutes from "./routes/upload.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import systemUserRoutes from "./routes/systemUserRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import worksRoutes from "./routes/worksRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import faqsRoutes from "./routes/faqsRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── 1. Security (replaces manual cors + bodyParser) ───────────────────────────
setupSecurity(app);

// ── 2. Static uploads ─────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── 3. Routes ─────────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/system-users", systemUserRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/works", worksRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/faqs", faqsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);

// ── 4. 404 + error handler (must be last) ────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
