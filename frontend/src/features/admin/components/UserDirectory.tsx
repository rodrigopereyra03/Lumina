import React, { useState, useEffect } from 'react'
import { usersApi } from '../../../api/usersApi'
import type { User } from '../../../store/useAuthStore'

export const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')

  // Modal State for Creating/Inviting User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [newName, setNewName] = useState<string>('')
  const [newEmail, setNewEmail] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [newRole, setNewRole] = useState<'customer' | 'admin'>('customer')
  const [newPhone, setNewPhone] = useState<string>('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await usersApi.getUsers()
      if (res.users) {
        setUsers(res.users)
      }
    } catch (e) {
      // Handled
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    try {
      await usersApi.createUser({
        full_name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim() || 'lumina123',
        role: newRole,
        phone: newPhone.trim(),
      })
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setNewPhone('')
      setIsCreateModalOpen(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${name}"?`)) {
      await usersApi.deleteUser(id)
      fetchUsers()
    }
  }

  const filtered = users.filter((u) => {
    const query = search.toLowerCase()
    return (
      (u.full_name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.role || '').toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6 font-body text-[#1b1c1c] dark:text-[#f9fafb]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] dark:text-[#f9fafb] tracking-tight">Gestión de Usuarios</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] dark:text-[#9ca3af] mt-0.5">
            Directorio en tiempo real de clientes y administradores registrados en la base de datos.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search Input & Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="glass-panel p-2 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs max-w-md w-full">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403e] dark:text-[#9ca3af] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-[#1b1c1c] dark:text-[#f9fafb] placeholder:text-[#5b403e]/70 dark:placeholder:text-[#9ca3af]/60 outline-none focus:border-[#FF4D4F]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5b403e] dark:text-[#9ca3af]">
          <span className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-white/5 border border-white dark:border-white/10 font-semibold shadow-2xs">
            Total: <b className="text-[#1b1c1c] dark:text-[#f9fafb]">{users.length}</b> usuarios
          </span>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/70 dark:border-white/10 shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#5b403e] dark:text-[#9ca3af]">
            Cargando usuarios desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#ffdad7]/40 dark:bg-[#FF4D4F]/20 text-[#FF4D4F] flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[28px]">person_off</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1b1c1c] dark:text-[#f9fafb]">No se encontraron usuarios</h4>
              <p className="text-xs text-[#5b403e] dark:text-[#9ca3af] mt-1">
                {search ? `No hay coincidencias para "${search}".` : 'No hay usuarios registrados todavía.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/60 dark:border-white/10 text-[#5b403e] dark:text-[#9ca3af]">
                  <th className="pb-3 font-semibold">Usuario</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Teléfono</th>
                  <th className="pb-3 font-semibold">Registrado</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50 dark:divide-white/10">
                {filtered.map((u) => {
                  const initial = (u.full_name || u.email || 'U').charAt(0).toUpperCase()
                  const isAdmin = u.role === 'admin'
                  const createdDate = u.created_at
                    ? new Date(u.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Reciente'

                  return (
                    <tr key={u.id || u.email} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shadow-2xs border border-white dark:border-white/10 text-white ${
                              isAdmin
                                ? 'bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F]'
                                : 'bg-gradient-to-tr from-[#6C7A89] to-[#95A5A6]'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-[#1b1c1c] dark:text-[#f9fafb] block">{u.full_name || 'Sin Nombre'}</span>
                            <span className="text-[10px] text-[#5b403e] dark:text-[#9ca3af] block">ID: {u.id?.slice(0, 10) || 'usr'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-[#5b403e] dark:text-[#9ca3af] font-medium">{u.email}</td>

                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAdmin
                              ? 'bg-[#ffdad7]/80 dark:bg-[#FF4D4F]/20 text-[#FF4D4F]'
                              : 'bg-white/80 dark:bg-white/10 text-[#5b403e] dark:text-[#9ca3af] border border-white dark:border-white/10'
                          }`}
                        >
                          {isAdmin ? '👑 Administrador' : 'Cliente'}
                        </span>
                      </td>

                      <td className="py-3.5 text-[#5b403e] dark:text-[#9ca3af]">{u.phone || '—'}</td>

                      <td className="py-3.5 text-[#5b403e] dark:text-[#9ca3af]">{createdDate}</td>

                      <td className="py-3.5">
                        <span className="bg-[#E8F8F0] dark:bg-[#4ade80]/15 text-[#1E824C] dark:text-[#4ade80] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Activo
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.email !== 'admin@lumina.com' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                              className="p-1.5 rounded-lg text-[#5b403e] dark:text-[#9ca3af] hover:text-[#ba1a1a] dark:hover:text-[#ff8a80] hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-[#5b403e] dark:text-[#9ca3af] pt-3 border-t border-white/60 dark:border-white/10">
          <span>Mostrando {filtered.length} de {users.length} usuarios reales</span>
          <span className="font-semibold text-[#1b1c1c] dark:text-[#f9fafb]">Base de Datos Lumina</span>
        </div>
      </div>

      {/* MODAL: CREAR / INVITAR USUARIO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full border border-white dark:border-white/10 shadow-xl space-y-4 bg-white/95 dark:bg-[#12151c]">
            <div className="flex justify-between items-center border-b border-white/80 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-[#1b1c1c] dark:text-[#f9fafb]">Crear / Invitar Usuario</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#5b403e] dark:text-[#9ca3af] hover:text-[#1b1c1c] dark:hover:text-[#f9fafb] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mateo García"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="mateo@ejemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  placeholder="Contraseña provisoria (por defecto: lumina123)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Rol</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="bg-white dark:bg-[#181c26] text-[#1b1c1c] dark:text-[#f9fafb] border border-white/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs w-full outline-none focus:border-[#FF4D4F]"
                  >
                    <option value="customer" className="dark:bg-[#181c26]">Cliente</option>
                    <option value="admin" className="dark:bg-[#181c26]">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+54 9 11..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5b403e] dark:text-[#9ca3af] hover:bg-white dark:hover:bg-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
