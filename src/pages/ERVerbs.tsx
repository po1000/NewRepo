import React from 'react';
import { VerbList } from './VerbList';
import { usePageTitle } from '../hooks/usePageTitle';

export function ERVerbs() {
  usePageTitle('ER Verbs');
  return <VerbList categoryFilter="er" />;
}
