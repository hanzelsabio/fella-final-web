import { Link } from "react-router-dom";

const GetStartedLayout = () => {
  return (
    <>
      <div
        id="getstarted_section"
        className="bg-black text-white flex items-center justify-center px-8 py-20"
      >
        {/* <div className="absolute inset-0 bg-black/70 z-0"></div> */}
        <div className="flex grid grid-cols-1 lg:grid-cols-2 items-center justify-between px-6 z-10 gap-6">
          {/* LEFT CONTENT */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Why Choose Fella Screen Prints for Your Custom Apparel?
            </h2>
            <p className="text-gray-300 text-sm text-center lg:text-start">
              Get high-quality screen printing for shirts and custom apparel.
              Fast turnaround, premium results, and designs that last. Your
              brand, business, or personal project — we print it with care.
            </p>
          </div>

          {/* RIGHT CONTENT (BUTTONS) */}
          <div className="flex items-center justify-center lg:justify-end gap-6">
            <Link
              to="/package"
              className="bg-gray-100 hover:bg-gray-200 text-black rounded-full px-8 py-3.5 font-small transition text-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetStartedLayout;
