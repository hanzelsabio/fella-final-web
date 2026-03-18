import Breadcrumb from "../../../../components/common/Breadcrumb";
import DraftProductForm from "../components/DraftProductForm";

const DraftProductPage = () => {
  return (
    <div>
      <Breadcrumb title="New Product" />
      <DraftProductForm />
    </div>
  );
};

export default DraftProductPage;
