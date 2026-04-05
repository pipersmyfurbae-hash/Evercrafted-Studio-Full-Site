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
import ClientPortal from './pages/ClientPortal';
import WreathRemixer from './pages/WreathRemixer';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import BlueprintStudioLanding from './pages/BlueprintStudioLanding';
import BlueprintStudioMarketing from './pages/BlueprintStudioMarketing';
import ReverseEngineer from './pages/ReverseEngineer/page';
import Validator from './pages/Validator/page';
import MoodoorLanding from './pages/MoodoorLanding';
import EmotionLensLanding from './pages/EmotionLensLanding';
import MotionEngine from './pages/MotionEngine';
import PlacementEditor from './pages/PlacementEditor';
import { Toaster } from './components/ui/sonner';

import { TierGuard } from './components/TierGuard';
import Projects from './pages/Projects';

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
            <Route path="dashboard" element={<ClientPortal />} />
            <Route path="projects" element={<Projects />} />
            
            {/* App Routes */}
            <Route path="apps/memory" element={<MemoryWeaver />} />
            <Route path="apps/inventory" element={
              <TierGuard feature="hasInventoryWeaver">
                <InventoryWeaver />
              </TierGuard>
            } />
            <Route path="apps/studio" element={
              <TierGuard feature="hasDesignStudio">
                <DesignStudio />
              </TierGuard>
            } />
            <Route path="apps/upload" element={
              <TierGuard feature="hasCreatorUpload">
                <CreatorDashboard />
              </TierGuard>
            } />
            <Route path="apps/motion" element={
              <TierGuard feature="hasDesignStudio">
                <MotionEngine />
              </TierGuard>
            } />
            <Route path="apps/placement" element={
              <TierGuard feature="hasDesignStudio">
                <PlacementEditor />
              </TierGuard>
            } />
            
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/:id" element={<ListingDetail />} />
            <Route path="order-studio" element={<OrderStudio />} />
            <Route path="productivity-dashboard" element={<ProductivityDashboard />} />
            
            {/* Other tools */}
            <Route path="visualize-with-ai" element={<VisualizeWithAI />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="sourcing" element={<Sourcing />} />
            <Route path="market" element={<Market />} />
            <Route path="profit-predictor" element={<ProfitPredictor />} />
            <Route path="trend-forecaster" element={<TrendForecaster />} />
            <Route path="shipping-optimizer" element={<ShippingOptimizer />} />
            <Route path="inventory-vision" element={<InventoryVision />} />
            <Route path="moodboard-parser" element={<MoodboardParser />} />
            <Route path="workflow-automator" element={<WorkflowAutomator />} />
            <Route path="customer-retention" element={<CustomerRetention />} />
            <Route path="reverse-engineer" element={<ReverseEngineer />} />
            <Route path="validator" element={<Validator />} />
            <Route path="wreath-remixer" element={<WreathRemixer />} />
            <Route path="render-prompt-builder" element={<RenderPromptBuilder />} />
            <Route path="success" element={<Success />} />
            <Route path="cancel" element={<Cancel />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
