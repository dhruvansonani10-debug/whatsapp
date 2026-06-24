import React from "react";
import Layout from "./Layout";
import ChatList from "../pages/chatSection/ChatList";
import useLayoutStore from "../../store/layoutStore";
import { motion } from "framer-motion";
import { getAllUsers } from "../../api/message";
import { useState,useEffect } from "react";

function HomePage() {
  const [allUsers,setAllUsers] = useState([]);
  const getAllUser = async()=>{
    try {
      const result = await getAllUsers();
      if(result.success)
      {
        setAllUsers(result.data);
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getAllUser();
  }, [])
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatList contacts={allUsers} />
      </motion.div>
    </Layout>
  );
}

export default HomePage;