
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePeopleData } from '@/hooks/usePeopleData';
import { useTeamsData } from '@/hooks/useTeamsData';
import { useAssetsData } from '@/hooks/useAssetsData';
import { useLicensesData } from '@/hooks/useLicensesData';
import { Users, User, Laptop, File, Database, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { people, loading: peopleLoading } = usePeopleData();
  const { teams, loading: teamsLoading } = useTeamsData();
  const { assets, loading: assetsLoading } = useAssetsData();
  const { licenses, seats, loading: licensesLoading } = useLicensesData();

  const loading = peopleLoading || teamsLoading || assetsLoading || licensesLoading;

  // Calculate dashboard stats
  const totalPeople = people.length;
  const totalTeams = teams.length;
  const totalAssets = assets.length;
  const totalLicenses = licenses.length;
  const availableSeats = seats.filter(seat => !seat.personId).length;
  const assignedAssets = assets.filter(asset => asset.personId).length;

  const statCards = [
    {
      title: 'Total de Pessoas',
      value: totalPeople,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Times',
      value: totalTeams,
      icon: User,
      color: 'bg-green-500',
    },
    {
      title: 'Ativos',
      value: totalAssets,
      icon: Laptop,
      color: 'bg-purple-500',
    },
    {
      title: 'Licenças',
      value: totalLicenses,
      icon: File,
      color: 'bg-orange-500',
    },
    {
      title: 'Seats Disponíveis',
      value: availableSeats,
      icon: Database,
      color: 'bg-cyan-500',
    },
    {
      title: 'Ativos Atribuídos',
      value: assignedAssets,
      icon: Calendar,
      color: 'bg-pink-500',
    },
  ];

  const recentPeople = people.slice(-5);
  const recentAssets = assets.slice(-5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Carregando dados da organização...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Visão geral da sua organização</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className="corporate-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent People */}
        <Card className="corporate-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Pessoas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPeople.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma pessoa cadastrada</p>
            ) : (
              <div className="space-y-3">
                {recentPeople.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="bg-primary rounded-full p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-500">{person.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card className="corporate-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              Ativos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum ativo cadastrado</p>
            ) : (
              <div className="space-y-3">
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="bg-purple-500 rounded-full p-2">
                      <Laptop className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.brand} - R$ {asset.value.toLocaleString()}</p>
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
