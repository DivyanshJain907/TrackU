import { connectDB } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    const adminEmail = process.env.ADMIN_EMAIL;
    const user = await User.findById(decoded.userId);
    
    // If user is checking their own request, allow it
    if (userId && userId === decoded.userId) {
      const accessRequests = await AccessRequest.find({ user: new mongoose.Types.ObjectId(userId) })
        .populate('user', 'username email')
        .populate('reviewedBy', 'username')
        .sort({ createdAt: -1 });
      return Response.json(accessRequests);
    }

    // Otherwise, verify user is admin
    if (!user || user.email !== adminEmail) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get all access requests with user details
    const accessRequests = await AccessRequest.find()
      .populate('user', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    return Response.json(accessRequests);
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
