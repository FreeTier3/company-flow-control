
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePeopleData } from '@/hooks/usePeopleData';
import { useAssetsData } from '@/hooks/useAssetsData';
import { useLicensesData } from '@/hooks/useLicensesData';
import { ArrowLeft, User, Users, Briefcase, Award, DollarSign } from 'lucide-react';
import { Person } from '@/types';

export default function PersonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { people, loading: peopleLoading } = usePeopleData();
  const { assets, loading: assetsLoading } = useAssetsData();
  const { seats, licenses, loading: licensesLoading } = useLicensesData();

  const person = people.find(p => p.id === id);
  const personAssets = assets.filter(asset => asset.personId === id);
  const personSeats = seats.filter(seat => seat.personId === id);
  const subordinates = people.filter(p => p.reportsTo === id);
  const superior = people.find(p => p.id === person?.reportsTo);
  const team = people.find(p => p.teamId === person?.teamId);

  const totalAssetValue = personAssets.reduce((sum, asset) => sum + asset.value, 0);

  // Get license details for person's seats
  const personLicenses = personSeats.map(seat => {
    const license = licenses.find(l => l.id === seat.licenseId);
    return { seat, license };
  }).filter(item => item.license);

  if (peopleLoading || assetsLoading || licensesLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-500">Carregando detalhes...</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pessoa não encontrada</h2>
        <Button onClick={() => navigate('/people')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Pessoas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/people')}
          size="icon"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{person.name}</h1>
          <p className="text-gray-500">{person.position}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-3">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{personAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Licenças</p>
                <p className="text-2xl font-bold">{personLicenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 rounded-full p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subordinados</p>
                <p className="text-2xl font-bold">{subordinates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold">R$ {totalAssetValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{person.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cargo</label>
              <p className="text-gray-900">{person.position}</p>
            </div>
            {superior && (
              <div>
                <label className="text-sm font-medium text-gray-600">Superior</label>
                <p className="text-gray-900">{superior.name}</p>
              </div>
            )}
            {person.teamId && (
              <div>
                <label className="text-sm font-medium text-gray-600">Time</label>
                <Badge variant="secondary">{team?.name || 'Time não encontrado'}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subordinates */}
        <Card>
          <CardHeader>
            <CardTitle>Subordinados ({subordinates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {subordinates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum subordinado</p>
            ) : (
              <div className="space-y-2">
                {subordinates.map(sub => (
                  <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-gray-500">{sub.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Ativos Atribuídos ({personAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {personAssets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum ativo atribuído</p>
            ) : (
              <div className="space-y-3">
                {personAssets.map(asset => (
                  <div key={asset.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{asset.name}</h4>
                        <p className="text-sm text-gray-500">{asset.brand}</p>
                        {asset.serialNumber && (
                          <p className="text-xs text-gray-400">S/N: {asset.serialNumber}</p>
                        )}
                      </div>
                      <Badge variant="outline">R$ {asset.value.toLocaleString()}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Licenses */}
        <Card>
          <CardHeader>
            <CardTitle>Licenças Atribuídas ({personLicenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {personLicenses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma licença atribuída</p>
            ) : (
              <div className="space-y-3">
                {personLicenses.map(({ seat, license }) => (
                  <div key={seat.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{license?.name}</h4>
                        {seat.code && (
                          <p className="text-sm text-gray-500">Código: {seat.code}</p>
                        )}
                        {seat.assignedAt && (
                          <p className="text-xs text-gray-400">
                            Atribuído em: {seat.assignedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">Ativo</Badge>
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
