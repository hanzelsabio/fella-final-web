import Breadcrumb from "../../../../components/common/Breadcrumb";
import UsersTable from "../components/UsersTable";

const UsersPage = () => {
  return (
    <div>
      <Breadcrumb title="System Users" />
      <UsersTable />
    </div>
  );
};

export default UsersPage;
