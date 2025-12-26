import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Invoice } from '@/app/dashboard/recibos/actions'

// Register fonts (optional - uses default Helvetica if not registered)
// Font.register({ family: 'Roboto', src: 'path/to/font.ttf' })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#6B21A8', // purple-800
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#6B21A8',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#6B21A8',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  statusPending: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusCompleted: {
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
    marginBottom: 25,
  },
  infoBlock: {
    flex: 1,
    paddingRight: 15,
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B21A8',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6B21A8',
    color: '#FFF',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    borderTopColor: '#E5E7EB',
    marginVertical: 8,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalLabel: {
    color: '#333',
  },
  grandTotalValue: {
    color: '#6B21A8',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
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

interface InvoicePDFProps {
  invoice: Invoice & {
    company?: {
      company_name?: string | null
      email?: string | null
      phone?: string | null
      business_address?: string | null
    }
  }
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const typeLabels = {
    quote: 'COTIZACIÓN',
    sale_note: 'NOTA DE VENTA'
  }

  const statusLabels = {
    draft: 'Borrador',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }

  const companyName = invoice.company?.company_name || 'Mi Empresa'
  const companyAddress = invoice.company?.business_address || ''
  const companyPhone = invoice.company?.phone || ''
  const companyEmail = invoice.company?.email || ''

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

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

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>{typeLabels[invoice.type]}</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={[
              styles.statusBadge,
              invoice.status === 'pending' && styles.statusPending,
              invoice.status === 'completed' && styles.statusCompleted,
            ]}>
              <Text style={styles.statusText}>{statusLabels[invoice.status]}</Text>
            </View>
          </View>
        </View>

        {/* Client & Document Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.customerName}>
              {invoice.customers?.full_name || 'Sin cliente asignado'}
            </Text>
            {invoice.customers?.email && (
              <Text style={styles.detailText}>Email: {invoice.customers.email}</Text>
            )}
            {invoice.customers?.phone && (
              <Text style={styles.detailText}>Tel: {invoice.customers.phone}</Text>
            )}
            {invoice.customers?.address && (
              <Text style={styles.detailText}>{invoice.customers.address}</Text>
            )}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Información del Documento</Text>
            <Text style={styles.detailText}>
              Fecha: {format(new Date(invoice.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
            {invoice.event && (
              <>
                <Text style={styles.detailText}>Evento: {invoice.event.title}</Text>
                <Text style={styles.detailText}>
                  Fecha del evento: {format(new Date(invoice.event.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Producto/Servicio</Text>
            <Text style={styles.col2}>Cantidad</Text>
            <Text style={styles.col3}>Precio Unit.</Text>
            <Text style={styles.col4}>Total</Text>
          </View>

          {invoice.items.map((item, index) => (
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
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
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
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.subtotal - invoice.discount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notas:</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gracias por su preferencia</Text>
          <Text style={styles.footerText}>
            Este documento fue generado automáticamente por Evenza ERP
          </Text>
        </View>
      </Page>
    </Document>
  )
}
