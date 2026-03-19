import { useState, useEffect } from "react";
import SectionTitle from "../../common/SectionTitle";
import "./about.css";
import { getImageUrl } from "../../../../services/imageUrl";

const AboutLayout = () => {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => setAbout(data.data || null))
      .catch(console.error);
  }, []);

  // Fallback to static content while loading or if fetch fails
  const heading = about?.heading || "Quality Prints. Crafted With Purpose.";
  const subheading =
    about?.subheading ||
    "We specialize in custom clothing printing that helps brands, teams, and individuals wear their identity with confidence.";
  const body =
    about?.body ||
    "Fella Screen Prints is a service that offers a direct-to-film printing. Specializing in custom apparel and merchandise for individuals, small brands, events, and organizations.";
  const image = about?.image ? getImageUrl(about.image) : null;

  return (
    <section
      id="about-us"
      className="about_section"
      style={
        image
          ? {
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="max-w-2xl mx-auto py-50 px-8 md:py-50">
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 text-white text-center">
          <SectionTitle title={heading} />
          {subheading && (
            <p className="text-sm md:text-md text-center text-gray-300 pb-6">
              {subheading}
            </p>
          )}
          {body && (
            <p className="text-white text-lg font-small text-center pt-10">
              {body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutLayout;
