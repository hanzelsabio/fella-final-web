import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import SectionTitle from "../../../components/common/SectionTitle";
import Button from "../../../components/common/Button/Button";

import "../assets/inquiry.css";

function InquiryForm() {
  const { state } = useLocation();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    service: "",
    product: "",
    message: "",
  });

  const SESSION_KEY = "inquiryFormSubmitted";

  const [submitted, setSubmitted] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  });
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation Function
  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter a valid email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    if (!formData.product) {
      newErrors.product = "No product selected";
    }

    if (!formData.service) {
      newErrors.service = "No service selected";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message must be at least 10 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/inquiries/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!data.success) {
        setErrors({
          general:
            data.message || "Failed to submit inquiry. Please try again.",
        });
        return;
      }

      // Success
      sessionStorage.setItem(SESSION_KEY, "true");
      setSubmitted(true);
      setShowModal(true);

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        service: "",
        product: "",
        message: "",
      });

      setErrors({});
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ general: "Something went wrong. Please try again." });
    }
  };

  useEffect(() => {
    if (state?.service || state?.product) {
      setFormData((prev) => ({
        ...prev,
        // DB uses 'name', some objects may use 'title' — cover both
        service: state?.service?.title || state?.service?.name || "",
        product: state?.product?.title || state?.product?.name || "",
      }));
    }
  }, [state]);

  if (!state?.service && !state?.product) {
    // Show a warning or redirect
  }

  return (
    <section id="inquiry-section" className="inquiry_section text-center">
      <div className="max-w-2xl mx-auto px-8 py-20">
        {!submitted ? (
          <div className="">
            <SectionTitle title="SERVICE INQUIRY FORM" />

            <form
              onSubmit={handleSubmit}
              className="text-sm text-left space-y-6"
            >
              {/* General error */}
              {errors.general && (
                <p className="text-red-500 text-sm text-center">
                  {errors.general}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Other fields */}
                <div>
                  <label className="block text-md font-semibold mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full border text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-md font-semibold mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full border text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-md font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full border text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-md font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+639876543210"
                    className="w-full border text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Product Field */}
                <div>
                  <label className="block text-md font-semibold mb-1">
                    Selected Product
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    readOnly
                    className="w-full border font-semibold text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  />
                  {errors.product && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.product}
                    </p>
                  )}
                </div>

                {/* Service Field */}
                <div>
                  <label className="block text-md font-semibold mb-1">
                    Selected Service
                  </label>
                  <input
                    type="text"
                    name="service"
                    value={formData.service}
                    readOnly
                    className="w-full border font-semibold text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  />
                  {errors.service && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.service}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-md font-semibold mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Your inquiry message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border text-gray-700 border-gray-400 rounded px-8 py-3.5 focus:outline-none"
                  rows="8"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  className="bg-black text-white rounded-md px-8 py-3.5 hover:bg-gray-800"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-50">
            <h2 className="text-xl font-semibold mb-10">Inquiry Sent</h2>
            <p className="max-w-xl text-gray-600">
              You have already submitted an inquiry during this session. If you
              want to send another inquiry, please{" "}
              <span className="font-medium text-black">
                close the current tab/window and reopen another.
              </span>
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed p-5 inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity"
          onClick={closeModal}
        >
          <div className="rounded-md bg-white p-8 md:px-20 py-8 shadow-xl max-w-lg text-center relative animate-fadeIn">
            <h2 className="text-xl font-semibold mb-5">Message Sent!</h2>
            <p className="text-gray-700">
              Your inquiry has been successfully submitted.
            </p>
            <Button
              onClick={closeModal}
              className="rounded-md bg-black hover:bg-gray-800 mt-6"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn .25s ease-out;
        }
      `}
      </style>
    </section>
  );
}

export default InquiryForm;
