import { useState, useEffect } from "react";
import { X } from "lucide-react";

function AnnouncementLayout() {
  const [announcements, setAnnouncements] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Fetch active announcements from backend
  useEffect(() => {
    fetch("/api/announcements/active")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data.data || []))
      .catch(console.error);
  }, []);

  // Auto-slide every 12 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [announcements]);

  // Don't render if dismissed or no announcements
  if (!visible || announcements.length === 0) return null;

  return (
    <section className="announcement_section bg-black text-xs text-white py-2 px-6 overflow-hidden relative select-none">
      {/* Dismiss Button */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-50 pointer-events-auto"
        style={{ cursor: "pointer" }}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Slider */}
      <div
        className="whitespace-nowrap transition-transform duration-700 text-center"
        style={{ transform: `translateX(-${index * 100}%)`, display: "flex" }}
      >
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="w-full flex-shrink-0 text-center px-6"
          >
            {announcement.text}
          </div>
        ))}
      </div>
    </section>
  );
}

export default AnnouncementLayout;
