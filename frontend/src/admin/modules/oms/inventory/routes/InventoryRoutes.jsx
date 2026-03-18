import { Routes, Route } from "react-router-dom";
import { InventoryProvider } from "../context/InventoryContext";

import InventoryPage from "../pages/InventoryPage";
import ViewItemPage from "../pages/ViewItemPage";
import AddItemPage from "../pages/AddItemPage";
import EditItemPage from "../pages/EditItemPage";

const InventoryRoutes = () => {
  return (
    <InventoryProvider>
      <Routes>
        <Route index element={<InventoryPage />} />
        <Route path="view/:slug" element={<ViewItemPage />} />
        <Route path="new" element={<AddItemPage />} />
        <Route path="edit/:slug" element={<EditItemPage />} />
      </Routes>
    </InventoryProvider>
  );
};

export default InventoryRoutes;
