import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { API_URL } from "../config";
import type { RootState } from "../store/store";
import { clearBooking } from "../store/bookingSlice";
import BottomNavigation from "../components/common/BottomNavigation";

const QRCode: React.FC = () => {
  return (
    <svg width="70" height="70" viewBox="0 0 100 100" className="bg-white p-1.5 rounded-xl shadow-sm text-black">
      <rect x="5" y="5" width="25" height="25" fill="currentColor" />
      <rect x="10" y="10" width="15" height="15" fill="white" />
      <rect x="13" y="13" width="9" height="9" fill="currentColor" />
      <rect x="70" y="5" width="25" height="25" fill="currentColor" />
      <rect x="75" y="10" width="15" height="15" fill="white" />
      <rect x="78" y="13" width="9" height="9" fill="currentColor" />
      <rect x="5" y="70" width="25" height="25" fill="currentColor" />
      <rect x="10" y="75" width="15" height="15" fill="white" />
      <rect x="13" y="78" width="9" height="9" fill="currentColor" />
      <rect x="70" y="70" width="10" height="10" fill="currentColor" />
      <rect x="73" y="73" width="4" height="4" fill="white" />
      <rect x="75" y="75" width="2" height="2" fill="currentColor" />
      <rect x="35" y="5" width="5" height="5" fill="currentColor" /><rect x="45" y="5" width="10" height="5" fill="currentColor" /><rect x="60" y="5" width="5" height="5" fill="currentColor" />
      <rect x="35" y="15" width="15" height="5" fill="currentColor" /><rect x="55" y="15" width="5" height="5" fill="currentColor" />
      <rect x="40" y="25" width="5" height="5" fill="currentColor" /><rect x="50" y="25" width="15" height="5" fill="currentColor" />
      <rect x="5" y="35" width="5" height="15" fill="currentColor" /><rect x="20" y="35" width="10" height="5" fill="currentColor" /><rect x="35" y="35" width="5" height="5" fill="currentColor" /><rect x="45" y="35" width="15" height="5" fill="currentColor" /><rect x="70" y="35" width="5" height="5" fill="currentColor" /><rect x="80" y="35" width="15" height="5" fill="currentColor" />
      <rect x="10" y="45" width="5" height="5" fill="currentColor" /><rect x="25" y="45" width="5" height="5" fill="currentColor" /><rect x="40" y="45" width="10" height="5" fill="currentColor" /><rect x="60" y="45" width="5" height="5" fill="currentColor" /><rect x="75" y="45" width="10" height="5" fill="currentColor" />
      <rect x="5" y="55" width="15" height="5" fill="currentColor" /><rect x="30" y="55" width="5" height="5" fill="currentColor" /><rect x="50" y="55" width="15" height="5" fill="currentColor" /><rect x="70" y="55" width="5" height="5" fill="currentColor" /><rect x="85" y="55" width="10" height="5" fill="currentColor" />
      <rect x="35" y="70" width="10" height="5" fill="currentColor" /><rect x="55" y="70" width="5" height="5" fill="currentColor" />
      <rect x="35" y="80" width="5" height="10" fill="currentColor" /><rect x="45" y="80" width="10" height="5" fill="currentColor" /><rect x="60" y="80" width="5" height="5" fill="currentColor" /><rect x="85" y="80" width="10" height="5" fill="currentColor" />
      <rect x="50" y="90" width="15" height="5" fill="currentColor" /><rect x="75" y="90" width="5" height="5" fill="currentColor" />
    </svg>
  );
};

