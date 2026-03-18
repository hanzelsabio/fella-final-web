import Breadcrumb from "../../../../components/common/Breadcrumb";
import DraftProductTable from "../components/DraftProductTable";

const ManageProductPage = () => {
  return (
    <div>
      <Breadcrumb title="Drafts" />
      <DraftProductTable />
    </div>
  );
};

export default ManageProductPage;
