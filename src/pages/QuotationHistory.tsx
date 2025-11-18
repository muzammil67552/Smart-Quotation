import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getQuotationHistory, deleteQuotation, getCompanyProfile, Quotation } from '@/lib/storage';
import { generatePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { ArrowLeft, Search, FileDown, Share2, Copy, Trash2, Eye } from 'lucide-react';

export default function QuotationHistory() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = () => {
    let history = getQuotationHistory();
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        history = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        history = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        history = history.sort((a, b) => b.grandTotal - a.grandTotal);
        break;
      case 'lowest':
        history = history.sort((a, b) => a.grandTotal - b.grandTotal);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      history = history.filter(q =>
        q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setQuotations(history);
  };

  useEffect(() => {
    loadQuotations();
  }, [searchQuery, sortBy]);

  const handleDownloadPDF = (quotation: Quotation) => {
    const companyProfile = getCompanyProfile();
    if (!companyProfile) {
      toast.error('Company profile not found');
      return;
    }

    const pdf = generatePDF(quotation, companyProfile);
    pdf.save(`Quotation-${quotation.quotationNumber}.pdf`);
    toast.success('PDF downloaded!');
  };

  const handleShare = async (quotation: Quotation) => {
    const companyProfile = getCompanyProfile();
    if (!companyProfile) return;

    const pdf = generatePDF(quotation, companyProfile);
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], `Quotation-${quotation.quotationNumber}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Quotation ${quotation.quotationNumber}`,
          text: `Quotation for ${quotation.clientName}`,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast.error('Sharing not supported on this device');
    }
  };

  const handleDuplicate = (quotation: Quotation) => {
    // Navigate to create page with pre-filled data
    navigate('/create-quotation', { state: { duplicate: quotation } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(id);
      loadQuotations();
      toast.success('Quotation deleted');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-6xl mx-auto p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Quotation History</h1>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name, quotation number, or email..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  onClick={() => setSortBy('newest')}
                  size="sm"
                  className="flex-1 sm:flex-none min-w-0"
                >
                  <span className="hidden xs:inline">Newest</span>
                  <span className="xs:hidden">New</span>
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'default' : 'outline'}
                  onClick={() => setSortBy('oldest')}
                  size="sm"
                  className="flex-1 sm:flex-none min-w-0"
                >
                  <span className="hidden xs:inline">Oldest</span>
                  <span className="xs:hidden">Old</span>
                </Button>
                <Button
                  variant={sortBy === 'highest' ? 'default' : 'outline'}
                  onClick={() => setSortBy('highest')}
                  size="sm"
                  className="flex-1 sm:flex-none min-w-0"
                >
                  <span className="hidden xs:inline">Highest</span>
                  <span className="xs:hidden">High</span>
                </Button>
                <Button
                  variant={sortBy === 'lowest' ? 'default' : 'outline'}
                  onClick={() => setSortBy('lowest')}
                  size="sm"
                  className="flex-1 sm:flex-none min-w-0"
                >
                  <span className="hidden xs:inline">Lowest</span>
                  <span className="xs:hidden">Low</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotations List */}
        {quotations.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 sm:p-12 text-center">
              <p className="text-muted-foreground text-base sm:text-lg">No quotations found</p>
              <Button onClick={() => navigate('/create-quotation')} className="mt-4 bg-gradient-primary">
                Create Your First Quotation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {quotations.map((quotation) => (
              <Card key={quotation.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold truncate">{quotation.clientName}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{quotation.quotationNumber}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg sm:text-2xl font-bold text-primary">PKR {quotation.grandTotal.toFixed(2)}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(quotation.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        <p className="truncate">Email: {quotation.clientEmail}</p>
                        <p>Contact: {quotation.clientContact}</p>
                        <p>Items: {quotation.items.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPDF(quotation)}
                      className="flex-1 sm:flex-none min-w-0"
                    >
                      <FileDown className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Download</span>
                      <span className="xs:hidden">DL</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(quotation)}
                      className="flex-1 sm:flex-none min-w-0"
                    >
                      <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Share</span>
                      <span className="xs:hidden">SH</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(quotation)}
                      className="flex-1 sm:flex-none min-w-0"
                    >
                      <Copy className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Duplicate</span>
                      <span className="xs:hidden">CP</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(quotation.id)}
                      className="text-destructive hover:bg-destructive/10 flex-1 sm:flex-none min-w-0"
                    >
                      <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Delete</span>
                      <span className="xs:hidden">DEL</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
