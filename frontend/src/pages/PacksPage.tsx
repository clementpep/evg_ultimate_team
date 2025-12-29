/**
 * Packs Page
 *
 * Main page for viewing pack inventory and opening packs.
 * Following DESIGN_SYSTEM.md specifications for layout and styling.
 */

import { useState, useEffect, useRef } from 'react';
import { usePacks } from '../hooks/usePacks';
import { useToast } from '../context/ToastContext';
import { PackCard } from '../components/packs/PackCard';
import { PackOpeningModal } from '../components/packs/PackOpeningModal';
import { PackOpenResult, PackTier } from '../types/pack';
import { getMyProfile } from '../services/participantService';

export const PacksPage = () => {
  const { inventory, loading, isOpening, purchasePack, openPack, error } = usePacks();
  const { showToast } = useToast();
  const [selectedTier, setSelectedTier] = useState<PackTier | null>(null);
  const [openResult, setOpenResult] = useState<PackOpenResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<number>(0);
  const hasShownWelcome = useRef(false);

  // Fetch user credits and points
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyProfile();
        setUserCredits(profile.pack_credits);
        setUserPoints(profile.total_points);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchProfile();
  }, [inventory]); // Refresh when inventory changes

  // Show welcome pack notification on first load if user has exactly 1 silver pack
  useEffect(() => {
    if (!loading && inventory && !hasShownWelcome.current) {
      // Check if this looks like a fresh account with welcome pack
      const totalPacks = inventory.bronze + inventory.silver + inventory.gold + inventory.ultimate;
      if (inventory.silver === 1 && totalPacks === 1) {
        showToast('🎁 Pack de bienvenue reçu ! Tu as 1 pack Silver à ouvrir !', 'success');
        hasShownWelcome.current = true;
      }
    }
  }, [loading, inventory, showToast]);

  const handlePurchasePack = async (tier: PackTier) => {
    const success = await purchasePack(tier);
    if (success) {
      showToast(`Pack ${tier} acheté avec succès !`, 'success');
    }
  };

  const handleOpenPack = async (tier: PackTier) => {
    setSelectedTier(tier);
    const result = await openPack(tier);
    if (result) {
      setOpenResult(result);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTier(null);
    setOpenResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="font-display text-6xl font-black mb-4 uppercase tracking-wider text-gradient-psg">
          MES PACKS
        </h1>
        <p className="text-text-secondary text-lg">
          Ouvre tes packs pour obtenir des récompenses exclusives !
        </p>
        {/* Display Credits and Points */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border" style={{
            background: 'rgba(26, 41, 66, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <span className="text-text-secondary text-sm uppercase tracking-wide">Crédits:</span>
            <span className="font-numbers text-2xl font-bold text-fifa-gold">{userCredits}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border" style={{
            background: 'rgba(26, 41, 66, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <span className="text-text-secondary text-sm uppercase tracking-wide">Points:</span>
            <span className="font-numbers text-2xl font-bold text-fifa-green">{userPoints}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Pack Inventory Summary - Mobile First */}
      <div className="mb-8 md:mb-12 flex justify-center px-4">
        <div
          className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-6 rounded-2xl p-4 sm:p-6 border w-full max-w-2xl sm:w-auto"
          style={{
            background: 'rgba(26, 41, 66, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="text-center px-2 sm:px-4">
            <div className="font-numbers text-2xl sm:text-4xl font-black text-fifa-bronze mb-1 sm:mb-2">
              {inventory?.bronze || 0}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide">
              Bronze
            </div>
          </div>

          <div className="hidden sm:block w-px bg-white/10"></div>

          <div className="text-center px-2 sm:px-4">
            <div className="font-numbers text-2xl sm:text-4xl font-black text-fifa-silver mb-1 sm:mb-2">
              {inventory?.silver || 0}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide">
              Silver
            </div>
          </div>

          <div className="hidden sm:block w-px bg-white/10"></div>

          <div className="text-center px-2 sm:px-4">
            <div className="font-numbers text-2xl sm:text-4xl font-black text-fifa-gold mb-1 sm:mb-2">
              {inventory?.gold || 0}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide">
              Gold
            </div>
          </div>

          <div className="hidden sm:block w-px bg-white/10"></div>

          <div className="text-center px-2 sm:px-4">
            <div className="font-numbers text-2xl sm:text-4xl font-black text-psg-red mb-1 sm:mb-2">
              {inventory?.ultimate || 0}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide">
              Ultimate
            </div>
          </div>
        </div>
      </div>

      {/* Pack Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PackCard
          tier="bronze"
          count={inventory?.bronze || 0}
          canOpen={(inventory?.bronze || 0) > 0 && !isOpening}
          userCredits={userCredits}
          onOpen={() => handleOpenPack('bronze')}
          onPurchase={() => handlePurchasePack('bronze')}
        />
        <PackCard
          tier="silver"
          count={inventory?.silver || 0}
          canOpen={(inventory?.silver || 0) > 0 && !isOpening}
          userCredits={userCredits}
          onOpen={() => handleOpenPack('silver')}
          onPurchase={() => handlePurchasePack('silver')}
        />
        <PackCard
          tier="gold"
          count={inventory?.gold || 0}
          canOpen={(inventory?.gold || 0) > 0 && !isOpening}
          userCredits={userCredits}
          onOpen={() => handleOpenPack('gold')}
          onPurchase={() => handlePurchasePack('gold')}
        />
        <PackCard
          tier="ultimate"
          count={inventory?.ultimate || 0}
          canOpen={(inventory?.ultimate || 0) > 0 && !isOpening}
          userCredits={userCredits}
          onOpen={() => handleOpenPack('ultimate')}
          onPurchase={() => handlePurchasePack('ultimate')}
        />
      </div>

      {/* Info Section */}
      <div className="mt-12 text-center">
        <div
          className="inline-block rounded-xl px-8 py-6 border max-w-2xl"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <h3 className="font-display text-xl font-bold mb-3 uppercase tracking-wide">
            Comment obtenir des packs ?
          </h3>
          <ul className="text-text-secondary text-left space-y-2">
            <li>🎁 <strong>Packs gratuits :</strong> 2x par jour (9h et 18h)</li>
            <li>⭐ <strong>Acheter avec des crédits :</strong> Bronze (100), Silver (200), Gold (300), Ultimate (500)</li>
            <li>💰 <strong>Crédits :</strong> Gagne 1 crédit par point marqué. Les points restent, les crédits s'utilisent !</li>
            <li>🏆 <strong>Récompenses :</strong> Shots, immunités, pouvoirs spéciaux et plus !</li>
          </ul>
        </div>
      </div>

      {/* Pack Opening Modal */}
      <PackOpeningModal
        isOpen={showModal}
        tier={selectedTier || 'bronze'}
        result={openResult}
        onClose={handleCloseModal}
      />
    </div>
  );
};
