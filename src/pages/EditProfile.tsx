import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCompanyProfile, saveCompanyProfile, CompanyProfile } from '@/lib/storage';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyProfile | null>(null);
  const [logo, setLogo] = useState<string>('');

  useEffect(() => {
    const profile = getCompanyProfile();
    if (profile) {
      setFormData(profile);
      setLogo(profile.logo);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;

    const updatedProfile: CompanyProfile = {
      ...formData,
      logo,
    };

    saveCompanyProfile(updatedProfile);
    toast.success('Profile updated successfully!');
    navigate('/home');
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Company Profile</h1>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  {logo && (
                    <img src={logo} alt="Logo" className="w-24 h-24 object-contain rounded-lg border-2 border-border" />
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Contact Number</Label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-primary">
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
