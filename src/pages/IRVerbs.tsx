import React from 'react';
import { VerbList } from './VerbList';
import { usePageTitle } from '../hooks/usePageTitle';

export function IRVerbs() {
  usePageTitle('IR Verbs');
  return <VerbList categoryFilter="ir" />;
}
