import React from 'react';
import { Spotlight } from '@/components/ui/spotlight-new';

export const Home = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-black/[0.96] relative overflow-hidden">
      {/* Spotlight Background */}
      <Spotlight  />

      {/* Foreground Text */}
      <div className="p-4 max-w-7xl mx-auto relative z-10 w-full text-center">
        <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Spotlight <br /> which is not overused.
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg mx-auto">
          A subtle yet effective spotlight effect, because the previous version
          is used a bit too much these days.
        </p>
      </div>
    </div>
  );
};
