import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  ShieldCheck,
  Building2, 
  Sparkles,
  Users,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { getDirectory } from '../api/directory';
import { useLang } from '../context/LanguageContext';
import Modal from './ui/Modal';

const PANCHAYAT_REPRESENTATIVES = [
  {
    id: 'sarpanch',
    roleHi: 'सरपंच (ग्राम प्रधान)',
    roleEn: 'Sarpanch (Gram Pradhan)',
    name: 'श्री लखन',
    nameEn: 'Shri Lakhan',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'प्रथम नागरिक / ग्राम प्रधान',
    badgeEn: 'First Citizen / Gram Pradhan',
    icon: 'ShieldCheck',
    isLeader: true,
    wardNumber: null
  },
  {
    id: 'ward-1',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्रीमती कौशल्या देवी',
    nameEn: 'Smt. Kaushalya Devi',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 1 प्रतिनिधि',
    badgeEn: 'Ward 1 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 1
  },
  {
    id: 'ward-2',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्री रामअवतार मीणा',
    nameEn: 'Shri Ramavtar Meena',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 2 प्रतिनिधि',
    badgeEn: 'Ward 2 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 2
  },
  {
    id: 'ward-3',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्रीमती विमला जाट',
    nameEn: 'Smt. Vimla Jat',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 3 प्रतिनिधि',
    badgeEn: 'Ward 3 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 3
  },
  {
    id: 'ward-4',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्री मुकेश गुर्जर',
    nameEn: 'Shri Mukesh Gurjar',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 4 प्रतिनिधि',
    badgeEn: 'Ward 4 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 4
  },
  {
    id: 'ward-5',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्रीमती संतोष शर्मा',
    nameEn: 'Smt. Santosh Sharma',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 5 प्रतिनिधि',
    badgeEn: 'Ward 5 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 5
  },
  {
    id: 'ward-6',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्री धर्मपाल वर्मा',
    nameEn: 'Shri Dharmpal Verma',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 6 प्रतिनिधि',
    badgeEn: 'Ward 6 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 6
  },
  {
    id: 'ward-7',
    roleHi: 'वार्ड पंच',
    roleEn: 'Ward Member (Panch)',
    name: 'श्री सोहन लाल बैरवा',
    nameEn: 'Shri Sohan Lal Bairwa',
    deptHi: 'ग्राम पंचायत सहरी',
    deptEn: 'Gram Panchayat Sahari',
    badgeHi: 'वार्ड 7 प्रतिनिधि',
    badgeEn: 'Ward 7 Member',
    icon: 'UserCheck',
    isLeader: false,
    wardNumber: 7
  }
];

const VillageDirectory = () => {
  const { lang, t } = useLang();
  const [representatives, setRepresentatives] = useState(PANCHAYAT_REPRESENTATIVES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDirectoryData = async () => {
      try {
        setLoading(true);
        const data = await getDirectory();
        if (isMounted) {
          const list = Array.isArray(data) ? data : data?.contacts || data?.data || [];
          if (list && list.length > 0) {
            const hasLakhan = list.some((c) => c.name && c.name.includes('लखन'));
            if (hasLakhan) {
              const sarpanch = list.find((c) => c.name && c.name.includes('लखन'));
              const customSarpanch = {
                ...PANCHAYAT_REPRESENTATIVES[0],
                name: sarpanch.name,
                nameEn: sarpanch.nameEn || 'Shri Lakhan'
              };
              setRepresentatives([customSarpanch, ...PANCHAYAT_REPRESENTATIVES.slice(1)]);
            } else {
              setRepresentatives(PANCHAYAT_REPRESENTATIVES);
            }
          } else {
            setRepresentatives(PANCHAYAT_REPRESENTATIVES);
          }
        }
      } catch (err) {
        if (isMounted) {
          setRepresentatives(PANCHAYAT_REPRESENTATIVES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDirectoryData();
    return () => {
      isMounted = false;
    };
  }, []);

  const sarpanch = representatives.find((r) => r.isLeader || r.id === 'sarpanch') || representatives[0];
  const wardRepresentatives = representatives.filter((r) => !r.isLeader && r.id !== 'sarpanch');

  const sarpanchRoleDisplay = lang === 'hi' ? (sarpanch.roleHi || sarpanch.role) : (sarpanch.roleEn || sarpanch.role);
  const sarpanchNameDisplay = lang === 'hi' ? sarpanch.name : (sarpanch.nameEn || sarpanch.name);
  const sarpanchDeptDisplay = lang === 'hi' ? (sarpanch.deptHi || 'ग्राम पंचायत सहरी') : (sarpanch.deptEn || 'Gram Panchayat Sahari');
  const sarpanchBadgeDisplay = lang === 'hi' ? (sarpanch.badgeHi || sarpanch.badge) : (sarpanch.badgeEn || sarpanch.badge);

  return (
    <section id="directory" className="py-8 sm:py-12 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Authentic Institutional Banner on Main Page */}
        <div className="bg-white border border-slate-200 border-t-4 border-t-blue-900 rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-[11px] sm:text-xs font-bold">
                <Users className="w-3.5 h-3.5 text-blue-900" />
                <span>{t.directContact}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {t.dirBannerHeading}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.dirBannerSubtitle}
              </p>

              {/* Clean Outlined Badge Chips (Zero Phone Numbers) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                  <span>{lang === 'hi' ? 'सरपंच: श्री लखन' : 'Sarpanch: Shri Lakhan'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />
                  <span>{lang === 'hi' ? '7 वार्ड पंच (वार्ड 1-7)' : '7 Ward Members'}</span>
                </span>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="w-full md:w-auto shrink-0 pt-1 md:pt-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 active:scale-95 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/30"
              >
                <span>{t.dirBtnView}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Clean, Mobile-Optimized Representatives Directory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.dirModalTitle}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5">
          
          {/* Section A (Top): Featured Sarpanch Institutional Card */}
          <div className="bg-slate-50 border border-slate-200 border-t-4 border-t-blue-900 rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-blue-900">
                    {sarpanchRoleDisplay}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                    <span>{sarpanchBadgeDisplay}</span>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {sarpanchNameDisplay}
                </h3>

                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sarpanchDeptDisplay}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t.dirElected}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Ward-wise List (Wards 1 to 7) formatted in clean compact grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-900" />
                <span>{t.dirModalWardSubhead}</span>
              </h4>
              <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {lang === 'hi' ? 'वार्ड 1 से 7' : 'Wards 1–7'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {wardRepresentatives.map((rep, idx) => {
                const nameDisplay = lang === 'hi' ? rep.name : (rep.nameEn || rep.name);
                const wardNum = rep.wardNumber || idx + 1;
                const deptDisplay = lang === 'hi' ? (rep.deptHi || 'ग्राम पंचायत सहरी') : (rep.deptEn || 'Gram Panchayat Sahari');

                return (
                  <div
                    key={rep.id || idx}
                    className="bg-white rounded-lg p-3 sm:p-3.5 border border-slate-200 shadow-2xs hover:border-blue-900/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Ward Avatar */}
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-blue-950 font-black flex items-center justify-center shrink-0 border border-slate-200 text-xs">
                        W{wardNum}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                            {lang === 'hi' ? `वार्ड ${wardNum} पंच` : `Ward ${wardNum} Panch`}
                          </span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
                          {nameDisplay}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {deptDisplay}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{t.dirElected}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </Modal>
    </section>
  );
};

export default VillageDirectory;