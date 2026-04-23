import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/public/UserRegistration";

const UserReg: React.FC = () => (
    <Routes>
      <Route path="/userreg" element={<Dashboard />} />

    </Routes>

);

export default UserReg;
