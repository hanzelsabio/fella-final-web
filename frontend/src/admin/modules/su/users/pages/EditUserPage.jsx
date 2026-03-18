import Breadcrumb from "../../../../components/common/Breadcrumb";
import EditUserForm from "../components/EditUserForm";

const EditUserPage = () => {
  return (
    <div>
      <Breadcrumb title="System Users" />
      <EditUserForm />
    </div>
  );
};

export default EditUserPage;
