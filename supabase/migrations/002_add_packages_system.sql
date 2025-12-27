-- =====================================================
-- MIGRACIÓN: Sistema de Paquetes
-- Fecha: 2025-12-27
-- Descripción: Permite crear paquetes que agrupan múltiples productos
--              con stock independiente y precios flexibles
-- =====================================================

-- 1. Agregar campos para paquetes en la tabla products
-- =====================================================

-- Tipo de producto: 'product' (individual) o 'package' (paquete)
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product'
  CHECK (type IN ('product', 'package'));

-- Items incluidos en el paquete (solo para type='package')
-- Formato JSON: [{"product_id": "uuid", "quantity": 5}, ...]
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_items JSONB;

-- Estrategia de precio para paquetes
-- 'fixed': Precio fijo personalizado (usa el campo 'price')
-- 'calculated': Precio calculado automáticamente sumando los productos incluidos
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_strategy TEXT DEFAULT 'fixed'
  CHECK (pricing_strategy IN ('fixed', 'calculated'));

-- Descripción adicional para paquetes (qué incluye, para qué eventos, etc.)
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_description TEXT;

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- Comentarios para documentación
COMMENT ON COLUMN products.type IS 'Tipo: product (individual) o package (paquete de productos)';
COMMENT ON COLUMN products.package_items IS 'Array JSON con productos incluidos: [{"product_id": "uuid", "quantity": number}]';
COMMENT ON COLUMN products.pricing_strategy IS 'fixed: precio personalizado, calculated: suma de productos incluidos';
COMMENT ON COLUMN products.package_description IS 'Descripción detallada del paquete para cotizaciones';

