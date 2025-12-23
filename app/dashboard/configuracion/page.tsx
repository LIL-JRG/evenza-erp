'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadLogo, updateCompanyName } from './actions'
import { Loader2, Upload } from 'lucide-react'
import { toast } from "sonner"
import Image from 'next/image'

export default function SettingsPage() {
  const [uploading, setUploading] = useState(false)
  const [updatingName, setUpdatingName] = useState(false)
  const [companyName, setCompanyName] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    try {
      await uploadLogo(formData)
      toast.success("Logo actualizado correctamente")
    } catch (error) {
      toast.error("Error al subir el logo")
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleNameUpdate = async () => {
      if (!companyName) return
      setUpdatingName(true)
      try {
          await updateCompanyName(companyName)
          toast.success("Nombre de la empresa actualizado")
      } catch (error) {
          toast.error("Error al actualizar el nombre")
      } finally {
          setUpdatingName(false)
      }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">Administra los detalles de tu empresa y cuenta.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none" style={{ backgroundColor: '#ECF0F3', boxShadow: '18px 18px 30px #D1D9E6, -18px -18px 30px #FFFFFF' }}>
          <CardHeader>
            <CardTitle>Logo de la Empresa</CardTitle>
            <CardDescription>
              Sube tu logo para que aparezca en el menú lateral y en tus documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="logo">Seleccionar archivo (PNG, JPG)</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="logo" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        {uploading && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>Actualiza el nombre comercial de tu organización.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="companyName">Nombre de la Empresa</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="companyName" 
                            placeholder="Ej. Mi Empresa S.A." 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <Button onClick={handleNameUpdate} disabled={updatingName || !companyName}>
                            {updatingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
