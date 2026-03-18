import { Routes, Route } from "react-router-dom";
import { ProductProvider } from "../context/ProductContext";

import ProductPage from "../pages/ProductPage";
import ProductDetails from "../components/ProductDetails";

const ProductRoutes = () => {
  return (
    <ProductProvider>
      <Routes>
        <Route index element={<ProductPage />} />
        <Route path="/:slug" element={<ProductDetails />} />
      </Routes>
    </ProductProvider>
  );
};

export default ProductRoutes;
