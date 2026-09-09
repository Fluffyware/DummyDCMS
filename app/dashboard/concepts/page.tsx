'use client';

import React from 'react';
import Concept1KeynoteDeck from '@/components/concepts/Concept1KeynoteDeck';

export default function ConceptsShowcasePage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 104px)', minHeight: '660px', display: 'flex', flexDirection: 'column' }}>
      <Concept1KeynoteDeck />
    </div>
  );
}
