import { Routes, Route } from "react-router-dom";
import { ColorwayProvider } from "../context/ColorwayContext";

import ColorwayPage from "../pages/ColorwayPage";
import AddColorwayPage from "../pages/AddColorwayPage";
import EditColorwayPage from "../pages/EditColorwayPage";

const ColorwayRoutes = () => {
  return (
    <ColorwayProvider>
      <Routes>
        <Route index element={<ColorwayPage />} />
        <Route path="new" element={<AddColorwayPage />} />
        <Route path="edit/:id" element={<EditColorwayPage />} />
      </Routes>
    </ColorwayProvider>
  );
};

export default ColorwayRoutes;
