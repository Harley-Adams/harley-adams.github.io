import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AddToHomeScreen from "./AddToHomeScreen";
import { ToastContainer } from "react-toastify";
import { atom, useRecoilState } from "recoil";

const showNavbarState = atom<boolean>({
  key: "showNavbarState",
  default: true,
});

const Layout = () => {
  useRecoilState(showNavbarState);
  return (
    <div>
      <AddToHomeScreen />
      <ToastContainer />
      <Navbar /> <Outlet />
    </div>
  );
};
export default Layout;
