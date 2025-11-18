import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProfile, CompanyProfile, exportData, importData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, History, Edit, FileText, Download, Upload, Calculator } from 'lucide-react';
import { toast } from 'sonner';



export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

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
      <div className="container max-w-2xl mx-auto p-6">
        {/* Company Profile Card */}
        <Card className="p-8 mb-6 text-center shadow-medium">
          <div className="flex flex-col items-center">
            {profile.logo && (
              <img
                src={profile.logo}
                alt="Company Logo"
                className="w-32 h-32 object-contain mb-6 rounded-xl shadow-soft"
              />
            )}
            <h1 className="text-3xl font-bold mb-3">{profile.companyName}</h1>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <span className="font-medium">Email:</span> {profile.email}
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="font-medium">Contact:</span> {profile.contactNumber}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4">
          <Button
            onClick={() => navigate('/create-quotation')}
            className="h-16 text-lg bg-gradient-accent shadow-medium hover:shadow-strong transition-all"
          >
            <Plus className="w-6 h-6 mr-2" />
            Create New Quotation
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/history')}
              variant="outline"
              className="h-14"
            >
              <History className="w-5 h-5 mr-2" />
              History
            </Button>

            <Button
              onClick={() => navigate('/analytics')}
              variant="outline"
              className="h-14"
            >
              <FileText className="w-5 h-5 mr-2" />
              Analytics
            </Button>

            <Button
              onClick={() => navigate('/calculator')}
              variant="outline"
              className="h-14"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calculator
            </Button>

            <Button
              onClick={() => navigate('/edit-profile')}
              variant="secondary"
              className="h-14"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Backup & Restore Section */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-center">Backup & Restore</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Export your data to backup or import from a previous backup file
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-12"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={handleImport}
              variant="outline"
              className="h-12"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
