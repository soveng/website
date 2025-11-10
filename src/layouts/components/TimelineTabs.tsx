import type { CollectionEntry } from 'astro:content';
import React, { useState } from 'react';

interface TimelineTabsProps {
  cohorts: CollectionEntry<'cohorts'>[];
}

const TimelineTabs: React.FC<TimelineTabsProps> = ({ cohorts }) => {
  // Sort cohorts by start date
  const sortedCohorts = [...cohorts].sort((a, b) => new Date(a.data.dates.start).getTime() - new Date(b.data.dates.start).getTime());

  // Default to first open cohort, or first cohort if none open
  const defaultIndex = sortedCohorts.findIndex((c) => c.data.status === 'open');
  const [activeIndex, setActiveIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);

  const activeCohort = sortedCohorts[activeIndex];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { text: 'OPEN NOW', className: 'bg-green-600 text-white animate-pulse' };
      case 'closed':
        return { text: 'CLOSED', className: 'bg-gray-600 text-gray-300' };
      case 'upcoming':
        return { text: 'OPENING SOON', className: 'bg-yellow-500 text-gray-900' };
      default:
        return { text: '', className: '' };
    }
  };

  return (
    <div className="timeline-tabs-container">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Apply To SEC</h2>
        <p className="mt-1 font-mono text-lg font-semibold text-gray-900">2026</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex flex-col shadow-2xl">
        {/* Tab Headers Row */}
        <div className="flex">
          {sortedCohorts.map((cohort, index) => {
            const badge = getStatusBadge(cohort.data.status);
            const isActive = index === activeIndex;

            return (
              <button
                key={cohort.data.id}
                onClick={() => setActiveIndex(index)}
                className={`flex-1 p-4 transition-all duration-300 ${
                  isActive
                    ? 'relative z-10 border-t-2 border-r-2 border-l-2 border-white/30 bg-black/40 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_0px_0px_rgba(0,0,0,0.5)]'
                    : 'border-2 border-white/20 bg-black/20 shadow-[inset_-2px_-2px_0px_rgba(255,255,255,0.1),inset_2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-black/30'
                }`}
                disabled={cohort.data.status === 'closed'}
              >
                {/* Label */}
                <div className="text-center">
                  <div className={`mb-1 text-lg font-bold md:text-xl ${isActive ? 'text-white' : 'text-gray-900'}`}>{cohort.data.id}</div>
                  <div className={`mb-2 text-sm font-semibold md:text-base ${isActive ? 'text-white' : 'text-gray-800'}`}>{cohort.data.theme}</div>

                  {/* Status Badge */}
                  <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${badge.className}`}>{badge.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="flex h-[360px] flex-col border-x-2 border-b-2 border-white/30 bg-black/40 p-5">
          <h3 className="mb-3 text-xl font-bold text-white md:text-2xl">
            {activeCohort.data.id}: {activeCohort.data.theme}
          </h3>

          <p className="mb-3 text-lg font-semibold text-white">
            {activeCohort.data.dates.start} - {activeCohort.data.dates.end} · {activeCohort.data.location}
          </p>

          <div className="mb-6 h-[8rem] overflow-hidden border border-gray-600 bg-black/40 p-4">
            <p className="line-clamp-3 text-base leading-relaxed text-white/90">
              {activeCohort.data.description}
              {activeCohort.data.northStar && activeCohort.data.northStar.name && (
                <>
                  {' '}
                  North Star Team for {activeCohort.data.id} is{' '}
                  <a
                    href={activeCohort.data.northStar.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary text-white underline decoration-2 underline-offset-2 transition-colors"
                  >
                    {activeCohort.data.northStar.name}
                  </a>
                  {activeCohort.data.northStar.lead && <> led by {activeCohort.data.northStar.lead}</>}
                  {activeCohort.data.northStar.description && <> {activeCohort.data.northStar.description}</>}
                </>
              )}
            </p>
          </div>

          {activeCohort.data.additionalInfo && (
            <div className="mb-6 h-16 overflow-hidden border border-blue-700 bg-blue-900/20 p-4">
              <p className="line-clamp-2 text-sm font-semibold text-blue-100">{activeCohort.data.additionalInfo}</p>
            </div>
          )}

          {/* Action Button */}
          <div>
            {activeCohort.data.status === 'open' && (
              <a href={activeCohort.data.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-retro inline-block px-8 py-4">
                Apply Now
              </a>
            )}

            {activeCohort.data.status === 'closed' && (
              <div className="inline-block cursor-not-allowed bg-gray-700 px-8 py-4 text-gray-400">Applications Closed</div>
            )}

            {activeCohort.data.status === 'upcoming' && <div className="inline-block bg-yellow-700/50 px-8 py-4 text-yellow-200">Opening Soon</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineTabs;
