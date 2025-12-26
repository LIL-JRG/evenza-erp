import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: 2,
    borderBottomColor: '#1F2937', // gray-800
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  contractInfo: {
    alignItems: 'flex-end',
  },
  contractTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 5,
  },
  contractNumber: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusSigned: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoBlock: {
    flex: 1,
    paddingHorizontal: 10,
  },
  leftBlock: {
    borderLeftWidth: 4,
    borderLeftColor: '#1F2937',
  },
  rightBlock: {
    borderRightWidth: 4,
    borderRightColor: '#1F2937',
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 5,
  },
  table: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 8,
  },
  col1: { width: '45%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  totalsBox: {
    width: 200,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 9,
  },
  totalLabel: {
    color: '#666',
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#333',
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginVertical: 8,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  termsSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
    marginBottom: 3,
  },
})

interface ContractPDFProps {
  contract: any
}

export function ContractPDF({ contract }: ContractPDFProps) {
  const statusLabels = {
    pending: 'Pendiente',
    signed: 'Firmado',
    cancelled: 'Cancelado'
  }

  const companyName = contract.company?.company_name || 'Mi Empresa'
  const companyAddress = contract.company?.business_address || ''
  const companyPhone = contract.company?.phone || ''
  const companyEmail = contract.company?.email || ''

  const customerName = contract.customers?.full_name || 'Sin cliente'
  const customerEmail = contract.customers?.email || ''
  const customerPhone = contract.customers?.phone || ''
  const customerAddress = contract.customers?.address || ''

  const invoice = contract.invoices || {}
  const items = invoice.items || []
  const event = contract.events || null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  // Replace variables in terms
  const replaceVariables = (text: string) => {
    return text
      .replace(/\{nombre_empresa\}/g, companyName)
      .replace(/\{razon_social_empresa\}/g, companyName)
      .replace(/\{rfc_empresa\}/g, 'RFC de empresa')
      .replace(/\{direccion_empresa\}/g, companyAddress)
      .replace(/\{cliente_nombre\}/g, customerName)
      .replace(/\{rfc_cliente\}/g, 'RFC del cliente')
      .replace(/\{cliente_direccion\}/g, customerAddress)
      .replace(/\{cliente_email\}/g, customerEmail)
      .replace(/\{cliente_telefono\}/g, customerPhone)
      .replace(/\{evento_titulo\}/g, event?.title || 'Evento')
      .replace(/\{evento_fecha\}/g, event ? format(new Date(event.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '')
      .replace(/\{evento_ubicacion\}/g, event?.location || 'Por definir')
      .replace(/\{monto_total\}/g, formatCurrency(invoice.total || 0))
      .replace(/\{fecha_contrato\}/g, format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es }))
  }

  const termsWithVariables = replaceVariables(contract.terms_content || '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyName}</Text>
            {companyAddress && <Text style={styles.companyDetails}>{companyAddress}</Text>}
            {companyEmail && <Text style={styles.companyDetails}>Email: {companyEmail}</Text>}
            {companyPhone && <Text style={styles.companyDetails}>Tel: {companyPhone}</Text>}
          </View>

          <View style={styles.contractInfo}>
            <Text style={styles.contractTitle}>CONTRATO</Text>
            <Text style={styles.contractNumber}>{contract.contract_number}</Text>
            <View style={[
              styles.statusBadge,
              contract.status === 'pending' && styles.statusPending,
              contract.status === 'signed' && styles.statusSigned,
            ]}>
              <Text style={styles.statusText}>{statusLabels[contract.status]}</Text>
            </View>
          </View>
        </View>

        {/* Contract Info */}
        <View style={styles.infoSection}>
          <View style={[styles.infoBlock, styles.leftBlock]}>
            <Text style={styles.infoLabel}>Información del Cliente</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            {customerEmail && <Text style={styles.detailText}>Email: {customerEmail}</Text>}
            {customerPhone && <Text style={styles.detailText}>Tel: {customerPhone}</Text>}
            {customerAddress && <Text style={styles.detailText}>{customerAddress}</Text>}
          </View>

          <View style={[styles.infoBlock, styles.rightBlock]}>
            <Text style={styles.infoLabel}>Detalles del Contrato</Text>
            <Text style={styles.detailText}>
              Fecha: {format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
            <Text style={styles.detailText}>
              Nota de Venta: {invoice.invoice_number || 'N/A'}
            </Text>
            {event && (
              <>
                <Text style={styles.detailText}>Evento: {event.title}</Text>
                <Text style={styles.detailText}>
                  Fecha del evento: {format(new Date(event.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </Text>
                {event.location && (
                  <Text style={styles.detailText}>Ubicación: {event.location}</Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Services/Items */}
        {items.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Servicios Contratados</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Servicio</Text>
                <Text style={styles.col2}>Cantidad</Text>
                <Text style={styles.col3}>Precio Unit.</Text>
                <Text style={styles.col4}>Total</Text>
              </View>

              {items.map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.col1}>{item.product_name}</Text>
                  <Text style={styles.col2}>{item.quantity}</Text>
                  <Text style={styles.col3}>{formatCurrency(item.unit_price)}</Text>
                  <Text style={[styles.col4, { fontFamily: 'Helvetica-Bold' }]}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
              <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || 0)}</Text>
                </View>

                {invoice.discount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Descuento:</Text>
                    <Text style={[styles.totalValue, { color: '#DC2626' }]}>
                      -{formatCurrency(invoice.discount)}
                    </Text>
                  </View>
                )}

                <View style={styles.separator} />

                <View style={styles.grandTotal}>
                  <Text>Total:</Text>
                  <Text>{formatCurrency((invoice.subtotal || 0) - (invoice.discount || 0))}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Términos y Condiciones</Text>
          <Text style={styles.termsText}>{termsWithVariables}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Documento legal generado por Evenza ERP
          </Text>
          <Text style={styles.footerText}>
            Fecha de generación: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
