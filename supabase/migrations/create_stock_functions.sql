-- Función para decrementar el stock de un producto
CREATE OR REPLACE FUNCTION decrease_product_stock(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Actualizar el stock del producto
    UPDATE public.products
    SET
        stock = GREATEST(stock - p_quantity, 0),
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Verificar si hay suficiente stock
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar el stock de un producto (para devoluciones)
CREATE OR REPLACE FUNCTION increase_product_stock(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Actualizar el stock del producto
    UPDATE public.products
    SET
        stock = stock + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Verificar si el producto existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON FUNCTION decrease_product_stock IS 'Decrementa el stock de un producto cuando se convierte una cotización a nota de venta';
COMMENT ON FUNCTION increase_product_stock IS 'Incrementa el stock de un producto (para devoluciones o cancelaciones)';
