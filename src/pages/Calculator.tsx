import { useState } from 'react';
import { CalculatorDialog } from '@/components/CalculatorDialog';

export default function Calculator() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-6">
        <CalculatorDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>
    </div>
  );
}