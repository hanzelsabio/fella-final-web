import Breadcrumb from "../../../../components/common/Breadcrumb";
import CreateUserForm from "../components/CreateUserForm";

const CreateUserPage = () => {
  return (
    <div>
      <Breadcrumb title="System Users" />
      <CreateUserForm />
    </div>
  );
};

export default CreateUserPage;
