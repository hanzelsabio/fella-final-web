import { MessageCircle, Phone } from "lucide-react";

const ContactBanner = () => {
  return (
    <>
      <div
        id="getstarted_section"
        className="bg-black text-white flex items-center justify-center px-8 py-20"
      >
        {/* <div className="absolute inset-0 bg-black/70 z-0"></div> */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-5">
            For Immediate Assistance
          </h2>
          <p className="text-gray-300 text-sm text-center mb-5">
            Feel free to contact us directly for immediate response
          </p>
          <div className="flex grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <button className="bg-gray-100 hover:bg-gray-200 rounded text-sm px-4 py-3">
              <div className="flex items-center justify-center text-black">
                <MessageCircle className="w-4 h-4" />
                <span className="ps-2">Chat with Us Now</span>
              </div>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded text-sm px-4 py-3">
              <a href="tel:+63-987-654-3210" className="text-black">
                <div className="flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                  <span className="ps-2">Call Us: +63-987-654-3210</span>
                </div>
              </a>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactBanner;
