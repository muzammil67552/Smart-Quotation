import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProfile, CompanyProfile, exportData, importData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, History, Edit, FileText, Download, Upload, Calculator as CalcIcon,} from 'lucide-react';
import { CalculatorDialog } from '@/components/CalculatorDialog';
import { toast } from 'sonner';



export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  useEffect(() => {
    const savedProfile = getCompanyProfile();
    if (!savedProfile) {    
      navigate('/');
    } else {
      setProfile(savedProfile);
    }
  }, [navigate]);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotation-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const success = importData(jsonString);
          if (success) {
            toast.success('Data imported successfully!');
            window.location.reload(); // Reload to show imported data
          } else {
            toast.error('Failed to import data');
          }
        } catch (error) {
          toast.error('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto p-3 sm:p-6">
        {/* Company Profile Card */}
        <Card className="p-4 sm:p-8 mb-6 text-center shadow-medium">
          <div className="flex flex-col items-center">
            {profile.logo && (
              <img
                src={profile.logo}
                alt="Company Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-4 sm:mb-6 rounded-xl shadow-soft"
              />
            )}
            <h1 className="text-xl sm:text-3xl font-bold mb-3">{profile.companyName}</h1>
            <div className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-medium">Email:</span> {profile.email}
              </p>
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-medium">Contact:</span> {profile.contactNumber}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-3 sm:gap-4">
          <Button
            onClick={() => navigate('/create-quotation')}
            className="h-12 sm:h-16 text-base sm:text-lg bg-gradient-accent shadow-medium hover:shadow-strong transition-all w-full"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            <span className="hidden xs:inline">Create New Quotation</span>
            <span className="xs:hidden">Create Quotation</span>
          </Button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              onClick={() => navigate('/history')}
              variant="outline"
              className="h-12 sm:h-14 w-full"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">History</span>
              <span className="xs:hidden">History</span>
            </Button>

            <Button
              onClick={() => navigate('/analytics')}
              variant="outline"
              className="h-12 sm:h-14 w-full"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Analytics</span>
            </Button>

            <Button
              onClick={() => setCalculatorOpen(true)}
              variant="outline"
              className="h-12 sm:h-14 w-full"
            >
              <CalcIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">Calculator</span>
              <span className="xs:hidden">Calculator</span>
            </Button>

            <Button
              onClick={() => navigate('/edit-profile')}
              variant="secondary"
              className="h-12 sm:h-14 w-full"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">Edit Profile</span>
              <span className="xs:hidden">Edit</span>
            </Button>
          </div>
        </div>

        {/* Backup & Restore Section */}
        <Card className="p-4 sm:p-6 mt-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Backup & Restore</h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 px-2">
            Export your data to backup or import from a previous backup file
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-10 sm:h-12 w-full"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">Export Data</span>
              <span className="xs:hidden">Export</span>
            </Button>
            <Button
              onClick={handleImport}
              variant="outline"
              className="h-10 sm:h-12 w-full"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">Import Data</span>
              <span className="xs:hidden">Import</span>
            </Button>
          </div>
        </Card>
      </div>

      <CalculatorDialog open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </div>
  );
}
