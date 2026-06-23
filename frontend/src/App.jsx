import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/user-login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import UserDetails from './components/UserDetails';
import Status from '../../backend/models/Status';


function App() {
  return (
    <Router>
      <ToastContainer
        position='top-right'
        autoClose={3000}
      />
      <Routes>
        <Route element={<PublicRoute />} >
            <Route path="/user-login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />} >
            <Route path="/" element={<Home />} />
            <Route path="/user-profile" element={<UserDetails} />
            <Route path="/status" element={<Status />} />
            <Route path="/setting" element={<Setting />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
