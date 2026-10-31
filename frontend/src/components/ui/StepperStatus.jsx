import React from 'react';
import { Check } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

/**
 * StepperStatus component with bilingual support and modern UI
 * Visual progress stepper for tracking complaint status.
 *
 * @param {object} props
 * @param {'Pending'|'Under Review'|'In Progress'|'Resolved'|string} props.currentStatus
 */
const StepperStatus = ({ currentStatus }) => {
  const { lang } = useLang();

  const steps = [
    { 
      id: 1, 
      label: lang === 'hi' ? 'दर्ज' : 'Lodged', 
      sublabel: lang === 'hi' ? 'Lodged' : 'दर्ज' 
    },
    { 
      id: 2, 
      label: lang === 'hi' ? 'समीक्षाधीन' : 'Under Review', 
      sublabel: lang === 'hi' ? 'Under Review' : 'समीक्षाधीन' 
    },
    { 
      id: 3, 
      label: lang === 'hi' ? 'प्रगति पर' : 'In Progress', 
      sublabel: lang === 'hi' ? 'In Progress' : 'प्रगति पर' 
    },
    { 
      id: 4, 
      label: lang === 'hi' ? 'समाधान पूर्ण' : 'Resolved', 
      sublabel: lang === 'hi' ? 'Resolved' : 'समाधान पूर्ण' 
    },
  ];

  const getStepNumber = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'resolved' || s === 'समाधान' || s === 'समाधान पूर्ण' || s === 'पूर्ण' || s === 'निस्तारित') return 4;
    if (s === 'in progress' || s === 'in_progress' || s === 'in-progress' || s === 'जारी' || s === 'प्रगति पर') return 3;
    if (s === 'under review' || s === 'समीक्षाधीन' || s === 'समीक्षा') return 2;
    // Default: Pending / दर्ज
    return 1;
  };

  const currentStep = getStepNumber(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full" aria-hidden="true" />

        {/* Active Progress Line */}
        <div
          className="absolute left-0 top-5 -translate-y-1/2 h-1 bg-emerald-600 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${((Math.max(1, currentStep) - 1) / (steps.length - 1)) * 100}%`,
          }}
          aria-hidden="true"
        />

        {/* Step Items */}
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-white border-2 border-emerald-600 text-emerald-700 ring-4 ring-emerald-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              <div className="mt-2 text-center">
                <p
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'text-emerald-700 font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <span className="hidden sm:block text-[11px] text-slate-400">
                  {step.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepperStatus;
