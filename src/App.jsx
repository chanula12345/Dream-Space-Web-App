import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import DesignDetails from "./pages/DesignDetails";
import CreateDesign from "./pages/CreateDesign";
import ThreeCanvas from "./pages/ThreeCanvas";
import ObjWithMtl from "./pages/ObjWithMtl";
import Design3D from "./pages/Design3D";
import UserProfile from "./pages/UserProfile"
import Home from "./pages/Home"
import About from './pages/About';
import CustomizeRoom from './pages/CustomizeRoom';
import Edit2D from "./pages/Edit2D";
import Edit3D from "./pages/Edit3D";   

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/design-details/:id" element={<DesignDetails />} />
        <Route path="/create-design" element={<CreateDesign />} />
        <Route path="/three" element={<ThreeCanvas />} />
        <Route path="/three2" element={<ObjWithMtl />} />
        <Route path="/design3d" element={<Design3D />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/customize-room" element={<CustomizeRoom />} />
        <Route path="/edit-2d/:id" element={<Edit2D />} />
        <Route path="/edit-3d/:id" element={<Edit3D />} />
      </Routes>
    </div>
  );
}

export default App;