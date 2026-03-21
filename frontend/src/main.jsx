import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";

import ScrollToHash from "./website/components/helper/ScrollToHash";
import ScrollToTop from "./website/components/helper/ScrollToTop";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import api from "./services/api";
import { enableMocks } from "./services/mockData";

if (import.meta.env.VITE_USE_MOCKS === "true") {
  enableMocks(api);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <ScrollToHash />
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
