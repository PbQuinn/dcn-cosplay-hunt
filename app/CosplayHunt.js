"use client";

import { useState } from "react";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import JoinModal from "./components/JoinModal";

export default function CosplayHunt({ convention, hunter }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="min-h-screen">
      <HeroSection
        convention={convention}
        hunter={hunter}
        onJoinClick={() => setShowModal(true)}
      />

      <AboutSection conventionName={convention.name} />

      {showModal && (
        <JoinModal
          convention={convention}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}