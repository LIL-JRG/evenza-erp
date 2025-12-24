'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, User, Building2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserSettings,
  updateUserProfile,
  updateCompanyInfo,
  uploadCompanyLogo,
  uploadUserAvatar,
  changePassword,
  updateEmail,
  toggleIVA
} from '@/app/dashboard/settings/actions'
import Image from 'next/image'

interface UserSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserSettingsDialog({ open, onOpenChange }: UserSettingsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [updatingEmail, setUpdatingEmail] = useState(false)

  // Settings state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [enableIva, setEnableIva] = useState(false)

  // Form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')

  // Load user settings when dialog opens
  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const settings = await getUserSettings()
      setName(settings.name || '')
      setEmail(settings.email || '')
      setPhone(settings.phone || '')
      setCompanyName(settings.company_name || '')
      setBusinessAddress(settings.business_address || '')
      setLogoUrl(settings.logo_url || null)
      setAvatarUrl(settings.avatar_url || null)
      setEnableIva(settings.enable_iva || false)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({ name, phone })
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
    }
  }

  const handleUpdateCompany = async () => {
    try {
      await updateCompanyInfo({ company_name: companyName, business_address: businessAddress })
      toast.success('Información de la empresa actualizada')
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error('Error al actualizar la empresa')
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    try {
      const url = await uploadCompanyLogo(formData)
      setLogoUrl(url)
      toast.success('Logo actualizado correctamente')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Error al subir el logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    try {
      const url = await uploadUserAvatar(formData)
      setAvatarUrl(url)
      toast.success('Foto de perfil actualizada')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error al subir la foto de perfil')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setChangingPassword(true)
    try {
      await changePassword(newPassword)
      toast.success('Contraseña actualizada correctamente')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Error al cambiar la contraseña')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === email) {
      toast.error('Ingresa un nuevo correo electrónico')
      return
    }

    setUpdatingEmail(true)
    try {
      const result = await updateEmail(newEmail)
      toast.success(result.message)
      setNewEmail('')
    } catch (error) {
      console.error('Error updating email:', error)
      toast.error('Error al actualizar el correo')
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handleToggleIVA = async (checked: boolean) => {
    try {
      await toggleIVA(checked)
      setEnableIva(checked)
      toast.success(checked ? 'IVA activado' : 'IVA desactivado')
    } catch (error) {
      console.error('Error toggling IVA:', error)
      toast.error('Error al actualizar IVA')
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuración de Cuenta</DialogTitle>
            <DialogDescription>
              Cargando configuración...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Cuenta</DialogTitle>
          <DialogDescription>
            Administra tu perfil, empresa y preferencias
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1 p-1">
            <TabsTrigger value="account" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Cuenta</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Facturación</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu nombre y teléfono de contacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 971 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-display">Correo Electrónico</Label>
                  <Input
                    id="email-display"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para cambiar tu correo, ve a la sección de seguridad abajo
                  </p>
                </div>
                <Button onClick={handleUpdateProfile}>
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            {/* Foto de Perfil - movido desde pestaña Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>
                  Sube tu foto de perfil que aparecerá en el menú lateral
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {avatarUrl && (
                  <div className="flex justify-center mb-4">
                    <Image
                      src={avatarUrl}
                      alt="Foto de perfil"
                      width={120}
                      height={120}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                </div>
              </CardContent>
            </Card>

            {/* Cambiar Contraseña - movido desde pestaña Security */}
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>

            {/* Cambiar Email - movido desde pestaña Security */}
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Correo Electrónico</CardTitle>
                <CardDescription>
                  Actualiza tu correo (se enviará un enlace de verificación)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-email">Correo Actual</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Nuevo Correo</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nuevo@correo.com"
                  />
                </div>
                <Button onClick={handleUpdateEmail} disabled={updatingEmail}>
                  {updatingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar Correo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>Actualiza los datos de tu negocio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la Empresa</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mi Empresa S.A."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Dirección del Negocio</Label>
                  <Input
                    id="business-address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Calle, Número, Colonia, Ciudad, Estado"
                  />
                </div>
                <Button onClick={handleUpdateCompany}>
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo de la Empresa</CardTitle>
                <CardDescription>
                  Sube el logo que aparecerá en el menú lateral y documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logoUrl && (
                  <div className="flex justify-center mb-4">
                    <Image
                      src={logoUrl}
                      alt="Logo de la empresa"
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Facturación</CardTitle>
                <CardDescription>
                  Configura cómo se generan tus cotizaciones y facturas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="iva-toggle"
                    checked={enableIva}
                    onCheckedChange={handleToggleIVA}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="iva-toggle" className="cursor-pointer">
                      Activar IVA
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir IVA (16%) en cotizaciones y notas de venta
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
