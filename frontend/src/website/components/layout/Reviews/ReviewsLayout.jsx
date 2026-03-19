import { useState, useEffect, useRef } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import SectionTitle from "../../common/SectionTitle";
import "./reviews.module.css";

const ReviewsLayout = () => {
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const hasMounted = useRef(false);

  // ✅ Fetch reviews and settings together
  useEffect(() => {
    Promise.all([
      fetch("/api/reviews/active").then((r) => r.json()),
      fetch("/api/reviews/settings").then((r) => r.json()),
    ])
      .then(([reviewsData, settingsData]) => {
        setReviews(reviewsData.data || []);
        setSettings(settingsData.data || null);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || !reviews.length) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    slider.scrollTo({ left: slider.clientWidth * current, behavior: "smooth" });
  }, [current, reviews]);

  // ✅ Use DB values with fallbacks
  const heading = settings?.heading || "Trusted by Clients, Proven by Results.";
  const subheading =
    settings?.subheading ||
    "Real stories from people who've worked with us and seen the difference.";

  if (!reviews.length) return null;

  return (
    <section
      id="reviews"
      className="reviews_section bg-black text-white px-6 pt-30"
    >
      <SectionTitle title={heading} />
      {subheading && (
        <p className="text-sm md:text-md text-center text-gray-300 pb-6">
          {subheading}
        </p>
      )}

      {/* Mobile Slider */}
      <div className="lg:hidden pt-10">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="min-w-full snap-center p-6 shadow-lg flex flex-col items-center text-center"
            >
              <p className="italic text-md leading-relaxed mb-4">
                "{review.text}"
              </p>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) =>
                  i < review.rating ? (
                    <FaStar key={i} className="text-yellow-400" />
                  ) : (
                    <FaRegStar key={i} className="text-yellow-400" />
                  ),
                )}
              </div>
              <h3 className="text-lg font-bold">{review.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-3 gap-6 pt-10">
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="p-6 shadow-lg flex flex-col items-center text-center hover:scale-105 transition"
          >
            <p className="italic text-md leading-relaxed mb-4">
              "{review.text}"
            </p>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) =>
                i < review.rating ? (
                  <FaStar key={i} className="text-yellow-400" />
                ) : (
                  <FaRegStar key={i} className="text-yellow-400" />
                ),
              )}
            </div>
            <h3 className="text-lg font-bold">{review.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsLayout;
