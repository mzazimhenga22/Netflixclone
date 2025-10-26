import React from "react";

const TvIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M56 48H8C5.8 48 4 46.2 4 44V12C4 9.8 5.8 8 8 8H56C58.2 8 60 9.8 60 12V44C60 46.2 58.2 48 56 48Z"
      stroke="url(#tvGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 56H40"
      stroke="url(#tvGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 48V56"
      stroke="url(#tvGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="tvGrad" x1="4" y1="8" x2="64" y2="56">
        <stop stopColor="#E50914" />
        <stop offset="1" stopColor="#FF3366" />
      </linearGradient>
    </defs>
  </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M52 36V48C52 49.1 51.6 50.1 50.8 50.8C50.1 51.6 49.1 52 48 52H16C14.9 52 13.9 51.6 13.2 50.8C12.4 50.1 12 49.1 12 48V36"
      stroke="url(#downGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 26L32 34L40 26"
      stroke="url(#downGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 12V34"
      stroke="url(#downGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="downGrad" x1="12" y1="12" x2="52" y2="52">
        <stop stopColor="#E50914" />
        <stop offset="1" stopColor="#FF3366" />
      </linearGradient>
    </defs>
  </svg>
);

const WatchEverywhereIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 44V12C12 9.8 13.8 8 16 8H48C50.2 8 52 9.8 52 12V32"
      stroke="url(#watchGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 56H44C46.2 56 48 54.2 48 52V40H12C7.6 40 4 43.6 4 48V56Z"
      stroke="url(#watchGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="watchGrad" x1="4" y1="8" x2="60" y2="56">
        <stop stopColor="#E50914" />
        <stop offset="1" stopColor="#FF3366" />
      </linearGradient>
    </defs>
  </svg>
);

const KidsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M48 52H36C33.8 52 32 50.2 32 48V36C32 33.8 33.8 32 36 32H48C50.2 32 52 33.8 52 36V48C52 50.2 50.2 52 48 52Z"
      fill="url(#kidsGrad)"
    />
    <path
      d="M28 28H16C13.8 28 12 26.2 12 24V12C12 9.8 13.8 8 16 8H28C30.2 8 32 9.8 32 12V24C32 26.2 30.2 28 28 28Z"
      stroke="url(#kidsGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="kidsGrad" x1="12" y1="8" x2="52" y2="52">
        <stop stopColor="#E50914" />
        <stop offset="1" stopColor="#FF3366" />
      </linearGradient>
    </defs>
  </svg>
);

const features = [
  {
    icon: TvIcon,
    title: "Enjoy on your TV",
    description:
      "Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.",
  },
  {
    icon: DownloadIcon,
    title: "Download your shows to watch offline",
    description:
      "Save your favorites easily and always have something to watch.",
  },
  {
    icon: WatchEverywhereIcon,
    title: "Watch everywhere",
    description:
      "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.",
  },
  {
    icon: KidsIcon,
    title: "Create profiles for kids",
    description:
      "Send kids on adventures with their favorite characters in a space made just for them — free with your membership.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
          More Reasons to Join
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-8 text-center shadow-[0_0_20px_rgba(229,9,20,0.2)] hover:shadow-[0_0_40px_rgba(229,9,20,0.3)] transition-all duration-300"
            >
              <feature.icon className="h-16 w-16 mx-auto mb-4 drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
