import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

export default function FooterLayoutTwo() {
  return (
    <footer className="footer_section bg-transparent text-xs text-center py-4">
      {/* Center logo */}
      <div className="flex grid grid-cols-1 md:grid-cols-2">
        <div id="newsletter_section" className="bg-black py-12 sm:px-12">
          <div className="newsletter_body max-w-md mx-auto text-center">
            <h2 className="newsletter_heading md:text-start md:text-xl font-bold text-white my-2 uppercase">
              Newsletter
            </h2>
            <p className="md:text-start text-sm mt-2 mb-5">
              Receive latest updates
            </p>

            {/* Newsletter Form */}
            <form className="flex flex-col sm:flex-row text-xs items-center justify-start gap-3 mb-8">
              <input
                type="email"
                value=""
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="min-w-[300px] text-white px-4 py-3.5 border border-gray-300 focus:outline-none focus:outline-none"
              />
            </form>
          </div>
        </div>
        <div className="flex justify-center py-20">
          <Link to="/">
            <img
              src="/fella-screen-prints-logo.png"
              className="w-40"
              alt="Brand Logo"
            />
          </Link>
        </div>
      </div>

      <p>
        © {new Date().getFullYear()} Fella Screen Prints. All rights reserved.
      </p>
    </footer>
  );
}
