import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Video,
  FileText,
  Star,
  QrCode,
  ArrowRight,
  X,
  Download,
  Clock,
  Award,
} from 'lucide-react';
import { UserProfile, ConsultationTier } from '../types';

interface ConsultationsPaymentViewProps {
  profile: UserProfile;
  tiers: ConsultationTier[];
  onPaymentSuccess?: (tier: ConsultationTier, txId: string) => void;
  theme?: 'light' | 'dark';
}

export const ConsultationsPaymentView: React.FC<ConsultationsPaymentViewProps> = ({
  profile,
  tiers,
  onPaymentSuccess,
  theme = 'dark',
}) => {
  const [selectedTier, setSelectedTier] = useState<ConsultationTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState(`${profile.fullName.toLowerCase().replace(/\s+/g, '')}@upi`);

  const handleInitiatePayment = (tier: ConsultationTier) => {
    setSelectedTier(tier);
    setPaymentSuccess(null);
  };

  const handleExecutePayment = async () => {
    if (!selectedTier) return;
    setIsProcessing(true);

    try {
      // Step 1: Create Order
      const orderRes = await fetch('/api/consultations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: selectedTier.id,
          profileId: profile.id,
          amount: selectedTier.priceINR,
        }),
      });
      const orderData = await orderRes.json();

      // Step 2: Verify Payment
      const verifyRes = await fetch('/api/consultations/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          paymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          tierId: selectedTier.id,
          profileId: profile.id,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setPaymentSuccess({
          tier: selectedTier,
          txId: verifyData.transactionId,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: selectedTier.priceINR,
        });
        if (onPaymentSuccess) {
          onPaymentSuccess(selectedTier, verifyData.transactionId);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Certified Vedic Consultations & Premium Reports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              Unlock Deeper Planetary Wisdom & 1-on-1 Guidance
            </h1>
            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
              Guaranteed privacy, 256-bit SSL encrypted transactions, and certified Astrological accuracy.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl text-xs text-[#C9A050] font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Satisfaction & Authenticity Guarantee</span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-sans">
          <div className="flex items-center space-x-2 text-[#9E9A90]">
            <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0" />
            <span>Instant PDF Chart Dossier</span>
          </div>
          <div className="flex items-center space-x-2 text-[#9E9A90]">
            <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0" />
            <span>Classical Shastra References</span>
          </div>
          <div className="flex items-center space-x-2 text-[#9E9A90]">
            <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0" />
            <span>Personalized Gemstone Certificate</span>
          </div>
          <div className="flex items-center space-x-2 text-[#9E9A90]">
            <CheckCircle2 className="w-4 h-4 text-[#C9A050] shrink-0" />
            <span>Verified Pandit Consultations</span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          return (
            <div
              key={tier.id}
              className={`bg-[#141418] border rounded-xl p-6 text-[#E5E1D8] shadow-xl flex flex-col justify-between transition relative ${
                tier.isPopular
                  ? `border-[#C9A050] ring-1 ring-[#C9A050]/40 bg-gradient-to-b from-[#C9A050]/5 ${theme === 'dark' ? 'to-[#141418]' : 'to-white'}`
                  : 'border-[#2A2A2E] hover:border-[#C9A050]/50'
              }`}
            >
              {tier.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] font-bold text-[9px] font-sans uppercase tracking-widest shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">{tier.name}</h3>
                    <p className="text-[11px] font-sans text-[#9E9A90] mt-1 min-h-[32px]">{tier.description}</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 pb-4 border-b border-[#2A2A2E] flex items-baseline space-x-2">
                  <span className="text-2xl font-serif font-bold text-[#C9A050]">₹{tier.priceINR.toLocaleString()}</span>
                  <span className="text-xs text-[#9E9A90] font-sans">/ ${tier.priceUSD} USD</span>
                </div>

                {/* Features List */}
                <ul className="mt-4 space-y-2 text-xs font-sans">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2 text-[#9E9A90]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A050] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleInitiatePayment(tier)}
                className={`w-full mt-6 py-2.5 rounded-lg font-sans font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tier.isPopular
                    ? 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-[#C9A050]/20'
                    : 'bg-[#1A1A1E] hover:bg-[#2A2A2E] text-[#F0ECE1] border border-[#2A2A2E]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl max-w-lg w-full p-6 text-[#E5E1D8] shadow-2xl relative font-sans">
            <button
              onClick={() => setSelectedTier(null)}
              className="absolute top-4 right-4 text-[#9E9A90] hover:text-white p-1 rounded-lg bg-[#1A1A1E] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#F0ECE1]">Payment Confirmed & Verified!</h3>
                  <p className="text-xs text-[#9E9A90] mt-1">
                    Your order for <strong>{paymentSuccess.tier.name}</strong> is activated for {profile.fullName}.
                  </p>
                </div>

                <div className="p-4 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#9E9A90]">Transaction ID:</span>
                    <span className="text-[#C9A050]">{paymentSuccess.txId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9E9A90]">Amount Paid:</span>
                    <span className="text-[#F0ECE1]">₹{paymentSuccess.amount} INR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9E9A90]">Status:</span>
                    <span className="text-emerald-400 font-bold">COMPLETED & VERIFIED</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTier(null)}
                  className="w-full py-2.5 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow cursor-pointer"
                >
                  Access Your Consultation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#C9A050] text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">{selectedTier.name}</h3>
                  <div className="text-2xl font-serif font-bold text-[#C9A050] mt-1">₹{selectedTier.priceINR} INR</div>
                </div>

                {/* Payment Options */}
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-1 ${
                      paymentMethod === 'upi'
                        ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                        : 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-1 ${
                      paymentMethod === 'card'
                        ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                        : 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-1 ${
                      paymentMethod === 'netbanking'
                        ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                        : 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]'
                    }`}
                  >
                    <span>Net Banking</span>
                  </button>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-3 text-center">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center border-2 border-[#C9A050]">
                      <QrCode className="w-28 h-28 text-[#0D0D0F]" />
                    </div>
                    <p className="text-[11px] text-[#9E9A90]">
                      Scan with Google Pay, PhonePe, Paytm, or enter your VPA ID below:
                    </p>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#2A2A2E] rounded-lg text-xs text-[#F0ECE1] text-center font-mono focus:outline-none focus:border-[#C9A050]"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-[#9E9A90] mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-xs text-[#F0ECE1] font-mono focus:outline-none focus:border-[#C9A050]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#9E9A90] mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-xs text-[#F0ECE1] font-mono focus:outline-none focus:border-[#C9A050]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#9E9A90] mb-1">CVC</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-xs text-[#F0ECE1] font-mono focus:outline-none focus:border-[#C9A050]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] text-[#9E9A90] mb-1">Select Bank</label>
                    <select className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-xs text-[#F0ECE1] focus:outline-none focus:border-[#C9A050]">
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing Secure Payment...' : `Pay ₹${selectedTier.priceINR} Securely`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
