import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminSupabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await req.json();
    
    if (!body.paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId);
    
    if (!paymentIntent.metadata?.orderId) {
      return NextResponse.json(
        { error: 'Order ID not found in payment intent' },
        { status: 400 }
      );
    }

    const orderId = paymentIntent.metadata.orderId;

    // Get order from database  
    const supabase = createAdminSupabase();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order based on payment status
    let orderStatus: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled' = 'pending';
    let paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled' = 'pending';

    switch (paymentIntent.status) {
      case 'succeeded':
        orderStatus = 'paid';
        paymentStatus = 'succeeded';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        orderStatus = 'pending';
        paymentStatus = 'pending';
        break;
      case 'canceled':
        orderStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      default:
        // Handle failed payment or other statuses
        if (paymentIntent.status.includes('failed') || paymentIntent.last_payment_error) {
          orderStatus = 'pending';
          paymentStatus = 'failed';
        } else {
          orderStatus = 'pending';
          paymentStatus = 'pending';
        }
    }

    // Update order status and payment status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
        totalCents: updatedOrder.total_cents,
        customer: {
          email: updatedOrder.customer_email,
          firstName: updatedOrder.customer_first_name,
          lastName: updatedOrder.customer_last_name,
          phone: updatedOrder.customer_phone
        },
        createdAt: updatedOrder.created_at,
        updatedAt: updatedOrder.updated_at
      },
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    
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
        error: 'Failed to confirm payment',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 