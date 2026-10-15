import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { PaymentReceipt } from '../types';

interface PaymentReceiptModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              360
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official Payment Receipt & Invoice</h3>
              <span className="text-[11px] text-slate-500 font-mono">Ref: {receipt.receiptId}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status stamp */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <strong className="text-xs text-emerald-950 font-bold block">
                  PAYMENT VERIFIED & SETTLED
                </strong>
                <span className="text-[11px] text-emerald-700">
                  {receipt.paymentMethod === 'ONLINE' ? 'Razorpay Secure Indian Payment Gateway' : 'In-Person Hospital Cashier Counter'}
                </span>
              </div>
            </div>
            <span className="text-sm font-mono font-extrabold text-emerald-900">
              ₹{receipt.totalAmount}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                <strong className="text-slate-900 text-xs">{receipt.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Booking Reference</span>
                <strong className="text-slate-900 text-xs font-mono">{receipt.bookingReference}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Hospital / Institution</span>
                <strong className="text-slate-900 text-xs">{receipt.hospitalName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Consultant Doctor</span>
                <strong className="text-slate-900 text-xs">{receipt.doctorName}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment Channel</span>
                <span className="text-slate-800 text-xs font-medium">{receipt.paymentChannel}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Date & Timestamp</span>
                <span className="text-slate-800 text-xs tabular-nums">{receipt.date}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Gateway / Receipt ID</span>
              <span className="text-slate-800 text-[11px] font-mono break-all">{receipt.transactionReference}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-slate-600">
              <span>Consultation Subtotal:</span>
              <span className="font-mono">₹{receipt.amount}</span>
            </div>
            {receipt.gstAmount > 0 && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Applicable GST (18%):</span>
                <span className="font-mono">₹{receipt.gstAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
              <span>Total Amount Paid:</span>
              <span className="font-mono text-teal-800">₹{receipt.totalAmount}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2">
            This is a computer generated verifiable digital tax receipt under MEDISEVA 360 Healthcare Infrastructure.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => alert(`Receipt ${receipt.receiptId} downloaded as PDF`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
