import React, { useRef, useState } from 'react';
import { Download, FileText, Loader2, CheckCircle2, Landmark, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLang } from '../../context/LanguageContext';

const ExportReportButton = ({
  analyticsData = {},
  stats = {}
}) => {
  const { lang, t } = useLang();
  const [exporting, setExporting] = useState(false);
  const printableRef = useRef(null);

  const wardBreakdown = analyticsData?.wardBreakdown || [];
  const resolutionMetrics = analyticsData?.resolutionMetrics || {};
  const categoryDistribution = analyticsData?.categoryDistribution || [];
  const criticalWard = analyticsData?.criticalWard || 1;

  const totalComplaints = resolutionMetrics?.totalAllComplaints || stats?.total || 0;
  const overallRate = resolutionMetrics?.overallResolutionRate ?? 0;
  const avgDays = resolutionMetrics?.averageResolutionDays ?? 2.4;

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setExporting(true);
    const toastId = toast.loading(lang === 'hi' ? 'पीडीएफ रिपोर्ट तैयार की जा रही है...' : 'Generating PDF Report...');

    try {
      // Dynamically load html2canvas and jspdf on demand
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Allow DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(printableRef.current, {
        scale: 2, // High resolution for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF (scales to single A4 or handles height)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      
      const todayStr = new Date().toISOString().split('T')[0];
      const fileName = `Gram_Panchayat_Sahari_Ward_Report_${todayStr}.pdf`;
      pdf.save(fileName);

      toast.success(lang === 'hi' ? 'मासिक रिपोर्ट सफलतापूर्वक डाउनलोड हो गई!' : 'Monthly report downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(lang === 'hi' ? 'रिपोर्ट डाउनलोड करने में समस्या आई' : 'Failed to generate PDF report', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      {/* Action Button */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={exporting}
        className="min-h-[40px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-900 shrink-0 touch-target-min"
        title={t.downloadPdfReport}
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="sm:hidden">{lang === 'hi' ? 'तैयार हो रहा है...' : 'PDF...'}</span>
            <span className="hidden sm:inline">{t.generatingPdf}</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">{lang === 'hi' ? 'मासिक रिपोर्ट (PDF)' : 'Monthly Report (PDF)'}</span>
            <span className="hidden sm:inline">{t.downloadPdfReport}</span>
          </>
        )}
      </button>

      {/* Hidden Printable Document for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={printableRef}
          style={{ width: '800px', backgroundColor: '#ffffff', color: '#0f172a' }}
          className="p-8 font-devanagari antialiased"
        >
          {/* Header */}
          <div className="border-b-2 border-blue-900 pb-5 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-blue-900 bg-blue-50 flex items-center justify-center text-blue-900 flex-shrink-0">
                <Landmark className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  ग्राम पंचायत सहरी (Gram Panchayat Sahari)
                </h1>
                <p className="text-xs font-semibold text-blue-900 mt-0.5">
                  ई-शासन एवं नागरिक शिकायत निवारण नियंत्रण कक्ष • मासिक विश्लेषणात्मक रिपोर्ट
                </p>
                <p className="text-[11px] text-slate-500">
                  प्रशासनिक निगरानी एवं ग्राम सभा समीक्षा रिपोर्ट
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <p className="font-mono font-bold text-slate-800">रिफ़रेंस: GPS/REP/2026</p>
              <p className="mt-0.5">दिनांक: {currentDateFormatted}</p>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">
                आधिकारिक दस्तावेज
              </span>
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">कुल वार्ड</span>
              <span className="text-xl font-black text-slate-900">7</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">वार्ड 1 से 7</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">कुल शिकायतें</span>
              <span className="text-xl font-black text-slate-900">{totalComplaints}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">दर्ज मामले</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">समाधान दर</span>
              <span className="text-xl font-black text-emerald-700">{overallRate}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">सफलता प्रतिशत</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">सर्वाधिक लंबित</span>
              <span className="text-xl font-black text-rose-700">वार्ड {criticalWard}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">अति संवेदनशील</span>
            </div>
          </div>

          {/* Ward-Wise Summary Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-emerald-600 pl-2 mb-3">
              1. वार्ड-वार शिकायत स्थिति एवं गंभीरता तालिका (Wards 1–7)
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                  <th className="py-2 px-2.5">वार्ड</th>
                  <th className="py-2 px-2 text-center">कुल</th>
                  <th className="py-2 px-2 text-center text-amber-800">लंबित</th>
                  <th className="py-2 px-2 text-center text-blue-800">प्रगति पर</th>
                  <th className="py-2 px-2 text-center text-emerald-800">निस्तारित</th>
                  <th className="py-2 px-2.5">शीर्ष समस्या श्रेणी</th>
                  <th className="py-2 px-2 text-center">समाधान दर</th>
                  <th className="py-2 px-2 text-center">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {wardBreakdown.map((w) => {
                  const statusLabel =
                    w.resolutionRate >= 80 || w.openCount === 0
                      ? 'सामान्य'
                      : w.resolutionRate >= 50
                      ? 'मध्यम'
                      : 'संवेदनशील';

                  return (
                    <tr key={w.wardNumber} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 font-bold text-slate-800">
                        वार्ड {w.wardNumber}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-900">{w.totalComplaints}</td>
                      <td className="py-2 px-2 text-center font-bold text-amber-700">{w.pending}</td>
                      <td className="py-2 px-2 text-center font-bold text-blue-700">{w.inProgress}</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">{w.resolved}</td>
                      <td className="py-2 px-2.5 font-medium text-slate-700">{w.topCategory || '—'}</td>
                      <td className="py-2 px-2 text-center font-bold text-slate-800">{w.resolutionRate}%</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            statusLabel === 'सामान्य'
                              ? 'bg-emerald-100 text-emerald-800'
                              : statusLabel === 'मध्यम'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Category Breakdown Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-blue-600 pl-2 mb-3">
              2. समस्या श्रेणी-वार वितरण (Issue Categories)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {categoryDistribution.slice(0, 6).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">{c.category}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {c.count} मामले ({c.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Signatures & Seal Section */}
          <div className="mt-8 pt-6 border-t border-slate-300">
            <p className="text-[11px] text-slate-500 mb-6 italic text-center">
              यह रिपोर्ट ग्राम पंचायत सहरी के प्रशासनिक पोर्टल से स्वतः संकलित की गई है एवं ग्राम सभा बैठक में समीक्षा हेतु मान्य है।
            </p>
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="border-t border-dashed border-slate-400 pt-3">
                <p className="font-bold text-slate-800">हस्ताक्षर ग्राम प्रधान (सरपंच)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">ग्राम पंचायत सहरी</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 border border-slate-300 rounded-xl bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  कार्यालय मुहर
                </span>
                <span className="text-[10px] text-slate-400">(Official Seal)</span>
              </div>
              <div className="border-t border-dashed border-slate-400 pt-3">
                <p className="font-bold text-slate-800">हस्ताक्षर ग्राम विकास अधिकारी (सचिव)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">पंचायत समिति / ब्लॉक प्रशासन</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ExportReportButton;
