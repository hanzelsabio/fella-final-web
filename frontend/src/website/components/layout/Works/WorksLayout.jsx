import { useState, useEffect, useRef, useCallback } from "react";
import { getImageUrl } from "../../../../services/api";
import "./works.css";

function WorksLayout() {
  const [works, setWorks] = useState([]);
  const sliderRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const hasMounted = useRef(false);

  // ✅ Fetch active works from backend
  useEffect(() => {
    fetch("/api/works/active")
      .then((res) => res.json())
      .then((data) => setWorks(data.data || []))
      .catch(console.error);
  }, []);

  const totalSlides = works.length;

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || !totalSlides) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const slide = slider.children[current];
    if (!slide) return;
    slider.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }, [current, totalSlides]);

  if (!works.length) return null;

  return (
    <section id="our-works" className="our_works_section relative">
      <div className="mx-auto relative">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {works.map((work, index) => (
            <div
              key={work.id}
              className="snap-start flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
            >
              <img
                src={getImageUrl(work.image)}
                alt={`Work ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-600 p-3 transition"
          style={{ cursor: "pointer" }}
        >
          ❮
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-600 p-3 transition"
          style={{ cursor: "pointer" }}
        >
          ❯
        </button>
      </div>
    </section>
  );
}

export default WorksLayout;
