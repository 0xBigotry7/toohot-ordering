import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminSupabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

interface CreatePaymentIntentRequest {
  orderId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await req.json();
    
    if (!body.orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order from database
    const supabase = createAdminSupabase();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', body.orderId)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is in correct status for payment
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not available for payment' },
        { status: 400 }
      );
    }

    // Check if payment intent already exists
    if (order.stripe_payment_intent_id) {
      try {
        // Retrieve existing payment intent
        const existingIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        
        if (existingIntent.status === 'requires_payment_method' || 
            existingIntent.status === 'requires_confirmation') {
          return NextResponse.json({
            success: true,
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id
          });
        }
      } catch {
        console.log('Existing payment intent not found or invalid, creating new one');
      }
    }

    // Create new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total_cents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        customerEmail: order.customer_email
      },
      description: `TooHot Order ${order.order_number}`,
      receipt_email: order.customer_email,
      setup_future_usage: undefined, // Don't save payment method for future use
    });

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Payment processing error',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 