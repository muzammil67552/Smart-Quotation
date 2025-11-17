import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface CalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalculatorDialog({ open, onOpenChange }: CalculatorDialogProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleButtonClick = (value: string) => {
    // Handle AC (Clear)
    if (value === 'AC') {
      setDisplay('0');
      setPrevValue(null);
      setOperation(null);
      setNewNumber(true);
      return;
    }

    // Handle percentage
    if (value === '%') {
      setDisplay((parseFloat(display) / 100).toString());
      return;
    }

    // Handle +/- toggle
    if (value === '±') {
      setDisplay((parseFloat(display) * -1).toString());
      return;
    }

    // Handle decimal point
    if (value === '.') {
      if (!display.includes('.')) {
        setDisplay(display + '.');
        setNewNumber(false);
      }
      return;
    }

    // Handle operations
    if (['+', '−', '×', '÷'].includes(value)) {
      setPrevValue(display);
      setOperation(value);
      setNewNumber(true);
      return;
    }

    // Handle equals
    if (value === '=') {
      if (prevValue && operation) {
        const prev = parseFloat(prevValue);
        const current = parseFloat(display);
        let result = 0;

        switch (operation) {
          case '+':
            result = prev + current;
            break;
          case '−':
            result = prev - current;
            break;
          case '×':
            result = prev * current;
            break;
          case '÷':
            result = prev / current;
            break;
        }

        setDisplay(result.toString());
        setPrevValue(null);
        setOperation(null);
        setNewNumber(true);
      }
      return;
    }

    // Handle number input
    if (newNumber) {
      setDisplay(value);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? value : display + value);
    }
  };

  const buttons = [
    ['AC', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Calculator</DialogTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div
            className={`rounded-3xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-900 to-slate-800'
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}
            style={{
              boxShadow:
                theme === 'dark'
                  ? '0 20px 60px rgba(0, 0, 0, 0.3)'
                  : '0 20px 60px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Display */}
            <div
              className={`mb-6 p-6 rounded-2xl text-right ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}
              style={{
                boxShadow:
                  theme === 'dark'
                    ? 'inset 5px 5px 10px rgba(0, 0, 0, 0.5), inset -5px -5px 10px rgba(255, 255, 255, 0.05)'
                    : 'inset 5px 5px 10px rgba(0, 0, 0, 0.05), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="text-4xl font-light overflow-hidden text-ellipsis break-all">
                {display}
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="space-y-3">
              {buttons.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-3">
                  {row.map((btn) => {
                    const isOperation = ['÷', '×', '−', '+', '='].includes(btn);
                    const isSpecial = ['AC', '±', '%'].includes(btn);
                    const isZero = btn === '0';

                    return (
                      <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className={`
                          h-14 rounded-2xl font-medium text-lg transition-all active:scale-95
                          ${isZero ? 'col-span-2' : ''}
                          ${
                            theme === 'dark'
                              ? isOperation
                                ? 'bg-orange-500 text-white'
                                : isSpecial
                                ? 'bg-slate-700 text-white'
                                : 'bg-slate-800 text-white'
                              : isOperation
                              ? 'bg-orange-500 text-white'
                              : isSpecial
                              ? 'bg-gray-300 text-slate-800'
                              : 'bg-gray-200 text-slate-800'
                          }
                        `}
                        style={{
                          boxShadow:
                            theme === 'dark'
                              ? isOperation
                                ? '5px 5px 15px rgba(0, 0, 0, 0.4), -5px -5px 15px rgba(255, 255, 255, 0.05)'
                                : '5px 5px 15px rgba(0, 0, 0, 0.5), -5px -5px 15px rgba(255, 255, 255, 0.08)'
                              : isOperation
                              ? '5px 5px 15px rgba(0, 0, 0, 0.15), -5px -5px 15px rgba(255, 255, 255, 0.9)'
                              : '5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 1)',
                        }}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
