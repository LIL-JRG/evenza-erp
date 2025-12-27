// app/api/chat/tools.ts
import { 
  createCustomer, 
  createEvent, 
  getCustomers, 
  getEvents, 
  updateEvent, 
  deleteEvent,
  type CreateEventInput,
  type CreateCustomerInput
} from '@/app/dashboard/eventos/actions';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
} from '@/app/dashboard/productos/actions';

export const tools = [
  {
    type: "function",
    function: {
      name: "list_products",
      description: "Listar productos del inventario con filtros",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Búsqueda por nombre o SKU"
          },
          limit: {
            type: "number",
            description: "Límite de resultados"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description: "Crear un nuevo producto en el inventario",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre del producto" },
          description: { type: "string", description: "Descripción del producto" },
          sku: { type: "string", description: "SKU (opcional, se autogenera si no se envía)" },
          price: { type: "number", description: "Precio de renta" },
          stock: { type: "number", description: "Cantidad disponible" },
          category: { type: "string", description: "Categoría del producto" }
        },
        required: ["name", "price", "stock"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Actualizar un producto existente",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del producto" },
          name: { type: "string" },
          description: { type: "string" },
          sku: { type: "string" },
          price: { type: "number" },
          stock: { type: "number" },
          category: { type: "string" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Eliminar un producto del inventario",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del producto a eliminar" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description: "Listar categorías de productos disponibles",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_category",
      description: "Crear una nueva categoría de productos",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre de la categoría" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_earnings",
      description: "Consultar ganancias del usuario por período",
      parameters: {
        type: "object",
        properties: {
          period_type: {
            type: "string",
            enum: ["today", "yesterday", "this_week", "last_week", "this_month", "last_month", "this_year", "custom"],
            description: "Tipo de período"
          },
          start_date: {
            type: "string",
            format: "date",
            description: "Fecha de inicio para período personalizado (YYYY-MM-DD)"
          },
          end_date: {
            type: "string",
            format: "date",
            description: "Fecha de fin para período personalizado (YYYY-MM-DD)"
          }
        },
        required: ["period_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_client",
      description: "Crear un nuevo cliente en el sistema",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "Nombre completo del cliente"
          },
          email: {
            type: "string",
            description: "Correo electrónico"
          },
          phone: {
            type: "string",
            description: "Número de teléfono"
          },
          address: {
            type: "string",
            description: "Dirección física o de la empresa"
          }
        },
        required: ["full_name", "email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "register_event",
      description: "Registrar un nuevo evento o cita. REQUIERE customer_id (usa list_clients para buscarlo).",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título del evento"
          },
          customer_id: {
            type: "string",
            description: "ID del cliente (UUID)"
          },
          event_date: {
            type: "string",
            format: "date",
            description: "Fecha del evento (YYYY-MM-DD)"
          },
          start_time: {
            type: "string",
            description: "Hora de inicio (HH:MM)"
          },
          end_time: {
            type: "string",
            description: "Hora de fin (HH:MM)"
          },
          event_address: {
            type: "string",
            description: "Ubicación del evento"
          },
          total_amount: {
            type: "number",
            description: "Monto total del evento"
          },
          services: {
            type: "array",
            description: "Lista de productos del inventario para el evento",
            items: {
              type: "object",
              properties: {
                product_id: { type: "string", description: "ID del producto del inventario" },
                quantity: { type: "number", description: "Cantidad" },
                description: { type: "string", description: "Descripción opcional (color, notas)" }
              },
              required: ["product_id", "quantity"]
            }
          }
        },
        required: ["title", "customer_id", "event_date", "start_time", "end_time"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_clients",
      description: "Buscar clientes por nombre o email",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Texto para buscar en nombre o email"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_events",
      description: "Listar eventos con filtros",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Búsqueda por título"
          },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "completed", "cancelled", "all"],
            description: "Estado del evento"
          },
          limit: {
            type: "number",
            description: "Límite de resultados"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_event",
      description: "Actualizar un evento existente",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID del evento a actualizar"
          },
          title: {
            type: "string"
          },
          event_date: {
            type: "string",
            format: "date"
          },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "completed", "cancelled"]
          }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_event",
      description: "Eliminar un evento",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID del evento a eliminar"
          }
        },
        required: ["id"]
      }
    }
  }
];

