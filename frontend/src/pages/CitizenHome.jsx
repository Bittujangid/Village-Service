import React, { useState, Suspense, lazy } from 'react';
import Navbar from '../components/Navbar';
import NoticeBoard from '../components/NoticeBoard';
import HeroSection from '../components/HeroSection';
import VillageDirectory from '../components/VillageDirectory';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import { useLang } from '../context/LanguageContext';
import { SearchCheck, FilePlus2, Sparkles, FileText, Search, ShieldCheck } from 'lucide-react';

// Lazy-load modal forms so landing page loads instantly without heavy scripts
const GrievanceForm = lazy(() => import('../components/GrievanceForm'));
const StatusTracker = lazy(() => import('../components/StatusTracker'));

const ModalLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
    <p className="mt-2 text-sm text-slate-500">लोड हो रहा है...</p>
  </div>
);

const CitizenHome = () => {
  const { lang, t } = useLang();
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* 1. Navbar */}
      <Navbar
        onOpenGrievance={() => setShowGrievanceModal(true)}
        onOpenTrack={() => setShowTrackModal(true)}
      />

      <main className="flex-1">
        {/* 2. Notice Board Announcement Banner */}
        <NoticeBoard />

        {/* 3. Hero Section with Call To Actions */}
        <HeroSection
          onOpenGrievance={() => setShowGrievanceModal(true)}
          onOpenTrack={() => setShowTrackModal(true)}
        />

        {/* 4. Village Emergency Directory */}
        <VillageDirectory />
      </main>

      {/* 5. Footer */}
      <Footer
        onOpenGrievance={() => setShowGrievanceModal(true)}
        onOpenTrack={() => setShowTrackModal(true)}
      />

      {/* MODAL 1: Grievance Submission Form */}
      <Modal
        isOpen={showGrievanceModal}
        onClose={() => setShowGrievanceModal(false)}
        title={t.formModalTitle}
        subtitle={lang === 'hi' ? 'ग्राम पंचायत सहरी ई-सेवा' : 'Gram Panchayat Sahari Civic Portal'}
        icon={<FileText className="w-4 h-4" />}
        maxWidth="max-w-3xl"
      >
        <Suspense fallback={<ModalLoader />}>
          {showGrievanceModal && <GrievanceForm onSuccessClose={() => setShowGrievanceModal(false)} />}
        </Suspense>
      </Modal>

      {/* MODAL 2: Complaint Status Tracker */}
      <Modal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        title={lang === 'hi' ? 'शिकायत की स्थिति जांचें' : 'Track Complaint Status'}
        subtitle={lang === 'hi' ? 'ग्राम पंचायत सहरी ई-सेवा' : 'Gram Panchayat Sahari Civic Portal'}
        icon={<ShieldCheck className="w-4 h-4" />}
        maxWidth="max-w-2xl"
      >
        <Suspense fallback={<ModalLoader />}>
          {showTrackModal && <StatusTracker />}
        </Suspense>
      </Modal>
    </div>
  );
};

export default CitizenHome;
