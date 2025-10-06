
import React from 'react';

const TvIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M56 48H8C5.79086 48 4 46.2091 4 44V12C4 9.79086 5.79086 8 8 8H56C58.2091 8 60 9.79086 60 12V44C60 46.2091 58.2091 48 56 48Z" stroke="url(#paint0_linear_101_2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 56L40 56" stroke="url(#paint1_linear_101_2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 48V56" stroke="url(#paint2_linear_101_2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="paint0_linear_101_2" x1="4" y1="8" x2="63.5" y2="33.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E50914"/>
            <stop offset="1" stopColor="#B20710"/>
            </linearGradient>
            <linearGradient id="paint1_linear_101_2" x1="24" y1="56" x2="40.5" y2="57" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E50914"/>
            <stop offset="1" stopColor="#B20710"/>
            </linearGradient>
            <linearGradient id="paint2_linear_101_2" x1="32" y1="48" x2="33.5" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E50914"/>
            <stop offset="1" stopColor="#B20710"/>
            </linearGradient>
        </defs>
    </svg>
)

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M52 36V48C52 49.0609 51.5786 50.0783 50.8284 50.8284C50.0783 51.5786 49.0609 52 48 52H16C14.9391 52 13.9217 51.5786 13.1716 50.8284C12.4214 50.0783 12 49.0609 12 48V36" stroke="#E50914" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 26L32 34L40 26" stroke="#E50914" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 12V34" stroke="#E50914" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const WatchEverywhereIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 44V12C12 9.79086 13.7909 8 16 8H48C50.2091 8 52 9.79086 52 12V32" stroke="#E50914" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 56H44C46.2091 56 48 54.2091 48 52V40H12C7.58172 40 4 43.5817 4 48V56Z" stroke="#E50914" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const KidsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M48 52H36C33.7909 52 32 50.2091 32 48V36C32 33.7909 33.7909 32 36 32H48C50.2091 32 52 33.7909 52 36V48C52 50.2091 50.2091 52 48 52Z" fill="#E50914"/>
        <path d="M28 28H16C13.7909 28 12 26.2091 12 24V12C12 9.79086 13.7909 8 16 8H28C30.2091 8 32 9.79086 32 12V24C32 26.2091 30.2091 28 28 28Z" stroke="#E50914" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)


const features = [
    {
        icon: TvIcon,
        title: "Enjoy on your TV",
        description: "Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more."
    },
    {
        icon: DownloadIcon,
        title: "Download your shows to watch offline",
        description: "Save your favorites easily and always have something to watch."
    },
    {
        icon: WatchEverywhereIcon,
        title: "Watch everywhere",
        description: "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV."
    },
    {
        icon: KidsIcon,
        title: "Create profiles for kids",
        description: "Send kids on adventures with their favorite characters in a space made just for them—free with your membership."
    }
]

export default function FeatureGrid() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">More Reasons to Join</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="bg-[#1a1a1a] p-6 rounded-lg text-center flex flex-col items-center">
                        <feature.icon className="h-16 w-16 mb-4"/>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
