import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { saveQuotation, generateQuotationNumber, getCompanyProfile, Quotation, QuotationItem } from '@/lib/storage';
import { generatePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { Plus, Trash2, Save, FileDown, ArrowLeft, Calculator as CalcIcon } from 'lucide-react';
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
    const newId = (Math.max(...items.map(i => parseInt(i.id))) + 1).toString();
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

  const handleGeneratePDF = () => {
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
    pdf.save(`Quotation-${quotation.quotationNumber}.pdf`);
    toast.success('PDF generated and saved to history!');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Create Quotation</h1>
        </div>

        {/* Client Details */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Client Name *</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <Label>Contact *</Label>
                <Input value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" type="email" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="mb-6 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle>Quotation Items</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setCalculatorOpen(true)} size="sm" variant="outline">
                <CalcIcon className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Button onClick={addItem} size="sm" className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
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
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total</Label>
                      <div className="h-10 flex items-center font-bold text-primary">${item.total.toFixed(2)}</div>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Tax %</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
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
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              {taxPercent > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({taxPercent}%):</span>
                  <span>${((calculateSubtotal() * taxPercent) / 100).toFixed(2)}</span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-${((calculateSubtotal() * discountPercent) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Grand Total:</span>
                <span className="text-primary">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label>Terms & Conditions</Label>
              <Textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                rows={3}
                placeholder="Enter terms and conditions..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={handleSave} className="h-12 bg-gradient-primary">
            <Save className="w-5 h-5 mr-2" />
            Save Quotation
          </Button>
          <Button onClick={handleGeneratePDF} variant="outline" className="h-12">
            <FileDown className="w-5 h-5 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <CalculatorDialog open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </div>
  );
}
