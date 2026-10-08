"use client";

import { useState } from "react";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import JoinModal from "./components/modals/JoinModal";
import AccountRecoveryModal from "./components/modals/AccountRecovery";

export default function CosplayHunt({ convention, hunter }) {
  const [showModal, setShowModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  return (
    <main className="min-h-screen">
      <HeroSection
        convention={convention}
        hunter={hunter}
        onJoinClick={() => setShowModal(true)}
        onOpenRecoveryModal={() => setShowRecoveryModal(true)}
      />

      <AboutSection conventionName={convention.name} />

      {showModal && (
        <JoinModal
          convention={convention}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Account Recovery Modal */}
      {showRecoveryModal && (
        <AccountRecoveryModal
          conventionId={convention.id}
          onClose={() => setShowRecoveryModal(false)}
        />
      )}
    </main>
  );
}