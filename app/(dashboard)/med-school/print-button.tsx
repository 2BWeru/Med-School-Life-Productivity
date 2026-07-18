'use client';

import { Button } from '@/components/ui/button';

export function PrintButton() {
  return (
    <Button
      variant="outline"
      className="border-white/30 bg-white/15 text-white hover:bg-white/25"
      onClick={() => window.print()}
    >
      🖨️ Print / save as PDF
    </Button>
  );
}
