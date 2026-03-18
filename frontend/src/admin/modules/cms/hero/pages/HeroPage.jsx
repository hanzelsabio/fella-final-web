import { HeroProvider } from "../context/HeroContext";
import HeroDetails from "../components/HeroDetails";
import Breadcrumb from "../../../../components/common/Breadcrumb";

const HeroPage = () => (
  <HeroProvider>
    <div>
      <Breadcrumb title="Hero" />
      <HeroDetails />
    </div>
  </HeroProvider>
);

export default HeroPage;
