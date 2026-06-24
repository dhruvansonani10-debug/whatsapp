import React, { useLayoutEffect } from "react";
import useThemeStore from "../../store/themeStore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserStore from "../../store/useUserStore";
import useLayoutStore from "../../store/layoutStore";
import { FaWhatsapp,FaUser,FaCog,FaRegListAlt,FaPlus,FaBars,FaUserCircle } from "react-icons/fa";
import {MdRadioButtonChecked} from "react-icons/md";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { theme, setTheme } = useThemeStore();
  const { user } = useUserStore();
  const { activeTab, setActiveTab, selectedContact } = useLayoutStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("chats");
    } else if (location.pathname === "/status") {
      setActiveTab("status");
    } else if (location.pathname === "/user-profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/setting") {
      setActiveTab("setting");
    }
  }, [location, setActiveTab]);

  if (isMobile && selectedContact) {
    return null;
  }

  const SidebarContent = (
    <>
      <Link
        to="/"
        className={`${isMobile ? "" : "mb-8"} ${activeTab === "chats" && "bg-gray-300 shadow-sm p-2 rounded-full"} focus:outline-none `}
      >
        <FaWhatsapp
          className={`h-6 w-6 ${activeTab === "chats" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-800"}`}
        />
      </Link>

      <Link
        to="/status"
        className={`${isMobile ? "" : "mb-8"} 
          ${activeTab === "status" && "bg-gray-300 shadow-sm p-2 rounded-full"} 
          focus:outline-none `}
      >
        <MdRadioButtonChecked
          className={`h-6 w-6 ${activeTab === "status" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-800"}`}
        />
      </Link>
      {!isMobile && <div className="flex-grow"/>}

      <Link
        to="/user-profile"
        className={`${isMobile ? "" : "mb-8"} 
          ${activeTab === "profile" && "bg-gray-300 shadow-sm p-2 rounded-full"} 
          focus:outline-none `}
      >
        {user?.profilePicture ? (
          <img src={user?.profilePicture} alt="User" className="h-6 w-6 rounded-full" />
        ):(
        <FaUserCircle
          className={`h-6 w-6 ${activeTab === "profile" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-800"}`}
        />)}
      </Link>

      <Link
        to="/setting"
        className={`${isMobile ? "" : "mb-8"} 
          ${activeTab === "setting" && "bg-gray-300 shadow-sm p-2 rounded-full"} 
          focus:outline-none `}
      >
        <FaCog
          className={`h-6 w-6 ${activeTab === "setting" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-800"}`}
        />
      </Link>
    </>
  );

  return (
    <MotionConfig.div
      intial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isMobile ? "fixed bottom-0 left-0 right-0 h-16" : "w-16 h-screen borded-r-2"} 
        ${theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-[rgb(239,242,254)] border-gray-300"} bg-opacity-90 flex item-center py-4 shadow-lg 
        ${isMobile ? "flex-row justify-around" : "flex-col justfiy-between"}`}
    >
      {SidebarContent}
    </MotionConfig.div>
  );
}

export default Sidebar;
