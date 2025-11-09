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
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">Apply To SEC</h2>
        <p className="mt-2 font-mono text-sm text-white/70">2026</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex flex-col">
        {/* Tab Headers Row */}
        <div className="mb-0 flex gap-2">
          {sortedCohorts.map((cohort, index) => {
            const badge = getStatusBadge(cohort.data.status);
            const isActive = index === activeIndex;

            return (
              <button
                key={cohort.data.id}
                onClick={() => setActiveIndex(index)}
                className={`flex-1 rounded-t-lg p-4 transition-all duration-300 ${
                  isActive ? 'border-2 border-b-0 border-white/20 bg-black/30' : 'border-2 border-transparent bg-transparent hover:bg-black/10'
                }`}
                disabled={cohort.data.status === 'closed'}
              >
                {/* Dot */}
                <div
                  className={`mx-auto mb-3 h-6 w-6 rounded-full border-4 transition-all ${
                    isActive
                      ? 'scale-125 border-white bg-white'
                      : cohort.data.status === 'open'
                        ? 'border-green-500 bg-green-500'
                        : cohort.data.status === 'closed'
                          ? 'border-gray-500 bg-gray-500'
                          : 'border-yellow-500 bg-yellow-500'
                  }`}
                ></div>

                {/* Label */}
                <div className="text-center">
                  <div className={`mb-1 text-sm font-bold md:text-base ${isActive ? 'text-white' : 'text-gray-300'}`}>{cohort.data.id}</div>
                  <div className={`mb-2 text-sm font-semibold md:text-base ${isActive ? 'text-white' : 'text-gray-200'}`}>{cohort.data.theme}</div>

                  {/* Status Badge */}
                  <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${badge.className}`}>{badge.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="rounded-b-lg border-2 border-t-0 border-white/20 bg-black/30 p-6 shadow-lg">
          <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            {activeCohort.data.id}: {activeCohort.data.theme}
          </h3>

          <p className="mb-4 text-lg font-semibold text-white">
            {activeCohort.data.dates.start} - {activeCohort.data.dates.end} · {activeCohort.data.location}
          </p>

          <p className="mb-6 text-lg leading-relaxed text-white/90">{activeCohort.data.description}</p>

          {activeCohort.data.northStar && (
            <div className="mb-6 rounded border border-gray-600 bg-black/40 p-5">
              <p className="mb-3 text-lg font-bold text-white">North Star Team</p>
              <p className="text-lg leading-relaxed text-white/90">
                <a
                  href={activeCohort.data.northStar.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary text-white underline decoration-2 underline-offset-2 transition-colors"
                >
                  {activeCohort.data.northStar.name}
                </a>
                {activeCohort.data.northStar.lead && <span> led by {activeCohort.data.northStar.lead}</span>} {activeCohort.data.northStar.description}
              </p>
            </div>
          )}

          {activeCohort.data.additionalInfo && (
            <div className="mb-6 rounded border border-blue-700 bg-blue-900/20 p-4">
              <p className="text-sm text-blue-200">{activeCohort.data.additionalInfo}</p>
            </div>
          )}

          {/* Action Button */}
          {activeCohort.data.status === 'open' && (
            <a href={activeCohort.data.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-retro inline-block px-8 py-4">
              Apply Now!
            </a>
          )}

          {activeCohort.data.status === 'closed' && (
            <div className="inline-block cursor-not-allowed rounded bg-gray-700 px-8 py-4 text-gray-400">Applications Closed</div>
          )}

          {activeCohort.data.status === 'upcoming' && (
            <div className="inline-block rounded bg-yellow-700/50 px-8 py-4 text-yellow-200">Applications Opening Soon</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineTabs;
