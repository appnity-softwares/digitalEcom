import React, { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnimatePresence, motion } from "framer-motion";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LoginModal from "./components/auth/LoginModal";
import OfflineBanner from "./components/ui/OfflineBanner";
import ErrorBoundary from "./components/ErrorBoundary";


// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import AuthContext from "./context/AuthContext";

// Create Query Client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Lazy Load Pages
const Home = lazy(() => import("./pages/Home"));
const Templates = lazy(() => import("./pages/Templates"));
const Features = lazy(() => import("./pages/Features"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TemplatesDetails = lazy(() => import("./pages/TemplatesDetails"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ProductEdit = lazy(() => import("./pages/Admin/ProductEdit"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));

// New Pages
const Checkout = lazy(() => import("./pages/Checkout"));
const Docs = lazy(() => import("./pages/Docs"));
const DocDetail = lazy(() => import("./pages/DocDetail"));
const Saas = lazy(() => import("./pages/Saas"));
const DeveloperHub = lazy(() => import("./pages/DeveloperHub"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ImageUploadAPI = lazy(() => import("./pages/ImageUploadAPI"));
const MobileTemplates = lazy(() => import("./pages/MobileTemplates"));
const BlogEditor = lazy(() => import("./pages/Admin/BlogEditor"));
const APIPlayground = lazy(() => import("./pages/APIPlayground"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AdminPanel = lazy(() => import("./pages/Admin/AdminPanel"));
const TemplateRequests = lazy(() => import("./pages/TemplateRequests"));
const Components = lazy(() => import("./pages/Components"));
const R2UploadDemo = lazy(() => import("./pages/R2UploadDemo"));

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// Loading Spinner Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh] bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

// Animated Page Wrapper
const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Use Lenis if available, otherwise fallback
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
};

const App = () => {
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ToastProvider>
                <RecentlyViewedProvider>
                  <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
                    <OfflineBanner />
                    <Navbar />
                    <ScrollToTop />

                    <main className="flex-grow">
                      <Suspense fallback={<LoadingFallback />}>
                        <AnimatePresence mode="wait">
                          <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
                            <Route path="/templates" element={<AnimatedPage><Templates /></AnimatedPage>} />
                            <Route path="/templates/:id" element={<AnimatedPage><TemplatesDetails /></AnimatedPage>} />
                            <Route path="/features" element={<AnimatedPage><Features /></AnimatedPage>} />
                            <Route path="/testimonials" element={<AnimatedPage><Testimonials /></AnimatedPage>} />
                            <Route path="/faq" element={<AnimatedPage><FAQ /></AnimatedPage>} />
                            <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
                            {/* Login/Register redirect to home - modal is used instead */}
                            <Route path="/login" element={<Navigate to="/" replace />} />
                            <Route path="/register" element={<Navigate to="/" replace />} />
                            <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
                            <Route path="/wishlist" element={<AnimatedPage><Wishlist /></AnimatedPage>} />
                            <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />

                            {/* New Routes */}
                            <Route path="/checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
                            <Route path="/docs" element={<AnimatedPage><Docs /></AnimatedPage>} />
                            <Route path="/docs/:id" element={<AnimatedPage><DocDetail /></AnimatedPage>} />
                            <Route path="/saas" element={<AnimatedPage><Saas /></AnimatedPage>} />
                            <Route path="/app-developers" element={<AnimatedPage><DeveloperHub /></AnimatedPage>} />
                            <Route path="/oauth-callback" element={<OAuthCallback />} />
                            <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
                            <Route path="/reset-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
                            <Route path="/tools/image-upload" element={<AnimatedPage><ImageUploadAPI /></AnimatedPage>} />
                            <Route path="/mobile-templates" element={<AnimatedPage><MobileTemplates /></AnimatedPage>} />
                            <Route path="/api-playground" element={<AnimatedPage><APIPlayground /></AnimatedPage>} />
                            <Route path="/pricing" element={<AnimatedPage><Pricing /></AnimatedPage>} />
                            <Route path="/template-requests" element={<AnimatedPage><TemplateRequests /></AnimatedPage>} />
                            <Route path="/components" element={<AnimatedPage><Components /></AnimatedPage>} />
                            <Route path="/r2-upload-demo" element={<AnimatedPage><R2UploadDemo /></AnimatedPage>} />


                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
                            <Route path="/admin/blog/new" element={<BlogEditor />} />
                            <Route path="/admin/blog/:id/edit" element={<BlogEditor />} />

                            <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
                          </Routes>
                        </AnimatePresence>
                      </Suspense>
                    </main>

                    <Footer />
                    <GlobalLoginPopup />
                  </div>
                </RecentlyViewedProvider>
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
      {/* React Query Devtools - only in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

// Internal Component for Global Popup Logic
const GlobalLoginPopup = () => {
  const { user, loading } = React.useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show on homepage, not on product browsing pages
    const shouldShowPopup = location.pathname === '/' || location.pathname === '/home';
    const hasShown = sessionStorage.getItem('loginPopupShown');

    if (!loading && !user && !hasShown && shouldShowPopup) {
      const timer = setTimeout(() => {
        setShowModal(true);
        sessionStorage.setItem('loginPopupShown', 'true');
      }, 3000); // 3 second delay
      return () => clearTimeout(timer);
    }
  }, [user, loading, location]);

  return <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />;
};

export default App;
