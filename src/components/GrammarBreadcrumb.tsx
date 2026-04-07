import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface GrammarBreadcrumbProps {
  crumbs: Crumb[];
}

export function GrammarBreadcrumb({ crumbs }: GrammarBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 mb-4 flex-wrap">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="font-inter font-medium text-[14px] leading-[36px] text-white/80 hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-inter font-semibold text-[14px] leading-[36px] text-white">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
