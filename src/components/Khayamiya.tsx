import { useId } from 'react';

/** Khayamiya band: the appliqué tent-fabric pattern of Cairo's tentmakers, used as a divider. */
export default function Khayamiya({ className = '' }: { className?: string }) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={`box-content block h-8 w-full border-y-3 border-espresso ${className}`}
    >
      <defs>
        <pattern id={id} width="40" height="32" patternUnits="userSpaceOnUse">
          <rect width="40" height="32" className="fill-cream" />
          <path d="M0 0h40L20 9zM0 32h40L20 23z" className="fill-koshary" />
          <path
            d="M0 0h10L0 9zM40 0H30l10 9zM0 32h10L0 23zM40 32H30l10-9z"
            className="fill-wood"
          />
          <path
            d="M20 9l9 7-9 7-9-7z"
            className="fill-brass-light stroke-espresso"
            strokeWidth="1.2"
          />
          <path d="M20 13l4 3-4 3-4-3z" className="fill-mint" />
          <circle cy="16" r="3" className="fill-fatla stroke-espresso" />
          <circle
            cx="40"
            cy="16"
            r="3"
            className="fill-fatla stroke-espresso"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
