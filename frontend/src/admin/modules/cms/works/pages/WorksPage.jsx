import { WorksProvider } from "../context/WorksContext";
import WorksDetails from "../components/WorksDetails";
import Breadcrumb from "../../../../components/common/Breadcrumb";

const WorksPage = () => (
  <WorksProvider>
    <div>
      <Breadcrumb title="Our Works" />
      <WorksDetails />
    </div>
  </WorksProvider>
);

export default WorksPage;
