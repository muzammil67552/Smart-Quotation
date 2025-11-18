import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveCompanyProfile, CompanyProfile } from '@/lib/storage';
import { toast } from 'sonner';
import { Building2, Mail, Phone, Upload, Key } from 'lucide-react';

const VALID_REFERRAL_CODE = 'Muzammil16070';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    contactNumber: '',
    referralCode: '',
  });
  const [logo, setLogo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed');
      return;
    }

    // Validate file size (max 2MB)
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
    setLoading(true);

    // Validate all fields
    if (!formData.companyName || !formData.email || !formData.contactNumber || !logo || !formData.referralCode) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    // Validate referral code
    if (formData.referralCode !== VALID_REFERRAL_CODE) {
      toast.error('Invalid referral code');
      setLoading(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email address');
      setLoading(false);
      return;
    }

    // Save to localStorage
    const profile: CompanyProfile = {
      ...formData,
      logo,
    };

    saveCompanyProfile(profile);
    toast.success('Registration successful!');
    
    setTimeout(() => {
      navigate('/home');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Company Registration</CardTitle>
          <CardDescription className="text-sm sm:text-base">Enter your business details to get started</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  className="pl-10 w-full"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="company@example.com"
                  className="pl-10 w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactNumber"
                  placeholder="+1 234 567 8900"
                  className="pl-10 w-full"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo * (JPG/PNG, Max 2MB)</Label>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                {logo && (
                  <img src={logo} alt="Logo preview" className="w-16 h-16 object-contain rounded-lg border-2 border-border" />
                )}
                <div className="flex-1 w-full">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleLogoUpload}
                    className="cursor-pointer w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  className="pl-10 w-full"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-primary h-12" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
