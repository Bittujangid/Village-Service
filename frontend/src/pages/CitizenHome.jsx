import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import NoticeBoard from '../components/NoticeBoard';
import HeroSection from '../components/HeroSection';
import GrievanceForm from '../components/GrievanceForm';
import StatusTracker from '../components/StatusTracker';
import VillageDirectory from '../components/VillageDirectory';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import { useLang } from '../context/LanguageContext';
import { SearchCheck, FilePlus2, Sparkles } from 'lucide-react';

const CitizenHome = () => {
  const { lang, t } = useLang();
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* 1. Navbar */}
      <Navbar />

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
        maxWidth="max-w-3xl"
      >
        <GrievanceForm onSuccessClose={() => setShowGrievanceModal(false)} />
      </Modal>

      {/* MODAL 2: Complaint Status Tracker */}
      <Modal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        title={t.trackModalTitle}
        maxWidth="max-w-2xl"
      >
        <StatusTracker />
      </Modal>
    </div>
  );
};

export default CitizenHome;
