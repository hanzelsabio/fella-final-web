import { useState, useEffect } from "react";
import ContactGoogleMap from "./ContactGoogleMap";
import ContactSocialLinks from "./ContactSocialLinks";
import "../assets/styles/contact.css";

const ContactLayout = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setSettings(data.data || null))
      .catch(console.error);
  }, []);

  return (
    <div
      id="contact-page-section"
      className="contact_page_section flex justify-center items-center"
    >
      <div className="max-w-5xl mx-auto w-full py-20 px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Social Links */}
          <div className="col-span-1 md:col-span-4 lg:col-span-1 md:px-30 lg:px-0">
            <ContactSocialLinks settings={settings} />
          </div>

          {/* Map */}
          <div className="md:col-span-4 lg:col-span-2">
            <ContactGoogleMap embedUrl={settings?.map_embed_url} />
          </div>

          {/* Location text */}
          {settings?.location_text && (
            <div className="md:col-span-4 col-start-1 text-center py-10">
              <p>
                <span className="font-semibold">We're located at:</span>{" "}
                {settings.location_text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactLayout;
