/**
 * validators.js
 * Reusable express-validator chains for every entity in your project.
 * Usage: import { validateProduct } from "./validators.js"
 *        router.post("/products", validateProduct, yourController)
 *
 * The validate() helper at the bottom collects all errors and returns
 * a 400 with the full list if anything fails — no extra code in controllers.
 */

import { body, param, query, validationResult } from "express-validator";

// ── Helper: run after any validator chain ────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── ID params ─────────────────────────────────────────────────────────────────
export const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  validate,
];

export const validateSlug = [
  param("slug").trim().isSlug().withMessage("Invalid slug format"),
  validate,
];

// ── Auth ──────────────────────────────────────────────────────────────────────
export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

export const validateRegister = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("first_name")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .escape()
    .withMessage("First name is required"),
  body("last_name")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .escape()
    .withMessage("Last name is required"),
  validate,
];

// ── Products ──────────────────────────────────────────────────────────────────
export const validateProduct = [
  body("title")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Title is required (max 255 chars)"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("category").isInt({ min: 1 }).withMessage("Category must be a valid ID"),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("Status must be active or archived"),
  body("description").optional().trim().isLength({ max: 5000 }).escape(),
  validate,
];

// ── Categories ────────────────────────────────────────────────────────────────
export const validateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Name is required"),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("Invalid status"),
  validate,
];

// ── Customers ─────────────────────────────────────────────────────────────────
export const validateCustomer = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("mobile")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Invalid mobile number"),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("Invalid status"),
  validate,
];

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const validateSupplier = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Name is required"),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("mobile").optional().trim().isMobilePhone(),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("Invalid status"),
  validate,
];

// ── Invoices ──────────────────────────────────────────────────────────────────
export const validateInvoice = [
  body("customer_id")
    .isInt({ min: 1 })
    .withMessage("Valid customer ID required"),
  body("total")
    .isFloat({ min: 0 })
    .withMessage("Total must be a non-negative number"),
  body("status")
    .optional()
    .isIn(["paid", "unpaid", "archived"])
    .withMessage("Invalid status"),
  body("due_date").optional().isISO8601().withMessage("Invalid date format"),
  validate,
];

// ── Inquiries ─────────────────────────────────────────────────────────────────
export const validateInquiry = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("message")
    .trim()
    .notEmpty()
    .isLength({ max: 5000 })
    .escape()
    .withMessage("Message is required"),
  body("priority")
    .optional()
    .isIn(["low", "normal", "high"])
    .withMessage("Invalid priority"),
  validate,
];

// ── Services ──────────────────────────────────────────────────────────────────
export const validateService = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Name is required"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("Invalid status"),
  validate,
];

// ── Colorways ─────────────────────────────────────────────────────────────────
export const validateColorway = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .escape()
    .withMessage("Name is required"),
  body("hex_code")
    .optional()
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage("Invalid hex color code"),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("Invalid status"),
  validate,
];

// ── System Users ──────────────────────────────────────────────────────────────
export const validateSystemUser = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("first_name")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .escape()
    .withMessage("First name is required"),
  body("last_name")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .escape()
    .withMessage("Last name is required"),
  body("role")
    .isIn(["admin", "staff"])
    .withMessage("Role must be admin or staff"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  validate,
];

// ── CMS: Contact ──────────────────────────────────────────────────────────────
export const validateContact = [
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("mobile").optional().trim().isMobilePhone(),
  body("location_text").optional().trim().isLength({ max: 500 }).escape(),
  body("map_embed_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid map URL"),
  body("social_links")
    .optional()
    .isArray()
    .withMessage("Social links must be an array"),
  body("social_links.*.platform")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .escape(),
  body("social_links.*.url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid social link URL"),
  body("social_links.*.text").optional().trim().isLength({ max: 100 }).escape(),
  validate,
];

// ── CMS: About / Reviews / Announcements / FAQs / Hero ────────────────────────
export const validateAbout = [
  body("heading")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .escape()
    .withMessage("Heading is required"),
  body("subheading").optional().trim().isLength({ max: 500 }).escape(),
  body("body").optional().trim().isLength({ max: 10000 }),
  validate,
];

export const validateReview = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .escape()
    .withMessage("Name is required"),
  body("text")
    .trim()
    .notEmpty()
    .isLength({ max: 2000 })
    .escape()
    .withMessage("Review text is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  validate,
];

export const validateAnnouncement = [
  body("text")
    .trim()
    .notEmpty()
    .isLength({ max: 1000 })
    .escape()
    .withMessage("Announcement text is required"),
  validate,
];

export const validateFaq = [
  body("question")
    .trim()
    .notEmpty()
    .isLength({ max: 500 })
    .escape()
    .withMessage("Question is required"),
  body("answer")
    .trim()
    .notEmpty()
    .isLength({ max: 5000 })
    .escape()
    .withMessage("Answer is required"),
  validate,
];
