import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProfile, CompanyProfile } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, History, Edit, FileText } from 'lucide-react';

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
          </div>

          <Button
            onClick={() => navigate('/edit-profile')}
            variant="secondary"
            className="h-12"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Company Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
