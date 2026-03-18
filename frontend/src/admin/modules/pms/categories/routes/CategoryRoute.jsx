import { Routes, Route } from "react-router-dom";
import { CategoryProvider } from "../context/CategoryContext";

import CategoryPage from "../pages/CategoryPage";
import AddCategoryPage from "../pages/AddCategoryPage";
import EditCategoryPage from "../pages/EditCategoryPage";

const CategoryRoutes = () => {
  return (
    <CategoryProvider>
      <Routes>
        <Route index element={<CategoryPage />} />
        <Route path="new" element={<AddCategoryPage />} />
        <Route path="edit/:id" element={<EditCategoryPage />} />
      </Routes>
    </CategoryProvider>
  );
};

export default CategoryRoutes;
