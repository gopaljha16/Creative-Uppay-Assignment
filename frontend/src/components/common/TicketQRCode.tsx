import React from "react";

const TicketQRCode: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 92 }) => {
  const height = Math.round(size * (132 / 126));

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 126 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      aria-label="Ticket QR code"
      role="img"
    >
      <rect width="125.59" height="131.026" fill="url(#ticket-qr-pattern)" />
      <defs>
        <pattern id="ticket-qr-pattern" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#ticket-qr-image" transform="matrix(0.0089938 0 0 0.00862069 -0.0216402 0)" />
        </pattern>
        <image
          id="ticket-qr-image"
          width="116"
          height="116"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0AQMAAABuVIRkAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAkklEQVQ4jeWTMRLEMAgD9QP+/0t+oEjM+SYp0RVXxPGYrAsNCAy8fpFsLYeIdXZ7I2TJsSbEXNX/Y18Rj/o2/Kv/n5wePV2x5UoZnbslE5Ad/jLukSuiEDH0q4IUOmLa0sZXb8uTE7pOP7fsRpbklFLEM0jyo2/vccUzTvMoY/Y4HzsidkEpe3uiQh4/rceMX70uLuIcW43AejgAAAAASUVORK5CYII="
        />
      </defs>
    </svg>
  );
};

export default TicketQRCode;
