
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className="w-16 h-16 text-primary"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          .spinner_z9k8 {
            transform-origin: center;
            animation: spinner_StKS 1.2s linear infinite;
          }
          .spinner_V8m1 {
            stroke-dasharray: 120;
            stroke-dashoffset: 120;
            animation: spinner_Min3 1.2s ease-in-out infinite;
          }
          @keyframes spinner_StKS {
            100% { transform: rotate(360deg); }
          }
          @keyframes spinner_Min3 {
            0% { stroke-dashoffset: 120; }
            50% { stroke-dashoffset: 0; transform: rotate(135deg); }
            100% { stroke-dashoffset: 120; transform: rotate(450deg); }
          }
        `}</style>
        <g className="spinner_z9k8">
          <circle
            className="spinner_V8m1"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
