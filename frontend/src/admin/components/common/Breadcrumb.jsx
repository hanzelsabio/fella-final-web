import { Link, useLocation } from "react-router-dom";

const Breadcrumb = ({ title }) => {
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  return (
    <div className="flex h-18 items-center justify-between">
      <h1 className="text-md sm:text-lg font-semibold">{title}</h1>
      <ol className="flex items-center gap-1.5">
        <li>
          <Link
            className="inline-flex items-center gap-1.5 text-sm text-gray-500"
            to={`${basePath}/dashboard`}
          >
            Home
            <svg
              className="stroke-current"
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </li>
        <li className="text-sm text-gray-800">{title}</li>
      </ol>
    </div>
  );
};

export default Breadcrumb;
