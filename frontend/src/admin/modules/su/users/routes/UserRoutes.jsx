import { Routes, Route } from "react-router-dom";
import { SystemUserProvider } from "../context/SystemUserContext";

import UsersPage from "../pages/UsersPage";
import CreateUserPage from "../pages/CreateUserPage";
import ViewUserPage from "../pages/ViewUserPage";
import EditUserPage from "../pages/EditUserPage";

const UserRoutes = () => {
  return (
    <SystemUserProvider>
      <Routes>
        <Route index element={<UsersPage />} />
        <Route path="new" element={<CreateUserPage />} />
        <Route path="view/:id" element={<ViewUserPage />} />
        <Route path="edit/:id" element={<EditUserPage />} />
      </Routes>
    </SystemUserProvider>
  );
};

export default UserRoutes;
