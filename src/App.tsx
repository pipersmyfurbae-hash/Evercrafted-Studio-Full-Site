import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MemoryWeaver from './pages/MemoryWeaver';
import Inventory from './pages/Inventory';
import InventoryWeaver from './pages/InventoryWeaver';
import InventoryMarketing from './pages/InventoryMarketing';
import DesignStudio from './pages/DesignStudio';
import { ABCLab } from './pages/ABCLab';
import { OrderStudio } from './pages/OrderStudio';
import { InventoryStudio } from './pages/InventoryStudio';
import Assistant from './pages/Assistant';
import VisualizeWithAI from './pages/VisualizeWithAI';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import CreatorDashboard from './pages/CreatorDashboard';
import ImageAnalyzer from './pages/ImageAnalyzer';
import Sourcing from './pages/Sourcing';
import Market from './pages/Market';
import RenderPromptBuilder from './pages/RenderPromptBuilder';
import ProfitPredictor from './pages/ProfitPredictor';
import TrendForecaster from './pages/TrendForecaster';
import ShippingOptimizer from './pages/ShippingOptimizer';
import InventoryVision from './pages/InventoryVision';
import MoodboardParser from './pages/MoodboardParser';
import WorkflowAutomator from './pages/WorkflowAutomator';
import ProductivityDashboard from './pages/ProductivityDashboard';
import CustomerRetention from './pages/CustomerRetention';
import WreathRemixer from './pages/WreathRemixer';
import BlueprintStudioLanding from './pages/BlueprintStudioLanding';
import BlueprintStudioMarketing from './pages/BlueprintStudioMarketing';
import ReverseEngineer from './pages/ReverseEngineer/page';
import Validator from './pages/Validator/page';
import MoodoorLanding from './pages/MoodoorLanding';
import EmotionLensLanding from './pages/EmotionLensLanding';
import { Toaster } from './components/ui/sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory-marketing" element={<InventoryMarketing />} />
          <Route path="/moodoor" element={<MoodoorLanding />} />
          <Route path="/emotion-lens" element={<EmotionLensLanding />} />
          <Route path="/blueprint-studio" element={<BlueprintStudioLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="memory-weaver" element={<MemoryWeaver />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory-weaver" element={<InventoryWeaver />} />
            <Route path="inventory-studio" element={<InventoryStudio />} />
            <Route path="design-studio" element={<ABCLab />} />
            <Route path="order-studio" element={<OrderStudio />} />
            <Route path="visualize-with-ai" element={<VisualizeWithAI />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/:id" element={<ListingDetail />} />
            <Route path="creator-dashboard" element={<CreatorDashboard />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="image-analyzer" element={<ImageAnalyzer />} />
            <Route path="sourcing" element={<Sourcing />} />
            <Route path="market" element={<Market />} />
            <Route path="profit-predictor" element={<ProfitPredictor />} />
            <Route path="trend-forecaster" element={<TrendForecaster />} />
            <Route path="shipping-optimizer" element={<ShippingOptimizer />} />
            <Route path="inventory-vision" element={<InventoryVision />} />
            <Route path="moodboard-parser" element={<MoodboardParser />} />
            <Route path="workflow-automator" element={<WorkflowAutomator />} />
            <Route path="productivity-dashboard" element={<ProductivityDashboard />} />
            <Route path="customer-retention" element={<CustomerRetention />} />
            <Route path="blueprint-studio" element={<DesignStudio />} />
            <Route path="reverse-engineer" element={<ReverseEngineer />} />
            <Route path="validator" element={<Validator />} />
            <Route path="wreath-remixer" element={<WreathRemixer />} />
            <Route path="render-prompt-builder" element={<RenderPromptBuilder />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
