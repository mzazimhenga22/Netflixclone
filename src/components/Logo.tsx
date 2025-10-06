import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 110 30"
    width="110"
    height="30"
    role="img"
    aria-label="StreamClone Logo"
    {...props}
  >
    <title>StreamClone</title>
    <text
      x="0"
      y="24"
      fontFamily="'Bebas Neue', sans-serif"
      fontSize="30"
      fontWeight="400"
      fill="hsl(var(--primary))"
      letterSpacing="0.5"
    >
      STREAMCLONE
    </text>
  </svg>
);

export default Logo;
