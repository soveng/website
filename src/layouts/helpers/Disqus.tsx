import { DiscussionEmbed } from 'disqus-react';
import React from 'react';

import config from '@/config/config.json';

const Disqus = ({ className }: { className?: string }) => {
  const { disqus } = config;
  return <div className={className}>{disqus.enable && <DiscussionEmbed shortname={disqus.shortname} config={disqus.settings} />}</div>;
};

export default Disqus;
