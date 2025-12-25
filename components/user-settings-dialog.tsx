'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, User, Building2, CreditCard, FileText, RotateCcw, Bell, Crown, Sparkles, ExternalLink, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserSettings,
  updateUserProfile,
  updateCompanyInfo,
  uploadCompanyLogo,
  uploadUserAvatar,
  changePassword,
  updateEmail,
  toggleIVA,
  updateContractTemplate
} from '@/app/dashboard/settings/actions'
import Image from 'next/image'

interface UserSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: string
}

export function UserSettingsDialog({ open, onOpenChange, defaultTab = 'account' }: UserSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
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
  const [legalContractTemplate, setLegalContractTemplate] = useState('')
  const [termsTemplate, setTermsTemplate] = useState('')
  const [businessEntityType, setBusinessEntityType] = useState<'legal' | 'local' | null>(null)
  const [currentPlan, setCurrentPlan] = useState('Free')
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annually'>('monthly')

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [eventReminders, setEventReminders] = useState(true)
  const [paymentReminders, setPaymentReminders] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Template editor state
  const [editingTemplate, setEditingTemplate] = useState<'legal' | 'terms' | null>(null)
  const [currentEditTemplate, setCurrentEditTemplate] = useState('')

  // Form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')

  // Default Legal Contract Template (formal with RFC, legal structure)
  const DEFAULT_LEGAL_CONTRACT = `CONTRATO DE ARRENDAMIENTO DE EQUIPO Y SERVICIOS PARA EVENTOS

CONTRATO DE ARRENDAMIENTO QUE CELEBRAN POR UNA PARTE {nombre_empresa}, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ "EL ARRENDADOR", REPRESENTADA EN ESTE ACTO POR SU REPRESENTANTE LEGAL, Y POR LA OTRA PARTE {cliente_nombre}, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ "EL ARRENDATARIO", AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:

D E C L A R A C I O N E S

I. Declara "EL ARRENDADOR":

a) Que es una empresa legalmente constituida conforme a las leyes mexicanas.
b) Que su razón social es: {razon_social_empresa}
c) Que su RFC es: {rfc_empresa}
d) Que tiene su domicilio fiscal en: {direccion_empresa}
e) Que cuenta con la capacidad legal y los recursos necesarios para celebrar el presente contrato.

II. Declara "EL ARRENDATARIO":

a) Que su nombre completo es: {cliente_nombre}
b) Que su RFC es: {rfc_cliente}
c) Que tiene su domicilio en: {cliente_direccion}
d) Que cuenta con la capacidad legal necesaria para celebrar el presente contrato.

Expuesto lo anterior, las partes otorgan las siguientes:

C L Á U S U L A S

PRIMERA. OBJETO DEL CONTRATO
Por medio del presente instrumento, "EL ARRENDADOR" se obliga a dar en arrendamiento a "EL ARRENDATARIO" y éste a su vez se obliga a tomar en arrendamiento, el siguiente equipo y servicios:

{productos_tabla}

SEGUNDA. VIGENCIA Y PLAZO
El presente contrato tendrá vigencia a partir del día {fecha_evento} a las {hora_inicio} horas y concluirá el mismo día a las {hora_fin} horas.

TERCERA. LUGAR DE PRESTACIÓN
El equipo objeto de este contrato será entregado y utilizado en: {direccion_evento}

CUARTA. CONTRAPRESTACIÓN
El monto total por concepto de arrendamiento asciende a la cantidad de {monto_total} (IVA incluido).
{descuento_info}

QUINTA. FORMA Y TÉRMINOS DE PAGO
"EL ARRENDATARIO" se obliga a pagar la cantidad estipulada en la cláusula anterior conforme a lo siguiente: {forma_pago}

SEXTA. OBLIGACIONES DEL ARRENDATARIO
a) Utilizar el equipo arrendado de manera adecuada y para los fines convenidos
b) Responder por cualquier daño, deterioro, pérdida o robo del equipo
c) Devolver el equipo en las mismas condiciones en que lo recibió, salvo el desgaste natural
d) No subarrendar ni transferir los derechos derivados de este contrato
e) Permitir la inspección del equipo por parte de "EL ARRENDADOR"

SÉPTIMA. OBLIGACIONES DEL ARRENDADOR
a) Entregar el equipo en perfectas condiciones de funcionamiento y operación
b) Proporcionar asistencia técnica durante el evento cuando sea necesario
c) Garantizar que el equipo cumple con las especificaciones acordadas

OCTAVA. GARANTÍA
"EL ARRENDATARIO" otorga como garantía del cumplimiento de sus obligaciones: {garantia}

NOVENA. RESPONSABILIDAD Y PENALIZACIONES
En caso de daño, pérdida o robo del equipo arrendado, "EL ARRENDATARIO" se obliga a cubrir el costo total de reparación o reposición del bien, según el caso.

DÉCIMA. CAUSAS DE RESCISIÓN
Serán causas de rescisión del presente contrato:
a) El incumplimiento de cualquiera de las obligaciones establecidas
b) El uso indebido del equipo arrendado
c) La falta de pago de la contraprestación

DÉCIMA PRIMERA. JURISDICCIÓN Y COMPETENCIA
Para la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a las leyes y tribunales competentes de {jurisdiccion}, renunciando a cualquier otro fuero que pudiera corresponderles.

Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, lo firman por duplicado en {ciudad}, el día {fecha_actual}.

_________________________________          _________________________________
{nombre_empresa}                           {cliente_nombre}
RFC: {rfc_empresa}                         RFC: {rfc_cliente}
"EL ARRENDADOR"                            "EL ARRENDATARIO"

---
DATOS DE CONTACTO:
{empresa_telefono}
{empresa_email}
`

  // Default Terms and Conditions Template (informal for business)
  const DEFAULT_TERMS_TEMPLATE = `TÉRMINOS Y CONDICIONES DE RENTA DE EQUIPO PARA EVENTOS

¡Gracias por confiar en {nombre_empresa}!

A continuación encontrarás los términos y condiciones para la renta de nuestro equipo y servicios:

📋 INFORMACIÓN DEL SERVICIO

Cliente: {cliente_nombre}
Fecha del evento: {fecha_evento}
Horario: {hora_inicio} - {hora_fin}
Lugar: {direccion_evento}

📦 EQUIPO Y SERVICIOS RENTADOS

{productos_tabla}

💰 INFORMACIÓN DE PAGO

Monto total: {monto_total}
{descuento_info}

📝 CONDICIONES GENERALES

1. ENTREGA Y RECOLECCIÓN
   • El equipo será entregado en la dirección del evento el día {fecha_evento}
   • La recolección se realizará al término del evento
   • Es importante que haya alguien disponible para recibir y entregar el equipo

2. USO DEL EQUIPO
   • El equipo debe ser utilizado de manera responsable y para el fin acordado
   • No se permite el subarrendamiento del equipo a terceros
   • Cualquier daño ocasionado por mal uso será responsabilidad del cliente

3. RESPONSABILIDADES
   • El cliente es responsable del equipo desde el momento de la entrega hasta la devolución
   • En caso de daño, pérdida o robo, el cliente deberá cubrir el costo de reparación o reposición
   • Se requiere dejar una garantía de: {garantia}

4. CANCELACIONES
   • Las cancelaciones deben notificarse con al menos 48 horas de anticipación
   • Cancelaciones con menos tiempo pueden generar cargos adicionales

5. SOPORTE
   • Estamos disponibles durante el evento para cualquier apoyo técnico que necesites
   • Puedes contactarnos en: {empresa_telefono}

6. DEVOLUCIÓN
   • El equipo debe ser devuelto en las mismas condiciones en que fue entregado
   • Favor de verificar que no se olvide ningún componente o accesorio

---

Al firmar este documento, acepto haber leído y estar de acuerdo con estos términos y condiciones.

Fecha: {fecha_actual}

_____________________                    _____________________
{nombre_empresa}                         {cliente_nombre}
{empresa_telefono}                       Firma del cliente
{empresa_email}
`

  // Update active tab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

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
      setLegalContractTemplate(settings.legal_contract_template || DEFAULT_LEGAL_CONTRACT)
      setTermsTemplate(settings.terms_template || DEFAULT_TERMS_TEMPLATE)
      setBusinessEntityType(settings.business_entity_type || null)
      // Map subscription_tier to plan names
      const planMapping: Record<string, string> = {
        'free': 'Free',
        'standard': 'Starter',
        'professional': 'Professional'
      }
      setCurrentPlan(planMapping[settings.subscription_tier || 'free'] || 'Free')
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTemplateEditor = (type: 'legal' | 'terms') => {
    setEditingTemplate(type)
    setCurrentEditTemplate(type === 'legal' ? legalContractTemplate : termsTemplate)
  }

  const handleResetTemplate = () => {
    if (!editingTemplate) return

    if (confirm('¿Estás seguro de que quieres resetear la plantilla a los valores por defecto? Se perderán los cambios actuales.')) {
      const defaultTemplate = editingTemplate === 'legal' ? DEFAULT_LEGAL_CONTRACT : DEFAULT_TERMS_TEMPLATE
      setCurrentEditTemplate(defaultTemplate)
      toast.success('Plantilla reseteada a valores por defecto')
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return

    try {
      if (editingTemplate === 'legal') {
        await updateContractTemplate({ legal_contract_template: currentEditTemplate })
        setLegalContractTemplate(currentEditTemplate)
      } else {
        await updateContractTemplate({ terms_template: currentEditTemplate })
        setTermsTemplate(currentEditTemplate)
      }
      toast.success('Plantilla guardada correctamente')
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Error al guardar la plantilla')
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

  const handleCheckout = async (selectedPlan: 'standard' | 'professional') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          period: selectedPeriod
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la solicitud. Por favor intenta de nuevo.')
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto gap-1 p-1">
            <TabsTrigger value="account" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Cuenta</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Facturación</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notificaciones</span>
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

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {/* Debug info - remove later */}
            {!businessEntityType && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-orange-700">
                    <strong>Debug:</strong> El tipo de entidad es: {businessEntityType === null ? 'null' : `"${businessEntityType}"`}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Por favor completa el onboarding o verifica que hayas seleccionado "Empresa Legal" o "Negocio Local" en el paso 1.
                  </p>
                </CardContent>
              </Card>
            )}

            {businessEntityType === 'legal' && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOpenTemplateEditor('legal')}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Contrato Legal</CardTitle>
                      <CardDescription>Contrato formal con estructura legal</CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-md p-3 h-32 overflow-hidden">
                    <p className="text-xs text-muted-foreground line-clamp-6 font-mono">
                      {legalContractTemplate.substring(0, 200)}...
                    </p>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                    <span>Incluye: RFC, Razón Social, Declaraciones, Cláusulas</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {businessEntityType === 'local' && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOpenTemplateEditor('terms')}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
                      <CardDescription>Formato informal para negocios</CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-md p-3 h-32 overflow-hidden">
                    <p className="text-xs text-muted-foreground line-clamp-6 font-mono">
                      {termsTemplate.substring(0, 200)}...
                    </p>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                    <span>Incluye: Condiciones generales, responsabilidades, cancelaciones</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentPlan === 'Free' && <Sparkles className="h-5 w-5 text-purple-600" />}
                  {currentPlan === 'Starter' && <Sparkles className="h-5 w-5 text-purple-600" />}
                  {currentPlan === 'Professional' && <Crown className="h-5 w-5 text-purple-600" />}
                  Plan Actual: {currentPlan}
                </CardTitle>
                <CardDescription>
                  Información de tu suscripción y facturación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {currentPlan === 'Free' && 'Plan Gratuito'}
                        {currentPlan === 'Starter' && 'Plan Starter'}
                        {currentPlan === 'Professional' && 'Plan Professional'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan === 'Free' && 'Funcionalidades básicas para comenzar'}
                        {currentPlan === 'Starter' && 'Perfecto para agencias pequeñas'}
                        {currentPlan === 'Professional' && 'Todo lo que necesitas para crecer'}
                      </p>
                    </div>
                    {currentPlan !== 'Professional' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        onClick={() => setUpgradeDialogOpen(true)}
                      >
                        Actualizar Plan
                      </Button>
                    )}
                  </div>
                </div>

                {currentPlan !== 'Free' && (
                  <div className="space-y-2">
                    <Label>Gestionar Suscripción</Label>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/stripe/portal', {
                            method: 'POST',
                          })
                          if (response.ok) {
                            const { url } = await response.json()
                            if (url) window.location.href = url
                          }
                        } catch (error) {
                          console.error('Error:', error)
                          toast.error('Error al abrir el portal de facturación')
                        }
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Portal de Facturación
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Gestiona tu método de pago, historial de facturas y cancela tu suscripción
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* IVA Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de IVA</CardTitle>
                <CardDescription>
                  Configura cómo se calcula el IVA en tus documentos
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

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones por Email</CardTitle>
                <CardDescription>
                  Configura qué notificaciones quieres recibir por correo electrónico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificaciones de Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones importantes por correo
                    </p>
                  </div>
                  <Checkbox
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event-reminders">Recordatorios de Eventos</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe recordatorios antes de tus eventos programados
                    </p>
                  </div>
                  <Checkbox
                    id="event-reminders"
                    checked={eventReminders}
                    onCheckedChange={(checked) => setEventReminders(checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-reminders">Recordatorios de Pago</Label>
                    <p className="text-sm text-muted-foreground">
                      Avisos de pagos pendientes y vencidos
                    </p>
                  </div>
                  <Checkbox
                    id="payment-reminders"
                    checked={paymentReminders}
                    onCheckedChange={(checked) => setPaymentReminders(checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Emails de Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe noticias, actualizaciones y ofertas especiales
                    </p>
                  </div>
                  <Checkbox
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={(checked) => setMarketingEmails(checked as boolean)}
                  />
                </div>

                <Button
                  onClick={() => {
                    // TODO: Implement save notifications preferences
                    toast.success('Preferencias de notificaciones guardadas')
                  }}
                  className="w-full"
                >
                  Guardar Preferencias
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Template Editor Dialog */}
      <Dialog open={editingTemplate !== null} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate === 'legal' ? 'Editar Contrato Legal' : 'Editar Términos y Condiciones'}
            </DialogTitle>
            <DialogDescription>
              Personaliza la plantilla usando las variables disponibles. Los cambios se guardarán al presionar "Guardar Plantilla".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="template-content">Contenido de la Plantilla</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetTemplate}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Resetear
                </Button>
              </div>
              <Textarea
                id="template-content"
                value={currentEditTemplate}
                onChange={(e) => setCurrentEditTemplate(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Escribe tu plantilla aquí..."
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Variables Disponibles
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Usa estas variables en tu plantilla y se reemplazarán automáticamente con los datos reales:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}nombre_empresa{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Nombre de la empresa</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}razon_social_empresa{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Razón social</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}rfc_empresa{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">RFC empresa</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}direccion_empresa{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Dirección empresa</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}empresa_telefono{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Teléfono empresa</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}empresa_email{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Email empresa</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}cliente_nombre{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Nombre del cliente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}rfc_cliente{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">RFC cliente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}cliente_direccion{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Dirección cliente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}productos_tabla{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Tabla de productos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}fecha_evento{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Fecha del evento</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}hora_inicio{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Hora de inicio</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}hora_fin{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Hora de fin</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}direccion_evento{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Lugar del evento</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}monto_total{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Monto total</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}descuento_info{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Info de descuento</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}forma_pago{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Forma de pago</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}garantia{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Garantía</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}fecha_actual{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Fecha de hoy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}ciudad{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Ciudad</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {'{'}jurisdiccion{'}'}
                    </code>
                    <span className="text-xs text-muted-foreground">Jurisdicción</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                Guardar Plantilla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto border-none"
          style={{
            backgroundColor: '#ECF0F3',
            boxShadow: '8px 8px 16px #D1D9E6, -8px -8px 16px rgba(255, 255, 255, 0.5)'
          }}
        >
          <DialogHeader>
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  backgroundColor: '#ECF0F3',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                }}
              >
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <DialogTitle className="text-3xl font-bold text-foreground">
                {currentPlan === 'Free' ? 'Elige tu Plan' : 'Actualiza a Professional'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                {currentPlan === 'Free'
                  ? 'Selecciona el plan que mejor se adapte a tu negocio'
                  : 'Desbloquea todas las funcionalidades avanzadas'}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Period Toggle */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex rounded-lg p-1"
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === 'monthly' ? 'text-white' : 'text-muted-foreground'
                }`}
                style={selectedPeriod === 'monthly' ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                } : {}}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('annually')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === 'annually' ? 'text-white' : 'text-muted-foreground'
                }`}
                style={selectedPeriod === 'annually' ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                } : {}}
              >
                Anual <span className="text-xs ml-1">(Ahorra 17%)</span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className={`grid gap-6 ${currentPlan === 'Free' ? 'md:grid-cols-2' : ''}`}>
            {/* Starter Plan - Only show if user is Free */}
            {currentPlan === 'Free' && (
              <div
                onClick={() => handleCheckout('standard')}
                className="rounded-xl p-6 cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: '#ECF0F3',
                  boxShadow: '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
                }}
              >
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                    }}
                  >
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Starter
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">
                      ${selectedPeriod === 'monthly' ? '199' : '1,990'}
                    </span>
                    <span className="text-muted-foreground">
                      /{selectedPeriod === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Perfecto para agencias pequeñas que comienzan
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Hasta 100 eventos/mes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Gestión de inventario</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Cotizaciones ilimitadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Calendario integrado</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Soporte por email</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Plan */}
            <div
              onClick={() => handleCheckout('professional')}
              className="rounded-xl p-6 cursor-pointer transition-all duration-200 relative hover:scale-105"
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
              }}
            >
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-purple-700">
                  POPULAR
                </div>
              </div>

              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{
                    backgroundColor: '#ECF0F3',
                    boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                  }}
                >
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Professional
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    ${selectedPeriod === 'monthly' ? '349' : '3,490'}
                  </span>
                  <span className="text-muted-foreground">
                    /{selectedPeriod === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
                <div className="bg-yellow-400 text-purple-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  7 DÍAS GRATIS
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Para agencias en crecimiento
                </p>
                <div className="space-y-3 text-left">
                  {currentPlan === 'Starter' && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Todo de Starter, más:</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Eventos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Chatbot IA integrado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Reportes avanzados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Integraciones API</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Soporte prioritario</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
