import { Routes, Route } from "react-router-dom";
import { ProductProvider } from "../context/ProductContext";

import ProductPage from "../pages/ProductPage";
import AddProductPage from "../pages/AddProductPage";
import DraftProductPage from "../pages/DraftProductPage";
import ManageDraftPage from "../pages/ManageDraftPage";
import ViewProductPage from "../pages/ViewProductPage";
import EditProductPage from "../pages/EditProductPage";

const ProductRoutes = () => {
  return (
    <ProductProvider>
      <Routes>
        <Route index element={<ProductPage />} />
        <Route path="new" element={<AddProductPage />} />
        <Route path="draft/:id" element={<DraftProductPage />} />
        <Route path="drafts" element={<ManageDraftPage />} />
        <Route path="view/:slug" element={<ViewProductPage />} />
        <Route path="edit/:slug" element={<EditProductPage />} />
      </Routes>
    </ProductProvider>
  );
};

export default ProductRoutes;
