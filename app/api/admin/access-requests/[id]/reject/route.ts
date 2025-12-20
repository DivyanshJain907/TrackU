import { connectDB } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { rejectionReason } = await req.json();

    await connectDB();

    // Verify user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = await User.findById(decoded.userId);
    if (!admin || admin.email !== adminEmail) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const requestId = id;

    // Find the access request
    const accessRequest = await AccessRequest.findById(requestId);
    if (!accessRequest) {
      return Response.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    // Reject the request
    accessRequest.status = 'rejected';
    accessRequest.rejectionReason = rejectionReason || 'Not approved';
    accessRequest.reviewedBy = admin._id;
    accessRequest.reviewedAt = new Date();
    await accessRequest.save();

    return Response.json({
      message: 'Access request rejected',
      accessRequest
    });
  } catch (error) {
    console.error('Error rejecting access request:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
