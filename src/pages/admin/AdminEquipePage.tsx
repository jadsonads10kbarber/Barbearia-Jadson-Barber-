import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Phone,
  Star,
  X,
  Check,
  Shield,
  Upload,
  Camera,
  DollarSign,
  MessageSquare,
  Building2,
  CreditCard,
  Mail,
  MapPin,
  Briefcase,
  Percent,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX,
  Calendar,
  FileText,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Barber, Review, Appointment } from '../../types';

export const AdminEquipePage: React.FC = () => {
  const {
    barbers,
    addBarber,
    updateBarber,
    deleteBarber,
    appointments,
    reviews,
    sales,
    addToast
  } = useApp();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);

  const [reviewModalBarber, setReviewModalBarber] = useState<Barber | null>(null);
  const [financialModalBarber, setFinancialModalBarber] = useState<Barber | null>(null);
  const [deleteConfirmBarber, setDeleteConfirmBarber] = useState<Barber | null>(null);

  // Registration / Editing Form State (All optional as requested)
  const [name, setName] = useState('');
  const [role, setRole] = useState('Barbeiro Especialista');
  const [photo, setPhoto] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [email, setEmail] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [address, setAddress] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('Degradê, Barboterapia, Visagismo');
  const [serviceCommission, setServiceCommission] = useState<string>('50');
  const [salesCommission, setSalesCommission] = useState<string>('10');
  const [salary, setSalary] = useState<string>('2500');
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('20:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'available' | 'busy' | 'off'>('available');
  const [active, setActive] = useState<boolean>(true);
  const [employmentStatus, setEmploymentStatus] = useState<'Admitido' | 'Demitido'>('Admitido');

  // Handle Photo File Upload from Device
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('A imagem deve ter no máximo 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        addToast('Foto recarregada do dispositivo com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingBarber(null);
    setName('');
    setRole('Barbeiro Especialista');
    setPhoto('https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=500&auto=format&fit=crop&q=80');
    setCpf('');
    setCnpj('');
    setPixKey('');
    setEmail('');
    setPhone1('(11) 99999-0000');
    setPhone2('');
    setAddress('');
    setSpecialtiesText('Degradê, Barboterapia, Visagismo');
    setServiceCommission('50');
    setSalesCommission('10');
    setSalary('2500');
    setWorkStart('08:00');
    setWorkEnd('20:00');
    setLunchStart('12:00');
    setLunchEnd('13:00');
    setNotes('');
    setStatus('available');
    setActive(true);
    setEmploymentStatus('Admitido');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Barber) => {
    setEditingBarber(b);
    setName(b.name || '');
    setRole(b.role || 'Barbeiro');
    setPhoto(b.photo || 'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=500&auto=format&fit=crop&q=80');
    setCpf(b.cpf || '');
    setCnpj(b.cnpj || '');
    setPixKey(b.pixKey || '');
    setEmail(b.email || '');
    setPhone1(b.phone1 || b.phone || '');
    setPhone2(b.phone2 || '');
    setAddress(b.address || '');
    setSpecialtiesText(b.specialties ? b.specialties.join(', ') : '');
    setServiceCommission(b.serviceCommission !== undefined ? String(b.serviceCommission) : '50');
    setSalesCommission(b.salesCommission !== undefined ? String(b.salesCommission) : '10');
    setSalary(b.salary !== undefined ? String(b.salary) : '2500');
    setWorkStart(b.workingHours?.start || '08:00');
    setWorkEnd(b.workingHours?.end || '20:00');
    setLunchStart(b.lunchBreak?.start || '12:00');
    setLunchEnd(b.lunchBreak?.end || '13:00');
    setNotes(b.notes || '');
    setStatus(b.status || 'available');
    setActive(b.active !== false);
    setEmploymentStatus(b.employmentStatus || 'Admitido');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const barberPayload: Partial<Barber> = {
      name: name.trim() || 'Barbeiro Sem Nome',
      role: role.trim() || 'Barbeiro Especialista',
      photo: photo.trim() || 'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=500&auto=format&fit=crop&q=80',
      phone: phone1.trim(),
      phone1: phone1.trim(),
      phone2: phone2.trim(),
      cpf: cpf.trim(),
      cnpj: cnpj.trim(),
      pixKey: pixKey.trim(),
      email: email.trim(),
      address: address.trim(),
      specialties,
      serviceCommission: parseFloat(serviceCommission) || 0,
      salesCommission: parseFloat(salesCommission) || 0,
      salary: parseFloat(salary) || 0,
      rating: editingBarber ? editingBarber.rating : 5.0,
      reviewsCount: editingBarber ? editingBarber.reviewsCount : 0,
      status,
      active,
      employmentStatus,
      workingHours: { start: workStart, end: workEnd },
      lunchBreak: { start: lunchStart, end: lunchEnd },
      workingDays: editingBarber?.workingDays || [0, 1, 2, 3, 4, 5, 6],
      notes: notes.trim(),
    };

    if (editingBarber) {
      await updateBarber(editingBarber.id, barberPayload);
    } else {
      await addBarber(barberPayload as Omit<Barber, 'id'>);
    }

    setIsModalOpen(false);
  };

  // Quick Action: Toggle Ativado / Desativado
  const handleToggleActive = async (b: Barber) => {
    const newActiveState = !(b.active !== false);
    await updateBarber(b.id, { active: newActiveState });
    addToast(
      `Barbeiro ${b.name} ${newActiveState ? 'ativado' : 'desativado'} com sucesso.`,
      newActiveState ? 'success' : 'info'
    );
  };

  // Quick Action: Toggle Admitir / Demitir
  const handleToggleEmployment = async (b: Barber) => {
    const newEmployment = b.employmentStatus === 'Demitido' ? 'Admitido' : 'Demitido';
    await updateBarber(b.id, { employmentStatus: newEmployment });
    addToast(
      `Status do barbeiro ${b.name} alterado para: ${newEmployment}`,
      newEmployment === 'Admitido' ? 'success' : 'error'
    );
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (deleteConfirmBarber) {
      await deleteBarber(deleteConfirmBarber.id);
      setDeleteConfirmBarber(null);
    }
  };

  // Helper calculation for barber finance
  const getBarberFinancialData = (b: Barber) => {
    const completedAppts = appointments.filter(
      (a) => (a.barberId === b.id || a.barberName === b.name) && a.status === 'Concluído'
    );
    const serviceRevenue = completedAppts.reduce((acc, a) => acc + (a.totalPrice || 0), 0);
    const servComm = ((b.serviceCommission || 0) * serviceRevenue) / 100;

    const barberSales = sales ? sales.filter((s) => (s as any).barberId === b.id) : [];
    const salesRevenue = barberSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const salesComm = ((b.salesCommission || 0) * salesRevenue) / 100;

    const baseSalary = b.salary || 0;
    const totalEarnings = baseSalary + servComm + salesComm;

    return {
      completedAppts,
      serviceRevenue,
      servComm,
      barberSales,
      salesRevenue,
      salesComm,
      baseSalary,
      totalEarnings,
    };
  };

  // Helper for barber reviews
  const getBarberReviewsData = (b: Barber) => {
    const barberReviews = reviews.filter(
      (r) => r.barberId === b.id || (r.barberName && r.barberName.toLowerCase() === b.name.toLowerCase())
    );
    const avgScore =
      barberReviews.length > 0
        ? (barberReviews.reduce((acc, r) => acc + r.rating, 0) / barberReviews.length).toFixed(1)
        : b.rating || 5.0;

    return {
      barberReviews,
      avgScore,
      count: barberReviews.length,
    };
  };

  return (
    <AdminLayout
      title="Gestão da Equipe de Barbeiros"
      subtitle="Cadastre novos profissionais com dados completos, comissões, financeiro e avaliações"
    >
      {/* Header Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111111] p-5 rounded-3xl border border-neutral-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#DAA520]" />
            <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider">
              Equipe de Profissionais ({barbers.length})
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            Gerencie o cadastro, comissões de serviço e vendas, expediente, admitidos e demitidos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-3 px-5 rounded-2xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Barbeiro</span>
        </button>
      </div>

      {/* Grid of Barbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {barbers.map((b) => {
          const isAtivo = b.active !== false;
          const isAdmitido = b.employmentStatus !== 'Demitido';
          const reviewsInfo = getBarberReviewsData(b);
          const finInfo = getBarberFinancialData(b);

          return (
            <div
              key={b.id}
              className={`bg-[#111111] border rounded-3xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between shadow-lg relative ${
                !isAtivo || !isAdmitido
                  ? 'border-red-950/60 opacity-80 bg-red-950/10'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Top Header Card */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={b.photo || 'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=500&auto=format&fit=crop&q=80'}
                      alt={b.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                        isAtivo && isAdmitido ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      title={isAtivo && isAdmitido ? 'Ativo na Plataforma' : 'Inativo / Demitido'}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-base text-white truncate font-sans">{b.name}</h3>
                    </div>

                    <p className="text-xs text-amber-400 font-mono font-bold truncate">
                      {b.role || 'Barbeiro Especialista'}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {/* Ativado/Desativado Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          isAtivo
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {isAtivo ? 'Ativado' : 'Desativado'}
                      </span>

                      {/* Admitido/Demitido Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          isAdmitido
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isAdmitido ? 'Admitido' : 'Demitido'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Summary Box */}
                <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 space-y-2 text-xs font-mono">
                  {/* Phone & Email */}
                  {(b.phone1 || b.phone || b.email) && (
                    <div className="space-y-1 text-neutral-300 pb-2 border-b border-neutral-800/80">
                      {(b.phone1 || b.phone) && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-500" /> Tel 1:
                          </span>
                          <span className="text-white font-bold">{b.phone1 || b.phone}</span>
                        </div>
                      )}
                      {b.phone2 && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-500" /> Tel 2:
                          </span>
                          <span className="text-white">{b.phone2}</span>
                        </div>
                      )}
                      {b.email && (
                        <div className="flex items-center justify-between truncate">
                          <span className="text-neutral-500 flex items-center gap-1 shrink-0">
                            <Mail className="w-3 h-3 text-amber-500" /> Email:
                          </span>
                          <span className="text-neutral-300 truncate">{b.email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document & Finance Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
                    <div>
                      <span className="text-neutral-500 block">Com. Serviço:</span>
                      <span className="text-amber-400 font-bold">{b.serviceCommission ?? 50}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Com. Vendas:</span>
                      <span className="text-amber-400 font-bold">{b.salesCommission ?? 10}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Salário Base:</span>
                      <span className="text-emerald-400 font-bold">
                        R$ {(b.salary ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Horário Almoço:</span>
                      <span className="text-white font-bold">
                        {b.lunchBreak?.start || '12:00'} - {b.lunchBreak?.end || '13:00'}
                      </span>
                    </div>
                  </div>

                  {/* Extra Documents if available */}
                  {(b.cpf || b.cnpj || b.pixKey) && (
                    <div className="pt-2 border-t border-neutral-800/80 space-y-1 text-[11px] text-neutral-400">
                      {b.cpf && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">CPF:</span>
                          <span className="text-neutral-200">{b.cpf}</span>
                        </div>
                      )}
                      {b.cnpj && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">CNPJ:</span>
                          <span className="text-neutral-200">{b.cnpj}</span>
                        </div>
                      )}
                      {b.pixKey && (
                        <div className="flex justify-between truncate">
                          <span className="text-neutral-500 shrink-0">Pix:</span>
                          <span className="text-amber-300 font-mono truncate">{b.pixKey}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {b.specialties && b.specialties.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                      Especialidades:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {b.specialties.map((sp) => (
                        <span
                          key={sp}
                          className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions & Extra Tabs */}
              <div className="pt-3 border-t border-neutral-800 space-y-2.5">
                {/* Secondary buttons for Avaliações and Financeiro */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReviewModalBarber(b)}
                    className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Avaliações ({reviewsInfo.count})</span>
                  </button>

                  <button
                    onClick={() => setFinancialModalBarber(b)}
                    className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Financeiro</span>
                  </button>
                </div>

                {/* Primary Action Buttons Requested: Ativado/Desativado, Editar, Admitir/Demitir, Excluir */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-neutral-800/60">
                  {/* Ativado / Desativado Toggle */}
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isAtivo
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                    }`}
                    title={isAtivo ? 'Clique para Desativar' : 'Clique para Ativar'}
                  >
                    {isAtivo ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-red-400" />}
                    <span className="hidden sm:inline text-[10px]">{isAtivo ? 'Ativo' : 'Desat.'}</span>
                  </button>

                  {/* Admitir / Demitir Toggle */}
                  <button
                    onClick={() => handleToggleEmployment(b)}
                    className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isAdmitido
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                    title={isAdmitido ? 'Clique para Demitir' : 'Clique para Admitir'}
                  >
                    {isAdmitido ? <UserCheck className="w-4 h-4 text-blue-400" /> : <UserX className="w-4 h-4 text-amber-400" />}
                    <span className="hidden sm:inline text-[10px]">{isAdmitido ? 'Admitido' : 'Demitido'}</span>
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 rounded-xl bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                    title="Editar Cadastro do Barbeiro"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => setDeleteConfirmBarber(b)}
                    className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                    title="Excluir Barbeiro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CADASTRO / EDIÇÃO MODAL WITH ALL OPTIONAL FIELDS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-5 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-mono font-bold uppercase text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#DAA520]" />
                  {editingBarber ? 'Editar Barbeiro' : 'Cadastro de Barbeiro'}
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Preencha os dados cadastrais (todos os campos são opcionais).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: FOTO & IDENTIFICAÇÃO */}
              <div className="p-4 bg-black/50 border border-neutral-800 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-[#DAA520] flex items-center gap-2">
                  <Camera className="w-4 h-4" /> 1. Foto do Perfil & Identificação
                </span>

                {/* Upload Foto do Dispositivo / URL */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={
                        photo ||
                        'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=500&auto=format&fit=crop&q=80'
                      }
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                    />
                    <label
                      htmlFor="photo-device-input"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity cursor-pointer text-amber-400 font-mono text-[10px] font-bold"
                    >
                      Alterar
                    </label>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="photo-device-input"
                        className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Carregar Foto do Dispositivo</span>
                      </label>
                      <input
                        id="photo-device-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">
                        Ou cole a URL da Foto
                      </label>
                      <input
                        type="url"
                        value={photo}
                        onChange={(e) => setPhoto(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao.barbeiro@email.com"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>

                {/* CPF, CNPJ, PIX */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Chave Pix
                    </label>
                    <input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="CPF / Email / Chave aleatória"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTATOS & ENDEREÇO */}
              <div className="p-4 bg-black/50 border border-neutral-800 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-[#DAA520] flex items-center gap-2">
                  <Phone className="w-4 h-4" /> 2. Contatos & Endereço
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Whatsapp / Telefone 1
                    </label>
                    <input
                      type="tel"
                      value={phone1}
                      onChange={(e) => setPhone1(e.target.value)}
                      placeholder="(11) 99999-1111"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Whatsapp / Telefone 2
                    </label>
                    <input
                      type="tel"
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                      placeholder="(11) 98888-2222"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro, Cidade - Estado"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* SECTION 3: ESPECIALIDADES, SALÁRIO E COMISSÕES */}
              <div className="p-4 bg-black/50 border border-neutral-800 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-[#DAA520] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> 3. Especialidade, Salário & Comissões
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Cargo / Título
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Ex: Master Barber, Barbeiro Sênior"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Especialidade(s)
                    </label>
                    <input
                      type="text"
                      value={specialtiesText}
                      onChange={(e) => setSpecialtiesText(e.target.value)}
                      placeholder="Degradê, Barba, Visagismo, Colorimetria"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Salário Base (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="2500.00"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Comissão Serviço (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={serviceCommission}
                      onChange={(e) => setServiceCommission(e.target.value)}
                      placeholder="50"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Comissão Vendas (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={salesCommission}
                      onChange={(e) => setSalesCommission(e.target.value)}
                      placeholder="10"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: HORÁRIO DE TRABALHO & ALMOÇO */}
              <div className="p-4 bg-black/50 border border-neutral-800 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-[#DAA520] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 4. Horários de Expediente & Almoço
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Início Trabalho</label>
                    <input
                      type="time"
                      value={workStart}
                      onChange={(e) => setWorkStart(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Fim Trabalho</label>
                    <input
                      type="time"
                      value={workEnd}
                      onChange={(e) => setWorkEnd(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-amber-400">Início Almoço</label>
                    <input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-amber-400">Fim Almoço</label>
                    <input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: STATUS, ADMISSÃO E OBSERVAÇÕES */}
              <div className="p-4 bg-black/50 border border-neutral-800 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-[#DAA520] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> 5. Status, Contratação & Observação
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Status de Atendimento
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    >
                      <option value="available">Disponível</option>
                      <option value="busy">Em Atendimento</option>
                      <option value="off">Ausente/Folga</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Ativado / Desativado
                    </label>
                    <select
                      value={active ? 'true' : 'false'}
                      onChange={(e) => setActive(e.target.value === 'true')}
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    >
                      <option value="true">Ativado (Ativo na barbearia)</option>
                      <option value="false">Desativado (Inativo)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Vínculo Trabalhista
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value as any)}
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    >
                      <option value="Admitido">Admitido</option>
                      <option value="Demitido">Demitido</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                    Campo de Observação / Anotações Internas
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações sobre acordos, preferências, uniforme, turnos ou histórico profissional..."
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-xl cursor-pointer"
              >
                {editingBarber ? 'Salvar Alterações do Barbeiro' : 'Cadastrar Barbeiro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AVALIAÇÕES DO BARBEIRO */}
      {reviewModalBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={reviewModalBarber.photo}
                  alt={reviewModalBarber.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                />
                <div>
                  <h3 className="text-base font-mono font-bold text-white uppercase">
                    Avaliações - {reviewModalBarber.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Média: {getBarberReviewsData(reviewModalBarber).avgScore} / 5.0</span>
                    <span className="text-neutral-500">
                      ({getBarberReviewsData(reviewModalBarber).count} avaliações)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setReviewModalBarber(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Reviews */}
            <div className="space-y-3">
              {getBarberReviewsData(reviewModalBarber).barberReviews.length === 0 ? (
                <div className="p-8 text-center bg-black/40 border border-neutral-800 rounded-2xl text-neutral-400 font-mono text-xs">
                  Nenhuma avaliação registrada ainda para este profissional.
                </div>
              ) : (
                getBarberReviewsData(reviewModalBarber).barberReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-black/60 border border-neutral-800 rounded-2xl space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {rev.authorName || rev.customerName || 'Cliente Anônimo'}
                      </span>
                      <span className="text-neutral-500 text-[11px]">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-amber-400 font-bold">{rev.rating}.0</span>
                    </div>

                    {rev.serviceName && (
                      <p className="text-neutral-400 text-[11px]">Serviço: {rev.serviceName}</p>
                    )}

                    <p className="text-neutral-300 font-sans italic text-sm pt-1">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FINANCEIRO DO BARBEIRO */}
      {financialModalBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={financialModalBarber.photo}
                  alt={financialModalBarber.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                />
                <div>
                  <h3 className="text-base font-mono font-bold text-white uppercase flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Financeiro - {financialModalBarber.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Demonstrativo de comissões e apuração de pagamentos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFinancialModalBarber(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const finData = getBarberFinancialData(financialModalBarber);
              return (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-black/60 border border-neutral-800 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        Salário Base
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        R$ {finData.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3 bg-black/60 border border-neutral-800 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        Com. Serviços ({financialModalBarber.serviceCommission ?? 50}%)
                      </span>
                      <span className="text-sm font-mono font-bold text-amber-400">
                        R$ {finData.servComm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3 bg-black/60 border border-neutral-800 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        Com. Vendas ({financialModalBarber.salesCommission ?? 10}%)
                      </span>
                      <span className="text-sm font-mono font-bold text-amber-400">
                        R$ {finData.salesComm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                        Total Pagar
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        R$ {finData.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Completed Services Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center justify-between">
                      <span>Serviços Concluídos ({finData.completedAppts.length})</span>
                      <span className="text-neutral-400">
                        Total Bruto: R${' '}
                        {finData.serviceRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </h4>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {finData.completedAppts.length === 0 ? (
                        <div className="p-4 text-center bg-black/40 border border-neutral-800 rounded-xl text-neutral-500 font-mono text-xs">
                          Nenhum serviço concluído registrado para este barbeiro.
                        </div>
                      ) : (
                        finData.completedAppts.map((appt) => (
                          <div
                            key={appt.id}
                            className="p-3 bg-black/50 border border-neutral-800 rounded-xl flex items-center justify-between text-xs font-mono"
                          >
                            <div>
                              <p className="font-bold text-white">{appt.customerName}</p>
                              <p className="text-[11px] text-neutral-400">
                                {appt.services?.map((s) => s.name).join(', ') || 'Corte / Barba'} •{' '}
                                {appt.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">R$ {appt.totalPrice?.toFixed(2)}</p>
                              <p className="text-[10px] text-amber-400">
                                Com: R${' '}
                                {(((appt.totalPrice || 0) * (financialModalBarber.serviceCommission || 50)) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirmBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-mono font-bold text-white uppercase">
              Excluir Barbeiro?
            </h3>

            <p className="text-xs text-neutral-300 font-sans">
              Tem certeza que deseja remover o cadastro de{' '}
              <strong className="text-white font-mono">{deleteConfirmBarber.name}</strong>? Esta ação
              não poderá ser desfeita.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmBarber(null)}
                className="flex-1 py-3 rounded-xl bg-neutral-900 text-neutral-300 font-mono text-xs font-bold uppercase hover:bg-neutral-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-mono text-xs font-bold uppercase hover:bg-red-700 cursor-pointer shadow-lg shadow-red-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
