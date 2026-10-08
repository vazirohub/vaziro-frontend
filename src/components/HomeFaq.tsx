import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  CircleHelp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  tag: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What is Vaziro and how does the verified marketplace work?',
    answer:
      'Vaziro is India’s verified two-sided online marketplace connecting families with pre-verified independent professionals—such as elderly caregivers, home nurses, physiotherapists, home tutors, and cooks across Delhi NCR. You post your service need for free, compare transparent quotations directly from verified professionals, and hire with 100% Escrow milestone protection.',
    tag: 'Marketplace Basics',
  },
  {
    question: 'How does the 100% Escrow Milestone Payment Protection guarantee work?',
    answer:
      'When you agree on a quotation and hire a professional, your payment is deposited into a safe escrow milestone holding account. Funds are never released in advance. They are only paid out to the professional after you inspect and confirm that the work or service milestone has been completed to your satisfaction.',
    tag: 'Payment Security',
  },
  {
    question: 'How are service professionals verified on Vaziro?',
    answer:
      'All independent professionals undergo DigiLocker-based government identification verification (Aadhaar / PAN), qualification and certificate audits (e.g. BPT degrees for physiotherapists, GNM/B.Sc Nursing for home nurses), and background references. Verified profiles display a prominent green verification badge.',
    tag: 'Trust & Verification',
  },
  {
    question: 'Is it completely free to post a service requirement?',
    answer:
      'Yes! Posting a service requirement on Vaziro is 100% free with zero obligation to hire. You can describe your specific requirements, timeline, and budget, receive multiple competitive proposals, chat with professionals, and hire only if you find the right fit.',
    tag: 'Pricing & Fees',
  },
  {
    question: 'Why are contact numbers and email addresses protected initially?',
    answer:
      'To protect both client privacy and professional safety from spam and unregulated solicitations, personal contact details (phone number, email address) are kept private. Once a client selects a professional and starts an escrow-protected contract, direct phone and communication channels are automatically unlocked.',
    tag: 'Privacy & Safety',
  },
  {
    question: 'Which cities and areas across Delhi NCR does Vaziro currently serve?',
    answer:
      'Vaziro operates across all major Delhi NCR territories, including Delhi (South, Central, West, East, North Delhi), Noida, Greater Noida, Gurugram (Gurgaon, Cyber City, DLF, Golf Course Road), and Ghaziabad (Indirapuram, Vaishali).',
    tag: 'Locations',
  },
  {
    question: 'How do independent professionals join Vaziro and receive direct leads?',
    answer:
      'Independent professionals can register on Vaziro for free. Upon completing their profile and DigiLocker ID verification, they receive 10 free welcome credits to submit proposals for active client requests across Delhi NCR with zero commission deductions.',
    tag: 'For Professionals',
  },
];

export const HomeFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-16 sm:py-20 bg-[#f7f8f3] border-b border-neutral-200/90" aria-labelledby="home-faq-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Grid: Left Title / Right Accordions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Heading & Workflow Links */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
              <CircleHelp className="w-3.5 h-3.5 text-[#108a00]" />
              <span>Questions & Answers</span>
            </div>

            <h2 id="home-faq-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Frequently asked questions.
            </h2>

            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              Learn how posting requirements, background verification, escrow milestone holding, and direct hiring work on Vaziro.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-[#108a00]" />
                <span>100% Escrow Milestone Protected</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Have a unique requirement or need assistance? Our team and Isha AI support are available 24/7.
              </p>
              <Link
                to="/workflow-preview"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#108a00] hover:text-[#14a800] hover:underline"
              >
                <span>Read our full workflow guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Accordions List */}
          <div className="lg:col-span-7 space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl border border-neutral-200/80 transition-all duration-200 overflow-hidden shadow-2xs hover:border-emerald-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
                        {faq.question}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 animate-in fade-in duration-150">
                      <div className="pt-3">
                        <p>{faq.answer}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                            {faq.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
