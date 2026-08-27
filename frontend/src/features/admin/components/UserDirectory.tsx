import React, { useState, useEffect } from 'react'
import { usersApi } from '../../../api/usersApi'

interface UserDirectoryItem {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Customer' | 'Premium Member'
  ordersCount: number
  totalSpent: string
  status: 'Activo' | 'Inactivo'
  avatar: string
}

const DEFAULT_USERS: UserDirectoryItem[] = [
  {
    id: 'usr-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'Premium Member',
    ordersCount: 8,
    totalSpent: '$1,890.00',
    status: 'Activo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsAngPk9rQZQjrTsirIfkWPnvlCngc9MZQOD_kJo2OHxteBApsxWzBFHZ_fqwFcjLlHiajiU3MbpxrVbUInX6XhkO3ZhM-Zm62bc8_t2j6hIGOiRkKoMOp2U2YX4M9kZVoLWnQ5mVwPFJqp_1-KZoZLotJNNwVdbcajfsMnFMiF020ITw-29dQXpxa2aCgTjujefQQV_K7k2m9xGfmgjkw8pRRbM9bGToT2Syl1OsHVbV-2182g32y'
  },
  {
    id: 'usr-2',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'Customer',
    ordersCount: 3,
    totalSpent: '$540.00',
    status: 'Activo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy79iJ6WEjNmAc9vpSg-W95zY2hkumlYPiGDYZ5jTADKAYzR3ZGNo22vVx80LFuy4C3EAJTyMspJCYwHKmVqmSe5yITs1xCij84HV_vKmeOUjGlNrfKkswsAafe5dtdfRxmNFQpjxj5sxuHnKPHSqkPBQfNj2XBOxiDd9sJyy7Oksuvu79R3ILMhVwRKhXrdbDlgxBaNXPb793h1sYTyrGZFCtQ4kNbqbRNkDkm28JizBHVw9yybJP'
  },
  {
    id: 'usr-3',
    name: 'Elena Ramos',
    email: 'elena.ramos@example.com',
    role: 'Customer',
    ordersCount: 2,
    totalSpent: '$288.00',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
  },
  {
    id: 'usr-4',
    name: 'Rodrigo López',
    email: 'rodrigo.admin@lumina.com',
    role: 'Admin',
    ordersCount: 15,
    totalSpent: '$3,420.00',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'
  }
]

export const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<UserDirectoryItem[]>(DEFAULT_USERS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersApi.getUsers()
        if (res.users && res.users.length > 0) {
          const mapped: UserDirectoryItem[] = res.users.map((u: any, idx: number) => ({
            id: u.id,
            name: u.full_name || 'Usuario Lumina',
            email: u.email,
            role: (u.role === 'admin' ? 'Admin' : u.role === 'premium' ? 'Premium Member' : 'Customer'),
            ordersCount: idx * 2 + 1,
            totalSpent: `$${(idx * 250 + 150).toFixed(2)}`,
            status: 'Activo',
            avatar: DEFAULT_USERS[idx % DEFAULT_USERS.length].avatar,
          }))
          setUsers(mapped)
        }
      } catch (e) {
        // use default state
      }
    }
    fetchUsers()
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Gestión de Usuarios</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Administra clientes, roles de acceso y actividad de compras.
          </p>
        </div>

        <button className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Invitar Usuario</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/70 shadow-xs max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403e] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/70 border border-white/80 rounded-xl py-2 pl-9 pr-4 text-xs text-[#1b1c1c] placeholder:text-[#5b403e]/70 outline-none focus:border-[#FF4D4F]"
          />
        </div>
      </div>

      {/* Users Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/60 text-[#5b403e]">
                <th className="pb-3 font-semibold">Usuario</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Rol</th>
                <th className="pb-3 font-semibold">Órdenes</th>
                <th className="pb-3 font-semibold">Gasto Total</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-white shadow-2xs"
                      />
                      <span className="font-bold text-[#1b1c1c]">{u.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 text-[#5b403e] font-medium">{u.email}</td>

                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'Admin'
                        ? 'bg-[#ffdad7]/80 text-[#FF4D4F]'
                        : u.role === 'Premium Member'
                        ? 'bg-[#FFF0EB] text-[#D97757]'
                        : 'bg-white/80 text-[#5b403e]'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 text-[#1b1c1c] font-semibold">{u.ordersCount} compras</td>

                  <td className="py-3.5 font-bold text-[#1b1c1c]">{u.totalSpent}</td>

                  <td className="py-3.5">
                    <span className="bg-[#E8F8F0] text-[#1E824C] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg text-[#5b403e] hover:text-[#FF4D4F] hover:bg-white transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="p-1.5 rounded-lg text-[#5b403e] hover:text-[#ba1a1a] hover:bg-white transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs text-[#5b403e] pt-3 border-t border-white/60">
          <span>Mostrando {filtered.length} de {users.length} usuarios registrados</span>
          <span className="font-semibold text-[#1b1c1c]">Directorio Lumina</span>
        </div>
      </div>
    </div>
  )
}
