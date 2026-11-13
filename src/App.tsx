/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolDataProvider, useSchoolData } from './context/SchoolDataContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { SchoolData } from './pages/public/SchoolData';
import { Studentship } from './pages/public/Studentship';
import { NewsAndGallery } from './pages/public/NewsAndGallery';
import { LmsPage } from './pages/public/LmsPage';
import { Contact } from './pages/public/Contact';

// Admin & Auth Pages
import { AdminPage } from './pages/admin/AdminPage';

function AppContent() {
  const { currentRoute } = useSchoolData();

  // Protect admin and legacy reset-password routes via AdminPage login gate
  if (currentRoute === 'reset-password' || currentRoute === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <AdminPage />
        <ToastContainer />
      </div>
    );
  }

  // Public Layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Sticky Navbar with 80x80 px logo slot <!-- TEMPAT LOGO SEKOLAH --> */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentRoute === 'beranda' && <Home />}
        {currentRoute === 'tentang' && <About />}
        {currentRoute === 'data-sekolah' && <SchoolData />}
        {currentRoute === 'kesiswaan' && <Studentship />}
        {(currentRoute === 'berita-galeri' || currentRoute === 'detail-berita') && (
          <NewsAndGallery />
        )}
        {currentRoute === 'lms' && <LmsPage />}
        {currentRoute === 'kontak' && <Contact />}
      </main>

      {/* Comprehensive Footer with 80x80 px logo slot */}
      <Footer />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <SchoolDataProvider>
      <AppContent />
    </SchoolDataProvider>
  );
}
