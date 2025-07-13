import React, { useEffect } from 'react';

const Youtube = ({ id, title, ...rest }: { id: string; title: string; [key: string]: unknown }) => {
  useEffect(() => {
    import('@justinribeiro/lite-youtube');
  }, []);

  // @ts-expect-error - lite-youtube is a custom element
  return <lite-youtube videoid={id} videotitle={title} {...rest} />;
};

export default Youtube;
