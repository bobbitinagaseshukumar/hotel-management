import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret';

if (!process.env.RAZORPAY_KEY_ID) {
  console.warn('⚠️  Razorpay credentials not found in environment. Using dummy credentials.');
}

const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpayInstance;
