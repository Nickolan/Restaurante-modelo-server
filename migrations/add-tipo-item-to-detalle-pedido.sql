-- Migration: Add tipo_item column to detalle_pedido table
-- Date: 2026-02-05
-- Description: Adds an enum column to distinguish between productos and combos

-- Step 1: Add the new column as nullable first
ALTER TABLE detalle_pedido 
ADD COLUMN tipo_item VARCHAR(20);

-- Step 2: Update existing records based on which ID is populated
-- Set tipo_item to 'producto' where producto_id is not null
UPDATE detalle_pedido 
SET tipo_item = 'producto' 
WHERE producto_id IS NOT NULL;

-- Set tipo_item to 'combo' where combo_id is not null
UPDATE detalle_pedido 
SET tipo_item = 'combo' 
WHERE combo_id IS NOT NULL;

-- Step 3: Make the column required (NOT NULL)
ALTER TABLE detalle_pedido 
ALTER COLUMN tipo_item SET NOT NULL;

-- Step 4: (Optional) Add a check constraint to ensure valid values
ALTER TABLE detalle_pedido
ADD CONSTRAINT chk_tipo_item CHECK (tipo_item IN ('producto', 'combo'));
