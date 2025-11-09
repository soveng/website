import React, { useState } from 'react';
import type { CollectionEntry } from 'astro:content';

interface TimelineTabsProps {
  cohorts: CollectionEntry<'cohorts'>[];
}

const TimelineTabs: React.FC<TimelineTabsProps> = ({ cohorts }) => {
  // Sort cohorts by start date
  const sortedCohorts = [...cohorts].sort((a, b) =>
    new Date(a.data.dates.start).getTime() - new Date(b.data.dates.start).getTime()
  );

  // Default to first open cohort, or first cohort if none open
  const defaultIndex = sortedCohorts.findIndex(c => c.data.status === 'open');
  const [activeIndex, setActiveIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);

  const activeCohort = sortedCohorts[activeIndex];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { text: 'OPEN NOW', className: 'bg-green-600 text-white animate-pulse' };
      case 'closed':
        return { text: 'CLOSED', className: 'bg-gray-600 text-gray-300' };
      case 'upcoming':
        return { text: 'COMING SOON', className: 'bg-yellow-600 text-white' };
      default:
        return { text: '', className: '' };
    }
  };

  const getStatusStyle = (status: string, isActive: boolean) => {
    const base = 'transition-all duration-300';
    if (isActive) {
      return `${base} scale-110 shadow-lg`;
    }
    switch (status) {
      case 'open':
        return `${base} hover:scale-105`;
      case 'closed':
        return `${base} opacity-50`;
      case 'upcoming':
        return `${base} hover:scale-105`;
      default:
        return base;
    }
  };

  return (
    <div className="timeline-tabs-container">
      {/* Main Layout: Timeline/Content on Left, Image on Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Timeline + Content */}
        <div className="flex-1 lg:w-3/5">
          {/* Timeline Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Apply to SEC</h2>
            <p className="text-lg text-gray-300">Choose your cohort</p>
          </div>

          {/* Timeline Visualization */}
          <div className="timeline-wrapper mb-12 px-4">
            <div className="timeline-year text-white text-sm mb-4 text-center font-mono">2026</div>

            <div className="relative flex items-center justify-between max-w-3xl mx-auto">
              {/* Timeline Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gray-600 top-1/2 -translate-y-1/2 z-0"></div>

              {/* Timeline Nodes */}
              {sortedCohorts.map((cohort, index) => {
                const badge = getStatusBadge(cohort.data.status);
                const isActive = index === activeIndex;

                return (
                  <button
                    key={cohort.data.id}
                    onClick={() => setActiveIndex(index)}
                    className={`timeline-node relative z-10 flex flex-col items-center cursor-pointer group ${getStatusStyle(cohort.data.status, isActive)}`}
                    disabled={cohort.data.status === 'closed'}
                  >
                    {/* Dot */}
                    <div className={`w-6 h-6 rounded-full mb-3 border-4 ${
                      isActive
                        ? 'bg-white border-white scale-125'
                        : cohort.data.status === 'open'
                        ? 'bg-green-500 border-green-500 group-hover:scale-110'
                        : cohort.data.status === 'closed'
                        ? 'bg-gray-500 border-gray-500'
                        : 'bg-yellow-500 border-yellow-500 group-hover:scale-110'
                    }`}></div>

                    {/* Label */}
                    <div className="text-center min-w-[100px]">
                      <div className={`font-bold text-sm md:text-base mb-1 ${
                        isActive ? 'text-white' : 'text-gray-300'
                      }`}>
                        {cohort.data.id}
                      </div>
                      <div className={`text-xs md:text-sm mb-2 ${
                        isActive ? 'text-gray-200' : 'text-gray-400'
                      }`}>
                        {cohort.data.theme}
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${badge.className}`}>
                        {badge.text}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Arrow */}
              <div className="absolute -right-4 text-gray-600 text-2xl z-0">→</div>
            </div>
          </div>

          {/* Active Cohort Content */}
          <div className="cohort-content">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {activeCohort.data.id}: {activeCohort.data.theme}
            </h3>

            <div className="text-gray-300 mb-4 space-y-2">
              <p className="text-lg font-medium">
                {activeCohort.data.dates.start} - {activeCohort.data.dates.end}
              </p>
              <p className="text-base">{activeCohort.data.location}</p>
            </div>

            <p className="text-gray-200 mb-6">{activeCohort.data.description}</p>

            {activeCohort.data.northStar && (
              <div className="mb-6 p-4 bg-black/50 rounded border border-gray-600">
                <p className="text-sm text-gray-400 mb-2">North Star Team</p>
                <p className="text-white font-bold mb-1">
                  <a
                    href={activeCohort.data.northStar.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {activeCohort.data.northStar.name}
                  </a>
                  {activeCohort.data.northStar.lead && (
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      led by {activeCohort.data.northStar.lead}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-300">{activeCohort.data.northStar.description}</p>
              </div>
            )}

            {activeCohort.data.additionalInfo && (
              <div className="mb-6 p-4 bg-blue-900/20 rounded border border-blue-700">
                <p className="text-sm text-blue-200">{activeCohort.data.additionalInfo}</p>
              </div>
            )}

            {/* Action Button */}
            {activeCohort.data.status === 'open' && (
              <a
                href={activeCohort.data.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-retro px-8 py-4 inline-block"
              >
                Apply Now!
              </a>
            )}

            {activeCohort.data.status === 'closed' && (
              <div className="inline-block px-8 py-4 bg-gray-700 text-gray-400 rounded cursor-not-allowed">
                Applications Closed
              </div>
            )}

            {activeCohort.data.status === 'upcoming' && (
              <div className="inline-block px-8 py-4 bg-yellow-700/50 text-yellow-200 rounded">
                Applications Opening Soon
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="lg:w-2/5">
          <a
            href="https://en.wikipedia.org/wiki/Endurance_(1912_ship)"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src="/images/men-wanted.png"
              alt="Vintage recruitment poster encouraging applications"
              className="w-full mix-blend-darken"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TimelineTabs;
