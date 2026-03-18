import { Link } from "react-router-dom";

import "../../../src/assets/styles/global.css";

function NotFound() {
  return (
    <section className="not_found flex flex-col items-center justify-center min-h-[80vh] text-center">
      {/* <h2 className="text-4xl font-bold mb-4 text-red-600">404</h2> */}
      <div className="pt-30 pb-50">
        <img src="/not-found.png" className="w-full" alt="404" />
        <p className="text-gray-600 mb-6">
          The page you requested does not exist.
        </p>
        <Link
          to="/"
          className="underline hover:text-gray-500 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
