import React from 'react';
import { VerbList } from './VerbList';
import { usePageTitle } from '../hooks/usePageTitle';

export function ARVerbs() {
  usePageTitle('AR Verbs');
  return <VerbList categoryFilter="ar" />;
}
