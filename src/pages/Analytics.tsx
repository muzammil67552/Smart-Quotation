import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getQuotationHistory } from '@/lib/storage';
import { ArrowLeft, FileText, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalRevenue: 0,
    avgQuotationValue: 0,
    topClients: [] as { name: string; count: number; total: number }[],
    recentActivity: [] as any[],
  });

  useEffect(() => {
    const quotations = getQuotationHistory();
    
    const totalQuotations = quotations.length;
    const totalRevenue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);
    const avgQuotationValue = totalQuotations > 0 ? totalRevenue / totalQuotations : 0;

    // Calculate top clients
    const clientMap = new Map<string, { count: number; total: number }>();
    quotations.forEach(q => {
      const existing = clientMap.get(q.clientName) || { count: 0, total: 0 };
      clientMap.set(q.clientName, {
        count: existing.count + 1,
        total: existing.total + q.grandTotal,
      });
    });

    const topClients = Array.from(clientMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Recent activity (last 5)
    const recentActivity = quotations.slice(0, 5);

    setStats({
      totalQuotations,
      totalRevenue,
      avgQuotationValue,
      topClients,
      recentActivity,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Quotations</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalQuotations}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold mt-1">PKR {stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Quotation</p>
                  <p className="text-3xl font-bold mt-1">PKR {stats.avgQuotationValue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Clients */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topClients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available yet</p>
            ) : (
              <div className="space-y-4">
                {stats.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.count} quotations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">PKR {client.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((quotation) => (
                  <div key={quotation.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{quotation.quotationNumber}</p>
                      <p className="text-sm text-muted-foreground">{quotation.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">PKR {quotation.grandTotal.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quotation.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
