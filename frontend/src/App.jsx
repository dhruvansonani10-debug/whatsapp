import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/user-login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'


function App() {
  return (
    <Router>
      <ToastContainer
        position='top-right'
        autoClose={3000}
      />
      <Routes>
        {/*<Route path="/" element={<Home />} />*/}
        <Route path="/user-login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
