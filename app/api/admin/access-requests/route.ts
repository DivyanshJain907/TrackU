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
    let accessRequests = await AccessRequest.find()
      .populate('user', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch club info separately for each user
    const accessRequestsWithClubs = await Promise.all(
      accessRequests.map(async (req: any) => {
        try {
          if (req.user?.email) {
            const userData = await User.findOne({ email: req.user.email })
              .populate('club', 'name')
              .lean();
            if (userData?.club) {
              req.user.club = userData.club;
            }
          }
        } catch (err) {
          console.error('Error fetching club info for user:', req.user?.email, err);
          // Continue even if club fetch fails
        }
        return req;
      })
    );

    return Response.json(accessRequestsWithClubs);
  } catch (error) {
    console.error('Error fetching access requests:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', errorMessage);
    console.error('Error stack:', errorStack);
    return Response.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
