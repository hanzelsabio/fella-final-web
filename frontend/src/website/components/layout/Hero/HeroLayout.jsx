import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../../../services/api";
import "./hero.css";

function HeroLayout() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/hero/active")
      .then((res) => res.json())
      .then((data) => setSlides(data.data || []))
      .catch(console.error);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // ── Auto-slide every 6 seconds ──────────────────────────────────
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(goToNext, 10000);
    return () => clearInterval(interval);
  }, [slides.length, goToNext]);

  // ── Fallback if no slides ───────────────────────────────────────
  if (slides.length === 0) {
    return (
      <section
        id="hero_section"
        className="relative text-white flex items-center justify-center shadow-md py-50 z-20 min-h-[90vh]"
      >
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 text-white text-center px-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Print Your Vision, Wear Your Style
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Fella Screen Prints delivers high-quality direct-to-film printing
            for apparel, merchandise, and brands.
          </p>
        </div>
      </section>
    );
  }

  const slide = slides[currentIndex];

  return (
    <section
      id="hero_section"
      className="relative text-white flex items-center justify-center shadow-md z-20 min-h-[90vh] overflow-hidden"
    >
      {/* Background image with transition */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${getImageUrl(s.image)})`,
            opacity: i === currentIndex ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Content */}
      <div className="relative z-10 text-white text-center px-8">
        {slide.heading && (
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            {slide.heading}
          </h1>
        )}
        {slide.subheading && (
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            {slide.subheading}
          </p>
        )}
        {slide.cta_text && slide.cta_link && (
          <Link
            to={slide.cta_link}
            className="inline-block mt-6 px-8 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-100 transition-colors text-sm"
          >
            {slide.cta_text}
          </Link>
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroLayout;
