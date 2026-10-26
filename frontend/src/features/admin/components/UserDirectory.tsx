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
        password: newPassword.trim() || 'formula1370_123',
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
    <div className="space-y-6 font-dm text-[#121314]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#121314] tracking-tight uppercase">Gestión de Usuarios</h1>
          <p className="text-xs sm:text-sm font-medium text-[#121314]/70 mt-1">
            Directorio en tiempo real de clientes y administradores registrados.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121314] flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search Input & Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="bg-white p-2.5 rounded-2xl border-2 border-[#121314] shadow-[4px_4px_0px_#121314] max-w-md w-full">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#121314]/60 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-full py-2 pl-9 pr-4 text-xs font-bold text-[#121314] placeholder:text-[#121314]/50 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-4 py-2 rounded-full bg-white border-2 border-[#121314] font-black uppercase tracking-wider shadow-[2px_2px_0px_#121314]">
            Total: <b className="text-[#106ebe]">{users.length}</b> usuarios
          </span>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold uppercase tracking-wider text-[#121314]/70">
            Cargando usuarios desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#ff78ac] border-2 border-[#121314] text-[#121314] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[28px]">person_off</span>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#121314]">No se encontraron usuarios</h4>
              <p className="text-xs font-medium text-[#121314]/70 mt-1">
                {search ? `No hay coincidencias para "${search}".` : 'No hay usuarios registrados todavía.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#121314] text-[#121314] bg-[#f6f4ee]/70">
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Usuario</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Email</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Rol</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Teléfono</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Registrado</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Estado</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#121314]/10">
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
                    <tr key={u.id || u.email} className="hover:bg-[#f6f4ee]/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs border-2 border-[#121314] shadow-[2px_2px_0px_#121314] ${
                              isAdmin
                                ? 'bg-[#ff78ac] text-[#121314]'
                                : 'bg-[#a8d5e3] text-[#121314]'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <span className="font-black text-[#121314] uppercase block">{u.full_name || 'Sin Nombre'}</span>
                            <span className="text-[10px] font-mono text-[#121314]/60 block">ID: {u.id?.slice(0, 10) || 'usr'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[#121314] font-medium font-mono text-[11px]">{u.email}</td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#121314] ${
                            isAdmin
                              ? 'bg-[#ff78ac] text-[#121314]'
                              : 'bg-[#a8d5e3] text-[#121314]'
                          }`}
                        >
                          {isAdmin ? '👑 Administrador' : 'Cliente'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-[#121314] font-mono">{u.phone || '—'}</td>

                      <td className="py-3.5 px-3 text-[#121314]/70 font-medium">{createdDate}</td>

                      <td className="py-3.5 px-3">
                        <span className="bg-[#0ffcbe] text-[#121314] border border-[#121314] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Activo
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.email !== 'admin@formula1370.com' && u.email !== 'admin@lumina.com' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                              className="p-1.5 rounded-xl bg-white text-[#d92d20] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] hover:bg-red-50 transition-colors cursor-pointer"
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

        <div className="flex justify-between items-center text-xs font-bold text-[#121314]/70 pt-3 border-t-2 border-[#121314]/15">
          <span>Mostrando {filtered.length} de {users.length} usuarios reales</span>
          <span className="font-black text-[#121314] uppercase">Fórmula 1370 Directory</span>
        </div>
      </div>

      {/* MODAL: CREAR / INVITAR USUARIO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121314]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border-3 border-[#121314] shadow-[8px_8px_0px_#121314] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-[#121314] pb-3">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#121314]">Crear Usuario</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#121314] hover:bg-[#f6f4ee] p-1 rounded-lg border-2 border-transparent hover:border-[#121314] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mateo García"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#121314] outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="mateo@ejemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#121314] outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  placeholder="Contraseña (por defecto: formula1370_123)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#121314] outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Rol</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] rounded-xl px-3 py-2.5 text-xs font-bold w-full outline-none focus:bg-white"
                  >
                    <option value="customer">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+54 9 11..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#121314] outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t-2 border-[#121314]/15">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] font-black uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] font-black uppercase tracking-wider text-xs cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
