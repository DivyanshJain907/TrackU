export default function CloudLoader() {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        .loader {
          --cloud-color: #4387f4;
          --arrows-color: #80b1ff;
          --time-animation: 1s;
          transform: scale(1);
        }

        .loader #cloud {
          width: 100px;
          height: 100px;
        }

        .loader #cloud rect {
          fill: var(--cloud-color);
        }

        .loader #cloud g:nth-child(3) {
          transform-origin: 50% 72.8938%;
          fill: var(--arrows-color);
          filter: drop-shadow(0 0 8px black);
          animation: rotation var(--time-animation) linear infinite;
        }

        .loader #shapes g g circle {
          animation: cloud calc(var(--time-animation) * 2) linear infinite;
        }

        .loader #shapes g g circle:nth-child(2) {
          animation-delay: calc((var(--time-animation) * 2) / -3);
        }

        .loader #shapes g g circle:nth-child(3) {
          animation-delay: calc((var(--time-animation) * 2) / -1.5);
        }

        .loader svg #lines g line {
          stroke-width: 5;
          transform-origin: 50% 50%;
          rotate: -65deg;
          animation: lines calc(var(--time-animation) / 1.33) linear infinite;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes lines {
          0% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(8px);
          }
        }

        @keyframes cloud {
          0% {
            cx: 20;
            cy: 60;
            r: 15;
          }
          50% {
            cx: 50;
            cy: 45;
            r: 20;
          }
          100% {
            cx: 80;
            cy: 60;
            r: 15;
          }
        }
      `}</style>
      <div className="loader">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g id="shapes">
            <g>
              <circle cx="20" cy="60" r="15"></circle>
            </g>
            <g>
              <circle cx="20" cy="60" r="15"></circle>
            </g>
            <g>
              <circle cx="20" cy="60" r="15"></circle>
            </g>
          </g>
          <g id="cloud">
            <rect y="40" width="100" height="40" rx="15"></rect>
            <rect x="10" y="35" width="80" height="20" rx="10"></rect>
            <g>
              <path d="M 20 50 L 30 40 L 35 50 M 35 50 L 45 40 L 50 50 M 50 50 L 60 40 L 65 50 M 65 50 L 75 40 L 80 50"></path>
            </g>
          </g>
          <g id="lines">
            <g>
              <line x1="50" y1="5" x2="50" y2="15"></line>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
