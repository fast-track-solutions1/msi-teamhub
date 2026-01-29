'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, Send } from 'lucide-react';
import { getSalaries } from '@/lib/salarie-api';
import { getDemandes, createDemande as createDemandeAPI, validerDemande, rejeterDemande, deleteDemande, DemandeConge } from '@/lib/demande-conge-api';

interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  responsable_direct?: number | null;
  responsable_service?: string;
}

interface FormDataType {
  salarie: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nombre_jours?: number;
  motif: string;
}

export default function DemandesCongésPage() {
  const [tab, setTab] = useState('creation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [salarieError, setSalarieError] = useState<string | null>(null);

  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    salarie: '',
    type_conge: 'maladie',
    date_debut: '',
    date_fin: '',
    motif: '',
  });
  const [selectedSalarie, setSelectedSalarie] = useState<Salarie | null>(null);
  const [demandes, setDemandes] = useState<DemandeConge[]>([]);
  const [demandeActive, setDemandeActive] = useState<DemandeConge | null>(null);

  useEffect(() => {
    loadSalaries();
    loadDemandes();
  }, []);

  const loadSalaries = async () => {
    try {
      setSalarieError(null);
      const results = await getSalaries();
      setSalaries(results);
      console.log(`✅ ${results.length} salariés chargés`);
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setSalarieError(`Erreur: ${err.message}`);
    }
  };

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const data = await getDemandes();
      setDemandes(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemande = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.salarie || !formData.date_debut || !formData.date_fin) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const newDemande = await createDemandeAPI({
        salarie: parseInt(formData.salarie),
        type_conge: formData.type_conge,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        nombre_jours: 0,
        motif: formData.motif,
      });

      setDemandes([newDemande, ...demandes]);
      setSuccess('Demande créée !');
      setFormData({
        salarie: '',
        type_conge: 'maladie',
        date_debut: '',
        date_fin: '',
        motif: '',
      });
      setTab('historique');
    } catch (err: any) {
      setError(err.message || 'Erreur création');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderDemande = async (demandeId: number) => {
    try {
      setLoading(true);
      const data = await validerDemande(demandeId);
      setSuccess('Demande validée !');
      loadDemandes();
    } catch (err: any) {
      setError(err.message || 'Erreur validation');
    } finally {
      setLoading(false);
    }
  };

  const handleSalarieChange = (salarieId: string) => {
    setFormData({ ...formData, salarie: salarieId });
    const salarie = salaries.find((s) => s.id === parseInt(salarieId));
    setSelectedSalarie(salarie || null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Demandes de Congé</h1>
        <p className="text-gray-500 mt-2">Créez et suivez vos demandes</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {salarieError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{salarieError}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="creation">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande
          </TabsTrigger>
          <TabsTrigger value="historique">
            <CheckCircle className="w-4 h-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creation">
          <Card>
            <CardHeader>
              <CardTitle>Créer une nouvelle demande</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDemande} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="salarie">Salarié *</Label>
                  <select
                    id="salarie"
                    value={formData.salarie}
                    onChange={(e) => handleSalarieChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {salaries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom} {s.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_conge">Type de congé *</Label>
                  <select
                    id="type_conge"
                    value={formData.type_conge}
                    onChange={(e) => setFormData({ ...formData, type_conge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="maladie">Maladie</option>
                    <option value="conge_paye">Congé normal</option>
                    <option value="maternite">Maternité</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_debut">Date début *</Label>
                    <Input
                      id="date_debut"
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_fin">Date fin *</Label>
                    <Input
                      id="date_fin"
                      type="date"
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motif">Motif</Label>
                  <textarea
                    id="motif"
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Création...' : 'Créer la demande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique">
          <Card>
            <CardHeader>
              <CardTitle>Historique des demandes</CardTitle>
            </CardHeader>
            <CardContent>
              {demandes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune demande</p>
              ) : (
                <div className="space-y-4">
                  {demandes.map((demande) => (
                    <Card key={demande.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{demande.salarie_nom} {demande.salarie_prenom}</p>
                              <p className="text-sm text-gray-600">{demande.type_conge_display}</p>
                            </div>
                            <Badge>{demande.statut_display}</Badge>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>Début: {formatDate(demande.date_debut)}</div>
                            <div>Fin: {formatDate(demande.date_fin)}</div>
                            <div>Jours: {demande.nombre_jours || '-'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
