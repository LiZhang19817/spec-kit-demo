/**
 * Red Hat Logo Component
 * Official Red Hat fedora hat logo with brand colors
 */

export interface RedHatLogoProps {
  /** Width of the logo */
  width?: number;

  /** Height of the logo */
  height?: number;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Red Hat fedora hat logo SVG
 */
export default function RedHatLogo({ width = 40, height = 40, className = '' }: RedHatLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 613 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Hat logo"
    >
      <path
        fill="#EE0000"
        d="M614 230.6c0 72.7-53.2 133.5-123.6 145.2-4.2.8-8.5 1.5-12.8 2.1-36.9 5.3-74.8 7.2-113.2 7.2-38.4 0-76.3-1.9-113.2-7.2-4.3-.6-8.6-1.3-12.8-2.1C167.2 364.1 114 303.3 114 230.6c0-47.9 27.6-89.4 67.7-109.5 5.5-2.8 11.2-5.2 17-7.2 0 0 39.8-12.4 84.3-12.4s84.3 12.4 84.3 12.4c5.8 2 11.5 4.4 17 7.2 40.1 20.1 67.7 61.6 67.7 109.5z"
      />
      <path
        fill="#000000"
        d="M614 230.6c0-24.2-7.7-46.5-20.7-64.7-2.1-2.9-4.4-5.7-6.8-8.4-15.3-17.1-35.7-30.2-58.7-37.6-5.5-1.8-11.2-3.2-17-4.4 0 0-39.8-12.4-84.3-12.4s-84.3 12.4-84.3 12.4c-5.8 1.2-11.5 2.6-17 4.4-23 7.4-43.4 20.5-58.7 37.6-2.4 2.7-4.7 5.5-6.8 8.4-13 18.2-20.7 40.5-20.7 64.7 0 47.9 27.6 89.4 67.7 109.5 5.5 2.8 11.2 5.2 17 7.2 0 0 39.8 12.4 84.3 12.4s84.3-12.4 84.3-12.4c5.8-2 11.5-4.4 17-7.2 40.1-20.1 67.7-61.6 67.7-109.5zm-164.5 88.8c-18.2 0-33.3-6.5-45.3-19.5-12-13-18-28.8-18-47.4 0-18.6 6-34.4 18-47.4 12-13 27.1-19.5 45.3-19.5s33.3 6.5 45.3 19.5c12 13 18 28.8 18 47.4 0 18.6-6 34.4-18 47.4-12 13-27.1 19.5-45.3 19.5z"
      />
      <circle fill="#FFFFFF" cx="449.5" cy="252.5" r="45" />
    </svg>
  );
}
