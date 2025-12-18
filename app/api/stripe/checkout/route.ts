import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

const PRICING = {
  standard: {
    monthly: {
      amount: 19900,
      priceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY,
    },
    annually: {
      amount: 199000,
      priceId: process.env.STRIPE_PRICE_STANDARD_ANNUALLY,
    },
    name: "Starter Plan",
    description: "Para agencias pequeñas que comienzan.",
  },
  professional: {
    monthly: {
      amount: 34900,
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    },
    annually: {
      amount: 349900,
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUALLY,
    },
    name: "Professional Plan",
    description: "Para agencias en crecimiento.",
  },
}

export async function POST(req: Request) {
  try {
    const { plan, period } = await req.json()

    if (!plan || !period || !PRICING[plan as keyof typeof PRICING]) {
      return new NextResponse("Invalid plan or period", { status: 400 })
    }

    const planDetails = PRICING[plan as keyof typeof PRICING]
    const pricingOption = planDetails[period as "monthly" | "annually"]
    
    // Si tenemos un Price ID configurado en variables de entorno, lo usamos
    // Esto asegura que se usen los precios definidos en el dashboard de Stripe
    if (pricingOption.priceId) {
      let finalPriceId = pricingOption.priceId;

      // Si el usuario puso un Product ID (prod_...) en lugar de un Price ID, intentamos resolverlo
      if (finalPriceId.startsWith("prod_")) {
        console.log(`Detectado Product ID (${finalPriceId}) en lugar de Price ID. Buscando precio correspondiente...`);
        const prices = await stripe.prices.list({
          product: finalPriceId,
          active: true,
          limit: 10,
        });

        const targetInterval = period === "monthly" ? "month" : "year";
        const matchingPrice = prices.data.find(p => p.recurring?.interval === targetInterval);

        if (matchingPrice) {
          finalPriceId = matchingPrice.id;
          console.log(`Precio encontrado: ${finalPriceId}`);
        } else {
          console.error(`No se encontró un precio ${targetInterval} para el producto ${finalPriceId}`);
          throw new Error(`No matching price found for product ${finalPriceId} with interval ${targetInterval}`);
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/?success=true`,
        cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      })
      return NextResponse.json({ sessionId: session.id, url: session.url })
    }

    // Fallback: Crear precio al vuelo si no hay ID configurado
    const amount = pricingOption.amount
    const interval = period === "monthly" ? "month" : "year"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planDetails.name,
              description: planDetails.description,
            },
            unit_amount: amount,
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/?success=true`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Stripe error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
