import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "sonner";
import { Trash2, X, Loader2, Save, MapPin } from 'lucide-react';

type PropertyStatus = "À Venda" | "Em Obras" | "Entregue";

export const Route = createFileRoute('/admin/projects')({
  component: AdminProjects,
});

function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', area: '', status: 'À Venda' as PropertyStatus, description: '', image_url: '', video_url: '',
    is_facilita: false, lotes_totais: 0, lotes_disponiveis: 0,
    progresso_agua: 0, progresso_saneamento: 0, progresso_pavimentacao: 0, progresso_energia: 0
  });

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProjects(data);
    } catch (error: any) {
      toast.error("Erro ao carregar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: string) {
    if (!window.confirm("Deseja excluir este empreendimento?")) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) {
      toast.success("Removido com sucesso!");
      fetchProjects();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload: any = { ...formData };

    try {
      if (isEditing) {
        const { error } = await supabase.from('properties').update(payload).eq('id', isEditing);
        if (error) throw error;
        toast.success("Empreendimento atualizado!");
      } else {
        const { error } = await supabase.from('properties').insert([payload]);
        if (error) throw error;
        toast.success("Novo projeto publicado!");
      }

      setIsEditing(null);
      setFormData({ 
        title: '', area: '', status: 'À Venda', description: '', image_url: '', video_url: '',
        is_facilita: false, lotes_totais: 0, lotes_disponiveis: 0,
        progresso_agua: 0, progresso_saneamento: 0, progresso_pavimentacao: 0, progresso_energia: 0
      });
      fetchProjects();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 font-sans p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-[#123AAA] uppercase italic tracking-tighter">
          Engenharia e Ativos <span className="text-[#FFD700] not-italic">Universal</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] shadow-2xl border sticky top-5 space-y-5">
            <h2 className="font-black text-[#123AAA] uppercase italic flex justify-between items-center mb-4">
              {isEditing ? 'Editar Ativo' : 'Novo Loteamento'}
              {isEditing && <X className="cursor-pointer text-red-500 hover:scale-110 transition-all" onClick={() => {setIsEditing(null); setFormData({ title: '', area: '', status: 'À Venda', description: '', image_url: '', video_url: '', is_facilita: false, lotes_totais: 0, lotes_disponiveis: 0, progresso_agua: 0, progresso_saneamento: 0, progresso_pavimentacao: 0, progresso_energia: 0});}} />}
            </h2>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">Título do Projeto</label>
              <input required placeholder="Ex: Vista do Universo" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 ring-[#FFD700]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">Estágio da Obra</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as PropertyStatus})}
                  className="w-full p-4 rounded-2xl bg-[#123AAA] border-none font-black text-[#FFD700] uppercase tracking-widest outline-none cursor-pointer"
                >
                  <option value="À Venda">PRÉ-LANÇAMENTO</option>
                  <option value="Em Obras">EM OBRAS</option>
                  <option value="Entregue">ENTREGUE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">Localização</label>
                <input required placeholder="Cariacica - ES" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">História / Descrição Comercial</label>
              <textarea 
                rows={3}
                placeholder="Escreva a descrição que aparecerá na página do empreendimento..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full p-4 rounded-2xl bg-gray-50 border-none font-medium outline-none focus:ring-2 ring-[#FFD700] resize-none text-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">Total de Lotes</label>
                <input type="number" required placeholder="0" value={formData.lotes_totais} onChange={e => setFormData({...formData, lotes_totais: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-black text-lg outline-none text-[#123AAA]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#FFD700] ml-2">Disponíveis</label>
                <input type="number" required placeholder="0" value={formData.lotes_disponiveis} onChange={e => setFormData({...formData, lotes_disponiveis: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-black text-lg outline-none text-[#FFD700]" />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2 block mb-3">Progresso da Engenharia (%)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center bg-gray-50 rounded-xl p-2 px-3">
                  <span className="text-[9px] font-bold uppercase text-gray-400 w-16">Água</span>
                  <input type="number" min="0" max="100" value={formData.progresso_agua} onChange={e => setFormData({...formData, progresso_agua: Number(e.target.value)})} className="w-full bg-transparent border-none outline-none font-bold text-right text-[#123AAA]" />
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl p-2 px-3">
                  <span className="text-[9px] font-bold uppercase text-gray-400 w-16">Esgoto</span>
                  <input type="number" min="0" max="100" value={formData.progresso_saneamento} onChange={e => setFormData({...formData, progresso_saneamento: Number(e.target.value)})} className="w-full bg-transparent border-none outline-none font-bold text-right text-[#123AAA]" />
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl p-2 px-3">
                  <span className="text-[9px] font-bold uppercase text-gray-400 w-16">Asfalto</span>
                  <input type="number" min="0" max="100" value={formData.progresso_pavimentacao} onChange={e => setFormData({...formData, progresso_pavimentacao: Number(e.target.value)})} className="w-full bg-transparent border-none outline-none font-bold text-right text-[#123AAA]" />
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl p-2 px-3">
                  <span className="text-[9px] font-bold uppercase text-gray-400 w-16">Energia</span>
                  <input type="number" min="0" max="100" value={formData.progresso_energia} onChange={e => setFormData({...formData, progresso_energia: Number(e.target.value)})} className="w-full bg-transparent border-none outline-none font-bold text-right text-[#123AAA]" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">Link do Vídeo no YouTube (Opcional)</label>
                <input placeholder="https://www.youtube.com/watch?v=..." value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none text-xs outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#123AAA] ml-2">URL da Imagem Principal</label>
                <input required placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none text-xs outline-none" />
              </div>
            </div>
            
            <button type="submit" disabled={submitting} className="w-full py-5 bg-[#123AAA] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all cursor-pointer border-none flex justify-center items-center gap-2 hover:bg-blue-900 mt-6">
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={16} /> Salvar Ativo</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#123AAA]" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-[0.2em] bg-[#123AAA] px-2 py-1 rounded-md">
                        {p.status === 'À Venda' ? 'PRÉ-LANÇAMENTO' : p.status}
                      </span>
                      <h3 className="font-black text-[#123AAA] text-xl uppercase italic tracking-tighter mt-2">{p.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase mb-2">
                    <MapPin size={12} className="text-[#123AAA]" /> {p.area}
                  </div>

                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 italic">
                    {p.description ? `"${p.description}"` : "Sem descrição."}
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 mb-6 bg-gray-50 p-2 rounded-xl">
                    <span>Lotes: <span className="text-[#123AAA]">{p.lotes_totais}</span></span>
                    <span>Disp: <span className="text-[#FFD700]">{p.lotes_disponiveis}</span></span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => { setIsEditing(p.id); setFormData({...p, status: p.status as PropertyStatus, description: p.description || '', video_url: p.video_url || ''}); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 py-4 bg-[#123AAA] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-800 transition-all cursor-pointer border-none">
                      Gerir Dados
                    </button>
                    <button onClick={() => deleteProject(p.id)} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer border-none">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}