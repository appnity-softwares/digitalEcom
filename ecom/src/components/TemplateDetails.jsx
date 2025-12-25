import React from 'react';

const TemplateDetails = ({
  description = "A premium template designed for excellence.",
  pages = ['Home', 'About', 'Contact'],
  features = ["No coding required", "Fully customizable", "Responsive design"]
}) => {
  return (
    <div className="w-full bg-[#F5F5F7] px-6 py-20 font-sans border-b border-gray-200/50">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* ================= COLUMN 1: DESCRIPTION (Wider) ================= */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            Template description
          </h2>

          <div className="text-gray-500 text-lg leading-relaxed flex flex-col gap-6">
            <p>
              {description}
            </p>

            <ul className="flex flex-col gap-2 list-disc pl-5 marker:text-gray-400">
              <li>Showcase services in a structured, engaging way.</li>
              <li>Share success stories to build trust.</li>
              <li>Mobile responsive design that works perfectly.</li>
              <li>Customize each section to match your brand.</li>
            </ul>

            <p>
              Designed to take the complexity out of website creation, allowing you to focus on your business goals.
            </p>
          </div>
        </div>


        {/* ================= COLUMN 2: PAGES INCLUDED ================= */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            Pages included
          </h2>

          <ul className="flex flex-col gap-3 text-gray-500 text-lg font-medium">
            {pages.map((page) => (
              <li key={page} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                {page}
              </li>
            ))}
          </ul>
        </div>


        {/* ================= COLUMN 3: FEATURES ================= */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            Features
          </h2>

          <ul className="flex flex-col gap-5 text-gray-500 text-lg font-medium">

            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-black shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{feature}</span>
              </li>
            ))}

          </ul>
        </div>

      </div>
    </div>
  );
};

export default TemplateDetails;