export async function executeTool(toolCall: any) {
  const { name, arguments: argsRaw } = toolCall.function;
  // Parse arguments if they are a string
  const args = typeof argsRaw === 'string' ? JSON.parse(argsRaw) : argsRaw;
  
  try {
    switch (name) {
      case "get_earnings":
        // Mock implementation for now as requested to focus on CRUD
        return {
          period: args.period_type,
          total: 15000,
          currency: "MXN",
          status: "simulated"
        };
        
      case "create_client":
        const clientInput: CreateCustomerInput = {
          full_name: args.full_name || args.name, // Handle both just in case
          email: args.email,
          phone: args.phone,
          address: args.address
        };
        return await createCustomer(clientInput);
        
      case "register_event":
        try {
          // Fix timezone issue: Treat input date as UTC noon to avoid shifting back a day
          const eventDate = new Date(args.event_date);
          eventDate.setUTCHours(12, 0, 0, 0);

          // Convert products to services format
          const services = [];
          if (args.services && args.services.length > 0) {
            for (const item of args.services) {
              // Look up product name by ID
              const products = await getProducts({ limit: 100 });
              const product = products.data?.find((p: any) => p.id === item.product_id);
              if (product) {
                services.push({
                  type: product.name,
                  quantity: item.quantity,
                  description: item.description || ''
                });
              }
            }
          }

          const eventInput: CreateEventInput = {
            title: args.title,
            customer_id: args.customer_id,
            event_date: eventDate,
            start_time: args.start_time,
            end_time: args.end_time,
            event_address: args.event_address || '',
            status: 'draft', // Cambiado a 'draft' para generar cotización automática
            total_amount: args.total_amount || 0,
            services: services
          };
          const result = await createEvent(eventInput);
          return result;
        } catch (eventError: any) {
          // Detectar error de foreign key (cliente no existe)
          if (eventError.code === '23503' || eventError.message?.includes('foreign key')) {
            return {
              error: 'El cliente especificado no existe. Por favor, verifica que el cliente exista usando list_clients o créalo primero con create_client.',
              code: 'CUSTOMER_NOT_FOUND',
              customer_id: args.customer_id
            };
          }
          throw eventError;
        }
        
      case "list_clients":
        const allClients = await getCustomers();
        if (args.search) {
          const searchLower = args.search.toLowerCase();
          const filtered = allClients?.filter((c: any) =>
            c.full_name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower)
          );
          return filtered;
        }
        return allClients;
        
      case "list_events":
        return await getEvents({
          search: args.search,
          status: args.status === 'all' ? undefined : args.status,
          limit: args.limit || 5
        });

      case "update_event":
        // Fix timezone issue for update as well
        let updateDate;
        if (args.event_date) {
            updateDate = new Date(args.event_date);
            updateDate.setUTCHours(12, 0, 0, 0);
        }

        return await updateEvent({
          id: args.id,
          ...args,
          event_date: updateDate
        });

      case "delete_event":
        await deleteEvent(args.id);
        return { success: true, message: "Evento eliminado" };

      case "list_products":
        return await getProducts({
          search: args.search,
          limit: args.limit || 5
        });

      case "create_product":
        const productFormData = new FormData();
        productFormData.append('name', args.name);
        if (args.description) productFormData.append('description', args.description);
        if (args.sku) productFormData.append('sku', args.sku);
        productFormData.append('price', args.price.toString());
        productFormData.append('stock', args.stock.toString());
        if (args.category) productFormData.append('category', args.category);
        
        return await createProduct(productFormData);

      case "update_product":
        const updateProductFormData = new FormData();
        updateProductFormData.append('id', args.id);
        if (args.name) updateProductFormData.append('name', args.name);
        if (args.description) updateProductFormData.append('description', args.description);
        if (args.sku) updateProductFormData.append('sku', args.sku);
        if (args.price !== undefined) updateProductFormData.append('price', args.price.toString());
        if (args.stock !== undefined) updateProductFormData.append('stock', args.stock.toString());
        if (args.category) updateProductFormData.append('category', args.category);

        return await updateProduct(updateProductFormData);

      case "delete_product":
        await deleteProduct(args.id);
        return { success: true, message: "Producto eliminado" };

      case "get_categories":
        return await getCategories();

      case "create_category":
        return await createCategory(args.name);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Error in tool ${name}:`, error);
    return { error: error.message };
  }
}
