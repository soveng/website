import type { CollectionEntry } from 'astro:content';
import React, { useState } from 'react';

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

  // Calculate spacing between cohorts based on weeks
  const getSpacingFlex = (index: number) => {
    if (index === 0) return 1; // First item
    const prevDate = new Date(sortedCohorts[index - 1].data.dates.start);
    const currentDate = new Date(sortedCohorts[index].data.dates.start);
    const weeksBetween = Math.round((currentDate.getTime() - prevDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return weeksBetween; // Use weeks as flex grow value
  };

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
      {/* Main Layout: Tabs on Left, Image on Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Tabs */}
        <div className="flex-1 lg:w-3/5">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Apply To SEC</h2>
            <p className="text-sm text-white/70 mt-2 font-mono">2026</p>
          </div>

          {/* Horizontal Tabs */}
          <div className="flex flex-col">
            {/* Tab Headers Row */}
            <div className="flex gap-2 mb-0">
              {sortedCohorts.map((cohort, index) => {
                const badge = getStatusBadge(cohort.data.status);
                const isActive = index === activeIndex;

                return (
                  <button
                    key={cohort.data.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex-1 p-4 rounded-t-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-black/30 border-2 border-b-0 border-white/20'
                        : 'bg-transparent border-2 border-transparent hover:bg-black/10'
                    }`}
                    disabled={cohort.data.status === 'closed'}
                  >
                    {/* Dot */}
                    <div className={`w-6 h-6 rounded-full mx-auto mb-3 border-4 transition-all ${
                      isActive
                        ? 'bg-white border-white scale-125'
                        : cohort.data.status === 'open'
                        ? 'bg-green-500 border-green-500'
                        : cohort.data.status === 'closed'
                        ? 'bg-gray-500 border-gray-500'
                        : 'bg-yellow-500 border-yellow-500'
                    }`}></div>

                    {/* Label */}
                    <div className="text-center">
                      <div className={`font-bold text-sm md:text-base mb-1 ${
                        isActive ? 'text-white' : 'text-gray-300'
                      }`}>
                        {cohort.data.id}
                      </div>
                      <div className={`text-sm md:text-base mb-2 font-semibold ${
                        isActive ? 'text-white' : 'text-gray-200'
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
            </div>

            {/* Active Tab Content */}
            <div className="bg-black/30 border-2 border-t-0 border-white/20 rounded-b-lg p-6 shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {activeCohort.data.id}: {activeCohort.data.theme}
            </h3>

            <p className="text-lg font-semibold text-white mb-4">
              {activeCohort.data.dates.start} - {activeCohort.data.dates.end} · {activeCohort.data.location}
            </p>

            <p className="text-lg text-white/90 mb-6 leading-relaxed">{activeCohort.data.description}</p>

            {activeCohort.data.northStar && (
              <div className="mb-6 p-5 bg-black/40 rounded border border-gray-600">
                <p className="text-lg font-bold text-white mb-3">North Star Team</p>
                <p className="text-lg text-white/90 leading-relaxed">
                  <a
                    href={activeCohort.data.northStar.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-2 underline-offset-2 hover:text-primary transition-colors"
                  >
                    {activeCohort.data.northStar.name}
                  </a>
                  {activeCohort.data.northStar.lead && (
                    <span> led by {activeCohort.data.northStar.lead}</span>
                  )}
                  {' '}{activeCohort.data.northStar.description}
                </p>
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
        </div>

        {/* Right Side: Image */}
        <div className="lg:w-2/5 flex items-center justify-center">
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
