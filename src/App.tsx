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
            <Route path="apps/memory" element={<TierGuard appId="memory_weaver"><MemoryWeaver /></TierGuard>} />
            <Route path="apps/inventory" element={
              <TierGuard feature="hasInventoryWeaver" appId="inventory_weaver">
                <InventoryWeaver />
              </TierGuard>
            } />
            <Route path="apps/studio" element={
              <TierGuard feature="hasDesignStudio" appId="blueprint_studio">
                <DesignStudio />
              </TierGuard>
            } />
            <Route path="apps/upload" element={
              <TierGuard feature="hasCreatorUpload" appId="creator_dashboard">
                <CreatorDashboard />
              </TierGuard>
            } />
            <Route path="apps/motion" element={
              <TierGuard feature="hasDesignStudio" appId="motion_engine">
                <MotionEngine />
              </TierGuard>
            } />
            <Route path="apps/placement" element={
              <TierGuard feature="hasDesignStudio" appId="ai_placement_editor">
                <PlacementEditor />
              </TierGuard>
            } />
            
            <Route path="marketplace" element={
              <TierGuard appId="marketplace">
                <Marketplace />
              </TierGuard>
            } />
            <Route path="marketplace/:id" element={<ListingDetail />} />
            <Route path="order-studio" element={
              <TierGuard appId="order_studio">
                <OrderStudio />
              </TierGuard>
            } />
            <Route path="productivity-dashboard" element={
              <TierGuard appId="productivity_dashboard">
                <ProductivityDashboard />
              </TierGuard>
            } />
            
            {/* Other tools */}
            <Route path="visualize-with-ai" element={<TierGuard appId="visualize_with_ai"><VisualizeWithAI /></TierGuard>} />
            <Route path="assistant" element={<TierGuard appId="assistant"><Assistant /></TierGuard>} />
            <Route path="sourcing" element={<TierGuard appId="sourcing"><Sourcing /></TierGuard>} />
            <Route path="market" element={<TierGuard appId="market"><Market /></TierGuard>} />
            <Route path="profit-predictor" element={<TierGuard appId="profit_predictor"><ProfitPredictor /></TierGuard>} />
            <Route path="trend-forecaster" element={<TierGuard appId="trend_forecaster"><TrendForecaster /></TierGuard>} />
            <Route path="shipping-optimizer" element={<TierGuard appId="shipping_optimizer"><ShippingOptimizer /></TierGuard>} />
            <Route path="inventory-vision" element={<TierGuard appId="inventory_vision"><InventoryVision /></TierGuard>} />
            <Route path="moodboard-parser" element={<TierGuard appId="moodboard_parser"><MoodboardParser /></TierGuard>} />
            <Route path="workflow-automator" element={<TierGuard appId="workflow_automator"><WorkflowAutomator /></TierGuard>} />
            <Route path="customer-retention" element={<TierGuard appId="customer_retention"><CustomerRetention /></TierGuard>} />
            <Route path="reverse-engineer" element={<TierGuard appId="reverse_engineer"><ReverseEngineer /></TierGuard>} />
            <Route path="validator" element={<TierGuard appId="validator"><Validator /></TierGuard>} />
            <Route path="wreath-remixer" element={<TierGuard appId="wreath_remixer"><WreathRemixer /></TierGuard>} />
            <Route path="render-prompt-builder" element={<TierGuard appId="render_prompt_builder"><RenderPromptBuilder /></TierGuard>} />
            <Route path="success" element={<Success />} />
            <Route path="cancel" element={<Cancel />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
