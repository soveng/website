import React from 'react';

const Button = ({
  label,
  link,
  style,
  rel,
}: {
  label: string;
  link: string;
  style?: string;
  rel?: string;
}) => {
  return (
    <a
      href={link}
      target="_blank"
      rel={`noopener noreferrer ${rel ? (rel === 'follow' ? '' : rel) : 'nofollow'}`}
      className={`btn me-4 mb-4 hover:text-white hover:no-underline dark:hover:text-black ${
        style === 'outline' ? 'btn-outline-primary' : 'btn-primary'
      }`}
    >
      {label}
    </a>
  );
};

export default Button;
