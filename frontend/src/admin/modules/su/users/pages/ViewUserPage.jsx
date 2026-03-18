import Breadcrumb from "../../../../components/common/Breadcrumb";
import ViewUserDetails from "../components/ViewUserDetails";

const ViewUserPage = () => {
  return (
    <div>
      <Breadcrumb title="System Users" />
      <ViewUserDetails />
    </div>
  );
};

export default ViewUserPage;
