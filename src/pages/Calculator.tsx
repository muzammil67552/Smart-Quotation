import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Calculator = () => {
  const navigate = useNavigate();
  const [darkDisplay, setDarkDisplay] = useState('0');
  const [lightDisplay, setLightDisplay] = useState('0');
  const [darkPrevValue, setDarkPrevValue] = useState<string | null>(null);
  const [lightPrevValue, setLightPrevValue] = useState<string | null>(null);
  const [darkOperation, setDarkOperation] = useState<string | null>(null);
  const [lightOperation, setLightOperation] = useState<string | null>(null);
  const [darkNewNumber, setDarkNewNumber] = useState(true);
  const [lightNewNumber, setLightNewNumber] = useState(true);

  const handleButtonClick = (value: string, theme: 'dark' | 'light') => {
    const display = theme === 'dark' ? darkDisplay : lightDisplay;
    const setDisplay = theme === 'dark' ? setDarkDisplay : setLightDisplay;
    const prevValue = theme === 'dark' ? darkPrevValue : lightPrevValue;
    const setPrevValue = theme === 'dark' ? setDarkPrevValue : setLightPrevValue;
    const operation = theme === 'dark' ? darkOperation : lightOperation;
    const setOperation = theme === 'dark' ? setDarkOperation : setLightOperation;
    const newNumber = theme === 'dark' ? darkNewNumber : lightNewNumber;
    const setNewNumber = theme === 'dark' ? setDarkNewNumber : setLightNewNumber;

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

  const CalcTheme = ({ theme, display }: { theme: 'dark' | 'light'; display: string }) => (
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
        <div className="text-5xl font-light overflow-hidden text-ellipsis">{display}</div>
      </div>

      {/* Buttons Grid */}
      <div className="space-y-4">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4">
            {row.map((btn) => {
              const isOperation = ['÷', '×', '−', '+', '='].includes(btn);
              const isSpecial = ['AC', '±', '%'].includes(btn);
              const isZero = btn === '0';

              return (
                <button
                  key={btn}
                  onClick={() => handleButtonClick(btn, theme)}
                  className={`
                    h-16 rounded-2xl font-medium text-xl transition-all active:scale-95
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20 px-4 pt-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Calculator</h1>
        <p className="text-muted-foreground">iPhone-style calculator with dual themes</p>
      </div>

      {/* Calculators Side by Side */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Dark Theme</h2>
          <CalcTheme theme="dark" display={darkDisplay} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Light Theme</h2>
          <CalcTheme theme="light" display={lightDisplay} />
        </div>
      </div>
    </div>
  );
};

export default Calculator;
