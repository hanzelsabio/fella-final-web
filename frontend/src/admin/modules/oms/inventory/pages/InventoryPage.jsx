import Breadcrumb from "../../../../components/common/Breadcrumb";
import InventoryTable from "../components/InventoryTable";

const InventoryPage = () => {
  return (
    <div>
      <Breadcrumb title="Items" />
      <InventoryTable />
    </div>
  );
};

export default InventoryPage;
