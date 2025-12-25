import React from 'react';

const BuildSitesHeader = ({ title, highlight, description }) => {
  return (
    <div className="w-full bg-background py-16 px-6 pt-28">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-foreground tracking-tight leading-[0.9] mb-6">
          {title}{' '}
          <span className="text-gradient-primary">
            {highlight}
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default BuildSitesHeader;