-- =====================================================
-- 2. Función para calcular precio de paquete
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_package_price(p_package_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_price DECIMAL := 0;
  v_item JSONB;
  v_product_price DECIMAL;
  v_quantity INTEGER;
BEGIN
  -- Obtener los items del paquete
  FOR v_item IN
    SELECT jsonb_array_elements(package_items)
    FROM products
    WHERE id = p_package_id AND type = 'package'
  LOOP
    -- Extraer product_id y quantity
    v_quantity := (v_item->>'quantity')::INTEGER;

    -- Obtener precio del producto
    SELECT price INTO v_product_price
    FROM products
    WHERE id = (v_item->>'product_id')::UUID;

    -- Sumar al total
    v_total_price := v_total_price + (v_product_price * v_quantity);
  END LOOP;

  RETURN v_total_price;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_package_price IS 'Calcula el precio de un paquete sumando los precios de sus productos componentes';

-- =====================================================
-- 3. Función para verificar disponibilidad de stock de paquete
-- =====================================================

CREATE OR REPLACE FUNCTION check_package_stock_availability(
  p_package_id UUID,
  p_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_required_quantity INTEGER;
  v_available_stock INTEGER;
  v_product_name TEXT;
  v_result JSONB := '{"available": true, "details": []}'::JSONB;
  v_details JSONB := '[]'::JSONB;
  v_all_available BOOLEAN := true;
BEGIN
  -- Iterar sobre los items del paquete
  FOR v_item IN
    SELECT jsonb_array_elements(package_items)
    FROM products
    WHERE id = p_package_id AND type = 'package'
  LOOP
    -- Extraer datos del item
    v_product_id := (v_item->>'product_id')::UUID;
    v_required_quantity := (v_item->>'quantity')::INTEGER * p_quantity;

    -- Obtener stock y nombre del producto
    SELECT stock, name INTO v_available_stock, v_product_name
    FROM products
    WHERE id = v_product_id;

    -- Agregar a detalles
    v_details := v_details || jsonb_build_object(
      'product_id', v_product_id,
      'product_name', v_product_name,
      'required', v_required_quantity,
      'available', v_available_stock,
      'sufficient', v_available_stock >= v_required_quantity
    );

    -- Si algún producto no tiene stock suficiente
    IF v_available_stock < v_required_quantity THEN
      v_all_available := false;
    END IF;
  END LOOP;

  -- Construir resultado
  v_result := jsonb_build_object(
    'available', v_all_available,
    'details', v_details
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_package_stock_availability IS 'Verifica si hay suficiente stock de todos los productos componentes de un paquete';

-- =====================================================
-- 4. Función para descontar stock al vender un paquete
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_package_stock(
  p_package_id UUID,
  p_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_deduct_quantity INTEGER;
  v_result JSONB := '{"success": true, "deducted_items": []}'::JSONB;
  v_deducted JSONB := '[]'::JSONB;
BEGIN
  -- Primero verificar disponibilidad
  IF NOT (check_package_stock_availability(p_package_id, p_quantity)->>'available')::BOOLEAN THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Stock insuficiente para uno o más productos del paquete'
    );
  END IF;

  -- Iterar sobre los items del paquete y descontar stock
  FOR v_item IN
    SELECT jsonb_array_elements(package_items)
    FROM products
    WHERE id = p_package_id AND type = 'package'
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_deduct_quantity := (v_item->>'quantity')::INTEGER * p_quantity;

    -- Descontar stock del producto
    UPDATE products
    SET stock = stock - v_deduct_quantity
    WHERE id = v_product_id;

    -- Registrar en resultado
    v_deducted := v_deducted || jsonb_build_object(
      'product_id', v_product_id,
      'quantity_deducted', v_deduct_quantity
    );
  END LOOP;

  -- Descontar stock del paquete mismo
  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_package_id;

  v_result := jsonb_build_object(
    'success', true,
    'deducted_items', v_deducted,
    'package_quantity_deducted', p_quantity
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION deduct_package_stock IS 'Descuenta el stock de un paquete y de todos sus productos componentes';

-- =====================================================
-- 5. Función para restaurar stock al cancelar venta de paquete
-- =====================================================

CREATE OR REPLACE FUNCTION restore_package_stock(
  p_package_id UUID,
  p_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_restore_quantity INTEGER;
  v_result JSONB;
  v_restored JSONB := '[]'::JSONB;
BEGIN
  -- Iterar sobre los items del paquete y restaurar stock
  FOR v_item IN
    SELECT jsonb_array_elements(package_items)
    FROM products
    WHERE id = p_package_id AND type = 'package'
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_restore_quantity := (v_item->>'quantity')::INTEGER * p_quantity;

    -- Restaurar stock del producto
    UPDATE products
    SET stock = stock + v_restore_quantity
    WHERE id = v_product_id;

    -- Registrar en resultado
    v_restored := v_restored || jsonb_build_object(
      'product_id', v_product_id,
      'quantity_restored', v_restore_quantity
    );
  END LOOP;

  -- Restaurar stock del paquete mismo
  UPDATE products
  SET stock = stock + p_quantity
  WHERE id = p_package_id;

  v_result := jsonb_build_object(
    'success', true,
    'restored_items', v_restored,
    'package_quantity_restored', p_quantity
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION restore_package_stock IS 'Restaura el stock de un paquete y de todos sus productos componentes (al cancelar venta)';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
--
-- 1. Estructura de package_items:
--    [
--      {"product_id": "uuid-silla-tiffany", "quantity": 50},
--      {"product_id": "uuid-mesa-redonda", "quantity": 5}
--    ]
--
-- 2. Pricing strategies:
--    - 'fixed': El campo 'price' del paquete se usa directamente
--    - 'calculated': Se calcula usando calculate_package_price()
--
-- 3. Stock management:
--    - Los paquetes tienen su propio stock independiente
--    - Al vender, se descuenta stock del paquete Y de productos individuales
--    - Esto permite rastrear cuántos paquetes pre-armados tienes
--
-- 4. Para usar en el código:
--    - Verificar stock: SELECT check_package_stock_availability('uuid', 2)
--    - Calcular precio: SELECT calculate_package_price('uuid')
--    - Descontar stock: SELECT deduct_package_stock('uuid', 1)
--    - Restaurar stock: SELECT restore_package_stock('uuid', 1)
--
-- =====================================================
