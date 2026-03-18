import { BsInstagram, BsTelephone } from "react-icons/bs";
import { FiFacebook } from "react-icons/fi";
import { PiTiktokLogo } from "react-icons/pi";
import { AtSign, Twitter, Youtube, Linkedin } from "lucide-react";
import "../assets/styles/contact.css";

// Map platform names to icons
const ICON_MAP = {
  Facebook: <FiFacebook className="w-5 h-5" />,
  Instagram: <BsInstagram className="w-5 h-5" />,
  TikTok: <PiTiktokLogo className="w-5 h-5" />,
  "Twitter/X": <Twitter className="w-5 h-5" />,
  YouTube: <Youtube className="w-5 h-5" />,
  LinkedIn: <Linkedin className="w-5 h-5" />,
  "Mobile Number": <BsTelephone className="w-5 h-5" />,
  Email: <AtSign className="w-5 h-5" />,
};

function ContactSocialLinks({ settings }) {
  if (!settings) return null;

  const socialLinks = settings.social_links || [];

  // ── Always-shown contact info ───────────────────────────────────
  const contactInfo = [
    settings.mobile && {
      key: "mobile",
      icon: ICON_MAP["Mobile Number"],
      link: `tel:${settings.mobile}`,
      title: "Mobile Number",
      text: settings.mobile,
    },
    settings.email && {
      key: "email",
      icon: ICON_MAP["Email"],
      link: `mailto:${settings.email}`,
      title: "Email",
      text: settings.email,
    },
  ].filter(Boolean);

  const allLinks = [
    ...socialLinks.map((s) => ({
      key: s.id,
      icon: ICON_MAP[s.platform] || <AtSign className="w-5 h-5" />,
      link: s.url,
      title: s.platform,
      text: s.text || s.url,
    })),
    ...contactInfo,
  ];

  if (!allLinks.length) return null;

  return (
    <section id="social_media_accounts">
      <h1 className="text-2xl text-center lg:text-start font-semibold uppercase">
        Connect with us
      </h1>
      <div className="grid grid-cols-1 gap-3 py-10">
        {allLinks.map((social) => (
          <div key={social.key}>
            <a
              href={social.link || "#"}
              target={social.link?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-start gap-4 hover:text-green-500 transition"
            >
              <div className="text-sm md:text-md uppercase py-2">
                <h1 className="font-bold">{social.title}</h1>
                <p>{social.text}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ContactSocialLinks;
