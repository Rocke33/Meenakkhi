import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import { CartProvider } from './context/CartContext';

// ⚡ Code-split routes for optimal loading speed
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Orders = lazy(() => import('./pages/Orders'));

// Private protected routes
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

// Lightweight luxury skeleton screen used during route shifts
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
    <span className="text-xs text-amber-900/80 font-serif font-bold tracking-widest uppercase animate-pulse">
      Meenakkhi Sarees...
    </span>
  </div>
);

// Inner Animated Routes Wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Access Paths */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/products"
          element={
            <PageTransition>
              <Products />
            </PageTransition>
          }
        />
        <Route
          path="/category/:categoryName"
          element={
            <PageTransition>
              <CategoryPage />
            </PageTransition>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PageTransition>
              <ProductDetails />
            </PageTransition>
          }
        />
        <Route
          path="/cart"
          element={
            <PageTransition>
              <Cart />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/orders"
          element={
            <PageTransition>
              <Orders />
            </PageTransition>
          }
        />
        
        {/* 🛡️ Secure Client Account Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        
        {/* 🚨 Strict Admin Access Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PageTransition>
                <Admin />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        {/* 🚀 Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </ErrorBoundary>
  );
}