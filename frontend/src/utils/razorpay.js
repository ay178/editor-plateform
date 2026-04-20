import API from './api';

export const initiateRazorpayPayment = async ({
  amount,
  currency = 'INR',
  hiringRequestId,
  paymentType,
  userName,
  userEmail,
  onSuccess,
  onFailure
}) => {
  try {
    // Create order on backend
    const { data } = await API.post('/payment/create-order', {
      amount,
      currency,
      hiringRequestId
    });

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'EditHire',
      description: paymentType === 'advance'
        ? '50% Advance Payment'
        : 'Final Payment',
      image: 'https://i.imgur.com/n5tjHFD.png',
      order_id: data.orderId,
      handler: async (response) => {
        try {
          // Verify payment on backend
          const verifyRes = await API.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            hiringRequestId,
            amount,
            paymentType
          });

          if (verifyRes.data.success) {
            onSuccess(verifyRes.data);
          }
        } catch (err) {
          onFailure(err.response?.data?.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: userName || '',
        email: userEmail || '',
      },
      theme: {
        color: '#6366F1'
      },
      modal: {
        ondismiss: () => {
          onFailure('Payment cancelled');
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();

  } catch (err) {
    onFailure(err.response?.data?.message || 'Payment initiation failed');
  }
};