import { useState, useEffect } from "react";
import SectionTitle from "../../common/SectionTitle";
import "./faqs.css";

const FaqsLayout = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  // Fetch active FAQs from backend
  useEffect(() => {
    fetch("/api/faqs/active")
      .then((res) => res.json())
      .then((data) => setFaqs(data.data || []))
      .catch(console.error);
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="faq_section text-center py-12 min-h-[40vh]">
      <div className="brand-faq max-w-5xl mx-auto p-8">
        <SectionTitle title="FREQUENTLY ASKED QUESTIONS" />

        {faqs.length === 0 ? null : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="faq-item border border-gray-400 sm:mx-10"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="faq-question flex justify-between items-center w-full text-left text-md font-semibold focus:outline-none px-5 py-3"
                  style={{ cursor: "pointer" }}
                >
                  <span>{faq.question}</span>
                  <span className="icon text-md">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </button>

                {activeIndex === index && (
                  <div className="faq-answer text-start bg-gray-100 text-gray-600 border-t border-gray-400 px-5 py-5 text-base">
                    {/* Support both plain string and line-break-separated text */}
                    {faq.answer.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FaqsLayout;
