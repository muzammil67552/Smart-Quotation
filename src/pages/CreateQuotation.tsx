import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { saveQuotation, generateQuotationNumber, getCompanyProfile, Quotation, QuotationItem } from '@/lib/storage';
import { generatePDF, shareQuotation } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { Plus, Trash2, Save, FileDown, ArrowLeft, Calculator as CalcIcon, Share2 } from 'lucide-react';
import { CalculatorDialog } from '@/components/CalculatorDialog';

export default function CreateQuotation() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([
    { id: '1', description: '', quantity: 0, unitPrice: 0, total: 0 },
  ]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState('Payment due within 30 days. Late payments subject to fees.');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [lastGeneratedPDF, setLastGeneratedPDF] = useState<{ blob: Blob; fileName: string } | null>(null);

  const calculateItemTotal = (quantity: number, unitPrice: number) => quantity * unitPrice;

  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.total, 0);

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = (subtotal * taxPercent) / 100;
    const discount = (subtotal * discountPercent) / 100;
    return subtotal + tax - discount;
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = calculateItemTotal(updated.quantity, updated.unitPrice);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    const newId = (Math.max(...items.map(i => parseInt(i.id)))+ 1).toString();
    setItems([...items, { id: newId, description: '', quantity: 0, unitPrice: 0, total: 0 }]);
  };

  const deleteItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast.error('At least one item is required');
    }
  };

  const handleSave = () => {
    if (!clientName || !clientContact || !clientEmail) {
      toast.error('Please fill all client details');
      return;
    }

    if (items.some(item => !item.description)) {
      toast.error('Please fill all item descriptions');
      return;
    }

    const quotation: Quotation = {
      id: Date.now().toString(),
      quotationNumber: generateQuotationNumber(),
      clientName,
      clientContact,
      clientEmail,
      date: new Date().toISOString(),
      items,
      subtotal: calculateSubtotal(),
      taxPercent,
      discountPercent,
      grandTotal: calculateGrandTotal(),
      termsAndConditions,
    };

    saveQuotation(quotation);
    toast.success('Quotation saved successfully!');
    navigate('/history');
  };

  const handleGeneratePDF = async () => {
    if (!clientName || !clientContact || !clientEmail) {
      toast.error('Please fill all client details');
      return;
    }

    const companyProfile = getCompanyProfile();
    if (!companyProfile) {
      toast.error('Company profile not found');
      return;
    }

    const quotation: Quotation = {
      id: Date.now().toString(),
      quotationNumber: generateQuotationNumber(),
      clientName,
      clientContact,
      clientEmail,
      date: new Date().toISOString(),
      items,
      subtotal: calculateSubtotal(),
      taxPercent,
      discountPercent,
      grandTotal: calculateGrandTotal(),
      termsAndConditions,
    };

    // Save to history automatically
    saveQuotation(quotation);

    const pdf = generatePDF(quotation, companyProfile);
    const fileName = `Quotation-${quotation.quotationNumber}.pdf`;
    
    // Convert PDF to Blob
    const pdfBlob = pdf.output('blob');
    
    // Store the PDF blob for later sharing
    setLastGeneratedPDF({ blob: pdfBlob, fileName });
    
    // Save the PDF file
    pdf.save(fileName);
    toast.success('PDF generated and saved to history!');
    
    // Automatically trigger share dialog
    try {
      await shareQuotation(pdfBlob, fileName);
    } catch (error: any) {
      // Only show error if it's not a user cancellation
      if (error.message !== 'Share cancelled') {
        console.error('Share error:', error);
        // Don't show error toast for unsupported browsers, just silently fail
        if (!error.message.includes('not supported')) {
          toast.error('Failed to share PDF: ' + error.message);
        }
      }
    }
  };

  const handleSharePDF = async () => {
    if (!lastGeneratedPDF) {
      toast.error('Please generate the PDF first');
      return;
    }

    try {
      await shareQuotation(lastGeneratedPDF.blob, lastGeneratedPDF.fileName);
    } catch (error: any) {
      if (error.message !== 'Share cancelled') {
        console.error('Share error:', error);
        if (error.message.includes('not supported')) {
          toast.error('Web Share API is not supported in this browser. Please use a mobile device or compatible browser.');
        } else {
          toast.error('Failed to share PDF: ' + error.message);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-4xl mx-auto p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Create Quotation</h1>
        </div>

        {/* Client Details */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Client Name *</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="muzammil" className="w-full" />
              </div>
              <div>
                <Label>Contact *</Label>
                <Input value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="+1 234 567 8900" className="w-full" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="muzammil@example.com" type="email" className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="mb-6 shadow-soft">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl">Quotation Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={() => setCalculatorOpen(true)} size="sm" variant="outline" className="w-full sm:w-auto">
                <CalcIcon className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Calculator</span>
                <span className="xs:hidden">Calculator</span>
              </Button>
              <Button onClick={addItem} size="sm" className="bg-gradient-primary w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Add Item</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total</Label>
                      <div className="h-10 flex items-center font-bold text-primary">PKR {item.total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tax %</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Discount %</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">PKR {calculateSubtotal().toFixed(2)}</span>
              </div>
              {taxPercent > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({taxPercent}%):</span>
                  <span>PKR {((calculateSubtotal() * taxPercent) / 100).toFixed(2)}</span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-PKR {((calculateSubtotal() * discountPercent) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg sm:text-xl font-bold pt-2 border-t">
                <span>Grand Total:</span>
                <span className="text-primary">PKR {calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label>Terms & Conditions</Label>
              <Textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                rows={3}
                placeholder="Enter terms and conditions..."
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button onClick={handleSave} className="h-12 bg-gradient-primary w-full">
            <Save className="w-5 h-5 mr-2" />
            <span className="hidden xs:inline">Save Quotation</span>
            <span className="xs:hidden">Save</span>
          </Button>
          <Button onClick={handleGeneratePDF} variant="outline" className="h-12 w-full">
            <FileDown className="w-5 h-5 mr-2" />
            <span className="hidden xs:inline">Generate PDF</span>
            <span className="xs:hidden">PDF</span>
          </Button>
          <Button
            onClick={handleSharePDF}
            variant="outline"
            className="h-12 w-full"
            disabled={!lastGeneratedPDF}
          >
            <Share2 className="w-5 h-5 mr-2" />
            <span className="hidden xs:inline">Share PDF</span>
            <span className="xs:hidden">Share</span>
          </Button>
        </div>
      </div>

      <CalculatorDialog open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </div>
  );
}
