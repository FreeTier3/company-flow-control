
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAssetsData } from '@/hooks/useAssetsData';
import { usePeopleData } from '@/hooks/usePeopleData';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { Laptop, Plus, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AssetsPage() {
  const { assets, loading: assetsLoading, refreshData } = useAssetsData();
  const { people, loading: peopleLoading } = usePeopleData();
  const { currentOrganization } = useCurrentOrganization();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    brand: '',
    value: '',
    personId: '',
  });

  const loading = assetsLoading || peopleLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.value || !currentOrganization) {
      toast({
        title: "Erro",
        description: "Nome, marca, valor são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const assetData = {
        name: formData.name,
        serial_number: formData.serialNumber || null,
        brand: formData.brand,
        value: parseFloat(formData.value),
        organization_id: currentOrganization.id,
        person_id: formData.personId || null,
        assigned_at: formData.personId ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('assets')
        .insert(assetData);

      if (error) throw error;

      setFormData({
        name: '',
        serialNumber: '',
        brand: '',
        value: '',
        personId: '',
      });
      setIsDialogOpen(false);
      refreshData();
      
      toast({
        title: "Sucesso",
        description: "Ativo adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar ativo",
        variant: "destructive",
      });
    }
  };

  const getPersonName = (id: string) => {
    const person = people.find(p => p.id === id);
    return person ? person.name : 'N/A';
  };

  const handleAssignAsset = async (assetId: string, personId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({
          person_id: personId,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', assetId);

      if (error) throw error;

      refreshData();
      toast({
        title: "Sucesso",
        description: "Ativo atribuído com sucesso",
      });
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast({
        title: "Erro",
        description: "Falha ao atribuir ativo",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Ativos</h1>
          <p className="text-gray-500 mt-2">Carregando ativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Ativos</h1>
          <p className="text-gray-500 mt-2">Controle equipamentos e bens da empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ativo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Ativo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Notebook Dell, Monitor Samsung"
                />
              </div>
              
              <div>
                <Label htmlFor="serialNumber">Número de Série</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Número de série (opcional)"
                />
              </div>
              
              <div>
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Ex: Dell, Apple, Samsung"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="person">Atribuir para</Label>
                <Select value={formData.personId} onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} - {person.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Adicionar</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset, index) => (
          <Card key={asset.id} className="corporate-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-purple-500 rounded-full p-2">
                  <Laptop className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{asset.name}</h3>
                  <p className="text-sm text-gray-500 font-normal">{asset.brand}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Valor:</span>
                  <p className="text-sm font-semibold text-green-600">R$ {asset.value.toLocaleString()}</p>
                </div>
                
                {asset.serialNumber && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Serial:</span>
                    <p className="text-sm font-mono">{asset.serialNumber}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  {asset.personId ? (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        Atribuído para {getPersonName(asset.personId)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-orange-600">Disponível</span>
                      <Select onValueChange={(personId) => handleAssignAsset(asset.id, personId)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Atribuir" />
                        </SelectTrigger>
                        <SelectContent>
                          {people.map(person => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assets.length === 0 && (
        <Card className="corporate-card">
          <CardContent className="text-center py-12">
            <Laptop className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ativo cadastrado</h3>
            <p className="text-gray-500 mb-4">Comece adicionando equipamentos e bens da empresa</p>
            <Button onClick={() => setIsDialogOpen(true)} className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Ativo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
