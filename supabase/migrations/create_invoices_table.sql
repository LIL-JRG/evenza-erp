-- Crear tabla de facturas/recibos (cotizaciones y notas de venta)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Tipo de documento
    type VARCHAR(20) NOT NULL CHECK (type IN ('quote', 'sale_note')),

    -- Estado del documento
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'cancelled')),

    -- Datos financieros
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,

    -- Items del documento (productos/servicios)
    items JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Notas y observaciones
    notes TEXT,
    internal_notes TEXT,

    -- Datos de cancelación
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT,

    -- Fecha de conversión de cotización a nota de venta
    converted_to_sale_at TIMESTAMP WITH TIME ZONE,
    converted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices para mejorar rendimiento
    CONSTRAINT valid_invoice_number CHECK (invoice_number ~ '^[A-Z]{2,4}-\d{4,8}$')
);

-- Crear índices
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoices_event_id ON public.invoices(event_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_type ON public.invoices(type);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_created_at ON public.invoices(created_at DESC);

-- Función para generar número de factura automáticamente
CREATE OR REPLACE FUNCTION generate_invoice_number(doc_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(4);
    next_num INTEGER;
    new_number VARCHAR(50);
BEGIN
    -- Determinar prefijo según tipo
    IF doc_type = 'quote' THEN
        prefix := 'COT';
    ELSIF doc_type = 'sale_note' THEN
        prefix := 'NV';
    ELSE
        prefix := 'DOC';
    END IF;

    -- Obtener el siguiente número
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(invoice_number FROM '\d+$') AS INTEGER
        )
    ), 0) + 1
    INTO next_num
    FROM public.invoices
    WHERE invoice_number LIKE prefix || '-%';

    -- Formatear número con ceros a la izquierda
    new_number := prefix || '-' || LPAD(next_num::TEXT, 6, '0');

    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- Trigger para generar invoice_number automáticamente si no se proporciona
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number(NEW.type);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Users can view their own invoices"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Users can create invoices"
    ON public.invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Users can update their own invoices"
    ON public.invoices
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Users can delete their own invoices"
    ON public.invoices
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comentarios en las tablas
COMMENT ON TABLE public.invoices IS 'Tabla de facturas, cotizaciones y notas de venta';
COMMENT ON COLUMN public.invoices.type IS 'Tipo de documento: quote (cotización) o sale_note (nota de venta)';
COMMENT ON COLUMN public.invoices.status IS 'Estado: draft, pending, completed, cancelled';
COMMENT ON COLUMN public.invoices.items IS 'Array JSON de productos/servicios incluidos en el documento';
