import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MyServicesPage from "./pages/MyServicesPage";
import CreateEditServicePage from "./pages/CreateEditServicePage";
import NotificationsPage from "./pages/NotificationsPage";
import MasterReviewsPage from "./pages/MasterReviewsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/my-services" element={<MyServicesPage />} />
              <Route path="/my-services/create" element={<CreateEditServicePage />} />
              <Route path="/my-services/edit/:id" element={<CreateEditServicePage />} />
              <Route path="/masters/:id" element={<ProfilePage />} />
              <Route path="/masters/:masterId/reviews" element={<MasterReviewsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