const isValidCardNumber = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, "");
  if (!/^\d{16}$/.test(digits)) return false;

  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();

  const bookingState = useSelector((state: RootState) => state.booking);
  const { selectedMovie, selectedTheatre, selectedDate, selectedShowtime, selectedSeats, bookingFee } = bookingState;

  const [step, setStep] = useState<"summary" | "payment" | "success" | "failure">("summary");

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");

  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] text-slate-900 flex flex-col items-center justify-center p-4">
        <p className="text-xs text-slate-400">No active booking found.</p>
        <button onClick={() => navigate("/")} className="mt-3 px-4 py-2 bg-[#5e4feb] text-white text-xs rounded-xl font-bold">
          Go Home
        </button>
      </div>
    );
  }

  const ticketsCost = selectedSeats.length * selectedShowtime.price;
  const grandTotal = ticketsCost + bookingFee;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setExpiryDate(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(val);
  };

  const handleCancelReservation = async () => {
    if (!user || !user.id) return;
    try {
      await fetch(`${API_URL}/api/showtimes/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: selectedShowtime._id,
          seats: selectedSeats,
          userId: user.id
        })
      });
      dispatch(clearBooking());
      navigate("/");
    } catch (err) {
      console.error("Release seats error:", err);
      dispatch(clearBooking());
      navigate("/");
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) return;

    setErrorMessage("");

    if (!nameOnCard.trim() || nameOnCard.trim().length < 2) {
      return setErrorMessage("Please enter cardholder name.");
    }
    const rawCardNumber = cardNumber.replace(/\s+/g, "");
    if (rawCardNumber.length !== 16) {
      return setErrorMessage("Card number must be exactly 16 digits.");
    }
    if (!isValidCardNumber(rawCardNumber)) {
      return setErrorMessage("Enter a valid card number. For this demo, use 4242 4242 4242 4242.");
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return setErrorMessage("Expiry must be in MM/YY format.");
    }
    if (cvv.length !== 3) {
      return setErrorMessage("CVV must be exactly 3 digits.");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: selectedShowtime._id,
          seats: selectedSeats,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress || "demo@clerk.dev",
          totalPrice: grandTotal,
          paymentMethod: "card",
          cardDetails: {
            nameOnCard,
            cardNumber: rawCardNumber,
            expiryDate,
            cvv
          }
        })
      });

      const result = await res.json();

      if (res.status === 201 && result.success) {
        setTransactionId(result.data.transactionId);
        setStep("success");
      } else if (res.status === 402) {
        setErrorMessage(result.message || "Payment transaction declined by gateway.");
        setStep("failure");
      } else {
        setErrorMessage(result.message || "Unable to complete payment. Please check your details.");
        setStep("payment");
      }
    } catch (err) {
      console.error("Booking post error:", err);
      setErrorMessage("Network error connecting to payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  const handleFailureClose = () => {
    dispatch(clearBooking());
    navigate("/");
  };

  const handleSuccessClose = () => {
    dispatch(clearBooking());
    navigate("/bookings");
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })
    : "";

  return (
    <div className="min-h-screen bg-[#f8f9fe] text-slate-900 pb-[100px] relative">
      {step === "summary" && (
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <button
              onClick={() => navigate(`/seats/${selectedShowtime._id}`)}
              className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 font-bold"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={handleCancelReservation} className="text-xs text-red-500 hover:text-red-600 font-bold">
              Cancel
            </button>
          </div>

          <div className="w-full bg-slate-100 h-1.5 relative">
            <div className="bg-[#5e4feb] h-1.5 absolute left-0 top-0 w-3/4" />
          </div>

          <div className="px-4 mt-5">
            <h1 className="text-base font-black text-slate-900">Booking Summary</h1>

            <div className="relative h-[150px] w-full rounded-2xl overflow-hidden mt-4 border border-slate-100 shadow-sm bg-slate-100">
              <img
                src={selectedMovie.bannerUrl}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-1.5 py-0.5 rounded bg-[#5e4feb] text-white text-[8px] font-black uppercase">
                  {selectedShowtime.format}
                </span>
                <h2 className="text-sm font-black text-white mt-1">{selectedMovie.title}</h2>
              </div>
            </div>

            <div className="mt-5 bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 text-xs shadow-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-semibold">Theatre</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">{selectedTheatre}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-semibold">Date</span>
                <span className="font-bold text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-semibold">Showtime</span>
                <span className="font-bold text-slate-800">Screen 1 • {selectedShowtime.time}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400 font-semibold">Seats</span>
                <span className="font-black text-[#5e4feb]">{selectedSeats.join(", ")}</span>
              </div>
            </div>

            <div className="mt-5 px-1 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>{selectedSeats.length}x Tickets</span>
                <span>₹{ticketsCost}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Booking Fee</span>
                <span>₹{bookingFee}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2.5 mt-1 text-slate-900">
                <span>Total Amount</span>
                <span className="text-[#5e4feb]">₹{grandTotal}</span>
              </div>
            </div>

            <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-100 z-40">
              <button
                onClick={() => setStep("payment")}
                className="w-full py-3 bg-[#5e4feb] hover:bg-[#4f46e5] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "payment" && (
        <form onSubmit={handlePay}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <button
              type="button"
              onClick={() => setStep("summary")}
              className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 font-bold"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button type="button" onClick={handleCancelReservation} className="text-xs text-red-500 hover:text-red-600 font-bold">
              Cancel
            </button>
          </div>

          <div className="w-full bg-slate-100 h-1.5 relative">
            <div className="bg-[#5e4feb] h-1.5 absolute left-0 top-0 w-[90%]" />
          </div>

          <div className="px-4 mt-5">
            <h1 className="text-base font-black text-slate-900">Checkout</h1>

            <div className="bg-white rounded-2xl border border-slate-100 p-4 mt-4 flex items-center justify-between text-xs shadow-sm">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Total Bill</span>
                <span className="text-sm font-black text-[#5e4feb]">₹{grandTotal}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-800 font-bold block">{selectedSeats.length} Tickets</span>
                <span className="text-[10px] text-slate-400 font-medium">{selectedSeats.join(", ")}</span>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Choose payment method</h3>
              <div className="flex gap-4 mt-2.5">
                <label className="flex items-center gap-2 bg-white border border-[#5e4feb] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer select-none text-slate-800">
                  <input type="radio" defaultChecked className="accent-[#5e4feb] w-3.5 h-3.5" name="payment_method" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed opacity-50 select-none">
                  <input type="radio" disabled className="accent-[#5e4feb] w-3.5 h-3.5" name="payment_method" />
                  <span>Mobile Wallet</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-500 text-center font-bold">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 pl-1">Name on card</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#5e4feb] transition-colors text-slate-800 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 pl-1">Card number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-[#5e4feb] transition-colors w-full text-slate-800 font-semibold"
                  />
                  <CreditCard size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 pl-1">Expiry date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#5e4feb] transition-colors text-slate-800 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 pl-1">CVV/CVC</label>
                  <input
                    type="password"
                    required
                    placeholder="***"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#5e4feb] transition-colors text-center font-bold tracking-widest text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold mt-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Secure 256-bit SSL encrypted transaction</span>
              </div>
            </div>

            <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-100 z-40">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#5e4feb] hover:bg-[#4f46e5] text-white shadow-md"
              >
                {loading ? "Processing transaction..." : `Complete Payment (₹${grandTotal})`}
              </button>
            </div>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="px-4 pt-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
            <svg className="w-6 h-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-base font-black text-slate-900 mt-4">Payment Successful!</h1>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Your seats have been booked permanently.</p>

          <div className="mt-8 bg-white text-slate-900 rounded-3xl p-5 w-full flex flex-col gap-4 text-left relative overflow-hidden shadow-md border border-slate-100">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5e4feb] to-indigo-600" />

            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Movie Ticket</span>
              <h2 className="text-base font-black text-slate-800 leading-tight mt-0.5">{selectedMovie.title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-slate-50 pt-3.5">
              <div>
                <span className="text-slate-400 block font-bold">THEATRE</span>
                <span className="text-slate-800 font-bold leading-tight block mt-0.5">{selectedTheatre}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">SHOWTIME</span>
                <span className="text-slate-800 font-bold block mt-0.5">Screen 1 • {selectedShowtime.time}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <span className="text-slate-400 block font-bold">DATE</span>
                <span className="text-slate-800 font-bold block mt-0.5">{formattedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">FORMAT</span>
                <span className="text-slate-800 font-black block mt-0.5">{selectedShowtime.format}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
              <div className="text-[10px]">
                <span className="text-slate-400 block font-bold">SEATS</span>
                <span className="text-base font-black text-[#5e4feb] mt-0.5 block">{selectedSeats.join(", ")}</span>

                <span className="text-slate-400 block font-bold mt-2.5">TRANSACTION ID</span>
                <span className="text-[9px] font-mono text-slate-600 mt-0.5 block">{transactionId}</span>
              </div>
              <QRCode />
            </div>
          </div>

          <p className="text-[9px] text-slate-400 mt-8 font-semibold">
            You may view all purchased tickets in the tickets page.
          </p>

          <button
            onClick={handleSuccessClose}
            className="mt-6 px-6 py-2.5 bg-[#5e4feb] hover:bg-[#4f46e5] text-white text-xs font-bold rounded-xl shadow-md transition-all w-2/3"
          >
            Go to My Bookings
          </button>
        </div>
      )}

      {step === "failure" && (
        <div className="px-4 pt-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm">
            <svg className="w-6 h-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-base font-black text-slate-900 mt-4">Transaction Declined</h1>
          <p className="text-[10px] text-slate-500 mt-1.5 px-6 leading-relaxed font-medium">
            {errorMessage || "The payment gateway rejected the credentials provided. For safety, your seat reservations have been released back to the pool."}
          </p>

          <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-4 text-left w-full text-xs flex flex-col gap-2 shadow-sm">
            <span className="text-red-600 font-bold uppercase tracking-wider text-[10px]">ACID Property Rollback</span>
            <p className="text-slate-600 text-[10px] leading-relaxed font-medium">
              To prevent deadlocks and double-booking, the system executed an atomic rollback. The database released seats <span className="text-slate-950 font-bold">{selectedSeats.join(", ")}</span> immediately.
            </p>
          </div>

          <button
            onClick={handleFailureClose}
            className="mt-8 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all w-2/3"
          >
            Close and Return
          </button>
        </div>
      )}

      {step !== "success" && step !== "failure" && <BottomNavigation />}
    </div>
  );
};

export default CheckoutPage;
