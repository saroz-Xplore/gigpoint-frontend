
import Header from "../components/header";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer";
import ChatBot from "../components/ChatBot";

const RootLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ChatBot />
    </>
  );
};

export default RootLayout;
